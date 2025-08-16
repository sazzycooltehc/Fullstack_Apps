import base64
import io
import re
from typing import Dict, Any

import cv2
import numpy as np
import easyocr
from PIL import Image

# Initialize once (avoid reloading on every request)
_reader = easyocr.Reader(["en"], gpu=False)


def _np_from_bytes(img_bytes: bytes) -> np.ndarray:
    """Decode image bytes to BGR np.ndarray. Returns None if decoding fails."""
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


def _preprocess_for_ocr(bgr_img: np.ndarray) -> np.ndarray:
    """
    Preprocess for better OCR:
      - gray
      - denoise (bilateral)
      - adaptive threshold
    Returns a single-channel thresholded image.
    """
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    th = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 5
    )
    return th


def _extract_fields(text: str) -> Dict[str, Any]:
    """Regex-based field extraction; tweak to your ID format."""
    # Try multiple DOB formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
    dob = re.search(r"\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b", text)
    # A generic ID: 6–14 alphanumerics; adjust per country
    idn = re.search(r"\b[A-Z0-9]{6,14}\b", text, flags=re.IGNORECASE)

    # Names are hard; this captures "SURNAME, Given" or two+ tokens capitalized
    name = re.search(r"\b([A-Z]{2,}(?:\s+[A-Z]{2,})+|[A-Z]{2,},\s*[A-Z][a-z]+)\b", text)

    fields = {
        "name": name.group(0) if name else "Not Found",
        "dob": dob.group(0) if dob else "Not Found",
        "id_number": idn.group(0) if idn else "Not Found",
        "raw_text": text.strip()
    }
    fields["valid"] = all(fields[k] != "Not Found" for k in ("name", "dob", "id_number"))
    return fields


def _annotate_with_boxes(bgr_img: np.ndarray, ocr_results) -> bytes:
    """
    Draw green polygons around detected text and label with recognized string.
    Returns PNG bytes.
    """
    annotated = bgr_img.copy()

    for (bbox, text, prob) in ocr_results:
        pts = np.array(bbox, dtype=np.int32)
        cv2.polylines(annotated, [pts], isClosed=True, color=(0, 255, 0), thickness=2)
        x, y = int(bbox[0][0]), int(bbox[0][1]) - 6
        cv2.putText(
            annotated, text, (x, max(y, 10)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1, cv2.LINE_AA
        )

    ok, buf = cv2.imencode(".png", annotated)
    if not ok:
        raise RuntimeError("Failed to encode annotated image.")
    return buf.tobytes()


def _b64(img_bytes: bytes) -> str:
    return base64.b64encode(img_bytes).decode("utf-8")


def _ocr_core_on_bgr(bgr_img: np.ndarray) -> Dict[str, Any]:
    """
    Core OCR pipeline on a BGR image:
      - preprocess for OCR
      - run EasyOCR on thresholded image (single-channel ok)
      - join text
      - extract fields
      - build annotated image from original color frame
    """
    if bgr_img is None or bgr_img.size == 0:
        raise ValueError("Empty/invalid image provided to OCR.")

    pre_img = _preprocess_for_ocr(bgr_img)

    # EasyOCR accepts numpy arrays; pass preprocessed (grayscale) for recognition
    ocr_results = _reader.readtext(pre_img, detail=True, paragraph=False)
    recognized_text = " ".join([t for (_, t, _) in ocr_results])

    fields = _extract_fields(recognized_text)
    annotated_png = _annotate_with_boxes(bgr_img, ocr_results)

    return {
        "valid": bool(fields["valid"]),
        "details": {
            "name": fields["name"],
            "dob": fields["dob"],
            "id_number": fields["id_number"],
            "raw_text": fields["raw_text"]
        },
        "annotated_image": _b64(annotated_png)  # base64-encoded PNG
    }


def ocr_from_image_bytes(img_bytes: bytes) -> Dict[str, Any]:
    """Entry point for Flask when the upload is an image file (bytes)."""
    bgr = _np_from_bytes(img_bytes)
    if bgr is None:
        # Fallback: try PIL decoding then convert to BGR
        pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        bgr = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return _ocr_core_on_bgr(bgr)


def ocr_from_pil(pil_img: Image.Image) -> Dict[str, Any]:
    """Entry point for Flask when the upload is a PDF page (PIL Image)."""
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")
    bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    return _ocr_core_on_bgr(bgr)

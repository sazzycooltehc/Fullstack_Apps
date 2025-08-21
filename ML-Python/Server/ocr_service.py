import easyocr
from PIL import Image
import io
import base64
import cv2
import numpy as np

# Initialize EasyOCR reader once
reader = easyocr.Reader(["en"], gpu=False)  # set gpu=True if you have CUDA

def _annotate_image(img: np.ndarray, results):
    """
    Draw bounding boxes on the image for OCR results.
    Returns base64 PNG for frontend display.
    """
    annotated = img.copy()
    for (bbox, text, prob) in results:
        pts = np.array(bbox, dtype=np.int32).reshape((-1, 1, 2))
        cv2.polylines(annotated, [pts], isClosed=True, color=(0, 255, 0), thickness=2)
        cv2.putText(
            annotated, text, tuple(pts[0][0]),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2
        )

    # Encode to base64
    _, buffer = cv2.imencode(".png", annotated)
    b64_png = base64.b64encode(buffer).decode("utf-8")
    return b64_png


def ocr_from_image_bytes(image_bytes: bytes) -> dict:
    """
    Run OCR on raw image bytes (PNG/JPG).
    Returns dict with extracted text, structured results, and annotated image.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return ocr_from_pil(img)


def ocr_from_pil(pil_img: Image.Image) -> dict:
    """
    Run OCR on a PIL image.
    Returns dict with extracted text, structured results, and annotated image.
    """
    img_cv = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    results = reader.readtext(img_cv)

    extracted_texts = [text for (_, text, _) in results]
    raw_text = " ".join(extracted_texts)

    annotated_b64 = _annotate_image(img_cv, results)

    return {
        "raw_text": raw_text,
        "details": [{"text": t, "confidence": float(p)} for (_, t, p) in results],
        "annotated_image": annotated_b64,
    }

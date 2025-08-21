from PIL import Image, ImageEnhance, ImageOps
import cv2
import numpy as np
import io

def preprocess_image(img_bytes, return_bytes=False):
    """Preprocess image for better OCR results and return NumPy array or bytes."""
    # 1. Open image
    img = Image.open(io.BytesIO(img_bytes))

    # 2. Handle transparency
    if img.mode in ("RGBA", "LA"):
        img = img.convert("RGB")

    # 3. Convert to grayscale
    img = ImageOps.grayscale(img)

    # 4. Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)

    # 5. Convert to NumPy array for OpenCV
    img_cv = np.array(img)

    # 6. Apply adaptive thresholding (binarization)
    img_cv = cv2.adaptiveThreshold(
        img_cv, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 2
    )

    # 7. Deskew
    img_cv = deskew(img_cv)

    # 8. Morphological cleanup (remove noise)
    kernel = np.ones((1, 1), np.uint8)
    img_cv = cv2.morphologyEx(img_cv, cv2.MORPH_OPEN, kernel)

    # ✅ Return as array or bytes
    if return_bytes:
        is_success, buffer = cv2.imencode(".png", img_cv)
        return io.BytesIO(buffer).getvalue()
    return img_cv

def deskew(image):
    """Deskew the image using OpenCV moments."""
    coords = np.column_stack(np.where(image > 0))
    if coords.shape[0] == 0:
        return image  # nothing to deskew

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = image.shape
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        image, M, (w, h),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated

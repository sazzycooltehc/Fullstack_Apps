from PIL import Image, ImageEnhance, ImageOps
import cv2
import numpy as np
import io

def preprocess_image(img_bytes):
    """Preprocess image for better OCR results."""
    # Open image
    img = Image.open(io.BytesIO(img_bytes))

    # 1. Convert to grayscale
    img = ImageOps.grayscale(img)

    # 2. Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)  # Increase contrast

    # 3. Convert to numpy array for OpenCV processing
    img_cv = np.array(img)

    # 4. Apply adaptive thresholding (binarization)
    img_cv = cv2.adaptiveThreshold(
        img_cv, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 2
    )

    # 5. Optional: deskew image
    img_cv = deskew(img_cv)

    # Convert back to bytes for OCR
    _, buffer = cv2.imencode(".png", img_cv)
    return buffer.tobytes()

def deskew(image):
    """Deskew the image using OpenCV moments."""
    coords = np.column_stack(np.where(image > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = image.shape
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h),
                             flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated

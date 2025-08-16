from PIL import Image, ImageEnhance, ImageOps
import cv2
import numpy as np
import io

def preprocess_image(img_bytes):
    """Preprocess image for better OCR results and return as NumPy array."""
    # 1. Open image
    img = Image.open(io.BytesIO(img_bytes))

    # 2. Convert to grayscale
    img = ImageOps.grayscale(img)

    # 3. Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)  # Boost contrast

    # 4. Convert to NumPy array for OpenCV
    img_cv = np.array(img)

    # 5. Apply adaptive thresholding (binarization)
    img_cv = cv2.adaptiveThreshold(
        img_cv, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31, 2
    )

    # 6. Deskew (optional)
    img_cv = deskew(img_cv)

    return img_cv   # ✅ Return NumPy array, not bytes

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
    rotated = cv2.warpAffine(
        image, M, (w, h),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )
    return rotated

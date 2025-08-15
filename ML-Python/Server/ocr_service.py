import easyocr
from utils.preprocess import preprocess_image
import re

reader = easyocr.Reader(['en'], gpu=False)

def validate_id_image(img_bytes):
    # Preprocess first
    processed_bytes = preprocess_image(img_bytes)

    # OCR
    results = reader.readtext(processed_bytes, detail=0)
    text_data = " ".join(results)

    # Extract fields
    name_match = re.search(r"[A-Z][a-z]+(?:\s[A-Z][a-z]+)*", text_data)
    dob_match = re.search(r"(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})", text_data)
    id_match = re.search(r"[A-Z0-9]{6,12}", text_data)

    is_valid = all([name_match, dob_match, id_match])

    return is_valid, {
        "name": name_match.group(0) if name_match else "Not Found",
        "dob": dob_match.group(0) if dob_match else "Not Found",
        "id_number": id_match.group(0) if id_match else "Not Found",
        "raw_text": text_data
    }

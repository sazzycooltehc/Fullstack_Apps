import os
import re
import json
import pandas as pd
from flask import Flask, request, jsonify
from pdf2image import convert_from_bytes
from ocr_service import ocr_from_image_bytes, ocr_from_pil
from rapidfuzz import fuzz, process

app = Flask(__name__)

# -----------------------
# Load reference dataset (CSV)
# -----------------------
REFERENCE_ROWS = []
REFERENCE_TEXTS = []

csv_path = "models/synthetic_identity_dataset_500.csv"
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        record_text = f"{row['Full_Name']} {row['DOB']} {row['ID_Type']} {row['ID_Number']} {row['Address']}"
        REFERENCE_ROWS.append(row.to_dict())
        REFERENCE_TEXTS.append(str(record_text))
else:
    print(f"⚠️ {csv_path} not found – matching disabled")

# -----------------------
# Helpers
# -----------------------
def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def best_match(text: str):
    if not REFERENCE_ROWS:
        return None, 0

    text_norm = normalize_text(text)

    best_row = None
    best_score = 0

    for row in REFERENCE_ROWS:
        # Normalize each field
        fields = {
            "Full_Name": normalize_text(str(row.get("Full_Name", ""))),
            "DOB": normalize_text(str(row.get("DOB", ""))),
            "ID_Type": normalize_text(str(row.get("ID_Type", ""))),
            "ID_Number": normalize_text(str(row.get("ID_Number", ""))),
            "Address": normalize_text(str(row.get("Address", "")))
        }

        scores = []
        for field_name, field_value in fields.items():
            if not field_value:
                continue
            # Compute multiple similarity scores
            s1 = fuzz.token_sort_ratio(text_norm, field_value)
            s2 = fuzz.token_set_ratio(text_norm, field_value)
            s3 = fuzz.partial_ratio(text_norm, field_value)
            scores.append(max(s1, s2, s3))

        if scores:
            # Weighted average: you can adjust weights if some fields matter more
            score = sum(scores) / len(scores)
            if score > best_score:
                best_score = score
                best_row = row

    return best_row, round(best_score, 2)


def run_matching(ocr_result: dict) -> dict:
    raw_text = ocr_result.get("raw_text", "")
    match, score = best_match(raw_text)

    return {
        "raw_text": raw_text,
        "best_match": match["Person_ID"] if match else None,  # or use "Full_Name"
        "similarity": score
    }

# -----------------------
# Routes
# -----------------------
@app.route("/validate", methods=["POST"])
def validate():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files["file"]
    filename = (f.filename or "").lower()
    file_bytes = f.read()

    try:
        if filename.endswith(".pdf"):
            pages = convert_from_bytes(file_bytes)
            results = {
                str(idx): run_matching(ocr_from_pil(page))
                for idx, page in enumerate(pages, start=1)
            }
            resp = {"pages": results}
        else:
            result = run_matching(ocr_from_image_bytes(file_bytes))
            resp = {"pages": {"1": result}}  # keep consistent format

        print("DEBUG RESPONSE:", json.dumps(resp, indent=2))  # 👈 safe logging
        return jsonify(resp), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

# -----------------------
# Run
# -----------------------
if __name__ == "__main__":
    app.run(debug=True)

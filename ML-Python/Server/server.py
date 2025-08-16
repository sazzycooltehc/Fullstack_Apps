from flask import Flask, request, jsonify
from pdf2image import convert_from_bytes
from ocr_service import ocr_from_image_bytes, ocr_from_pil
import io

app = Flask(__name__)

@app.route("/validate", methods=["POST"])
def validate():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files["file"]
    filename = (f.filename or "").lower()
    file_bytes = f.read()

    try:
        # PDFs -> convert each page to PIL.Image, then OCR per page
        if filename.endswith(".pdf"):
            pages = convert_from_bytes(file_bytes)  # list[PIL.Image]
            results = {}

            for idx, page in enumerate(pages, start=1):
                result = ocr_from_pil(page)  # {valid, details, annotated_image_base64}
                results[str(idx)] = result

            return jsonify({"pages": results}), 200

        # Images -> OCR directly from bytes
        else:
            result = ocr_from_image_bytes(file_bytes)  # {valid, details, annotated_image_base64}
            return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # If you call from another machine, add host="0.0.0.0"
    app.run(debug=True)

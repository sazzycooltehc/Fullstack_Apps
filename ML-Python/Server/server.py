from flask import Flask, request, jsonify
from ocr_service import validate_id_image

app = Flask(__name__)

@app.route('/validate', methods=['POST'])
def validate():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    img_bytes = file.read()
    is_valid, extracted_data = validate_id_image(img_bytes)
    return jsonify({"valid": is_valid, "details": extracted_data})

if __name__ == '__main__':
    app.run(debug=True)

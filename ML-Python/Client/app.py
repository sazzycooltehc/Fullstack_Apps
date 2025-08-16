import streamlit as st
import requests
from PIL import Image
import base64
import io

st.set_page_config(page_title="ID Card Validator", page_icon="🪪")
st.title("🪪 ID Card Validation Tool (OpenCV + EasyOCR)")

uploaded_file = st.file_uploader(
    "Upload your ID card (image or PDF)",
    type=["png", "jpg", "jpeg", "pdf"]
)

def _show_annotated(b64_png: str, caption: str):
    try:
        img_bytes = base64.b64decode(b64_png)
        st.image(Image.open(io.BytesIO(img_bytes)), caption=caption, use_container_width=True)
    except Exception as e:
        st.warning(f"Could not display annotated image: {e}")

if uploaded_file:
    if uploaded_file.type != "application/pdf":
        st.image(Image.open(uploaded_file), caption="Uploaded Image", use_container_width=True)
    else:
        st.info("📄 PDF uploaded – preview not shown here.")

    if st.button("Validate ID"):
        try:
            files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
            resp = requests.post("http://localhost:5000/validate", files=files)

            if resp.status_code != 200:
                st.error(f"Backend error: {resp.text}")
            else:
                data = resp.json()

                # Single image response
                if "valid" in data:
                    st.subheader("Result")
                    st.success("✅ ID looks valid!") if data["valid"] else st.error("❌ Could not validate ID.")
                    st.write("**Extracted Details**")
                    st.json(data.get("details", {}))

                    if "annotated_image" in data:
                        _show_annotated(data["annotated_image"], "OCR Bounding Boxes")

                # PDF response (per page)
                elif "pages" in data:
                    st.subheader("PDF Pages")
                    pages = data["pages"]
                    # pages is a dict: { "1": {valid, details, annotated_image}, ... }
                    for pg, result in pages.items():
                        st.markdown(f"### 📄 Page {pg}")
                        st.success("✅ Valid") if result.get("valid") else st.warning("⚠️ Not fully recognized")
                        st.write("**Extracted Details**")
                        st.json(result.get("details", {}))
                        if "annotated_image" in result:
                            _show_annotated(result["annotated_image"], f"OCR Boxes (Page {pg})")

                else:
                    st.warning("Unexpected response format from backend.")

        except Exception as e:
            st.error(f"Error: {e}")

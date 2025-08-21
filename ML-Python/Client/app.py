import streamlit as st
import requests
from PIL import Image
import base64
import io

st.set_page_config(page_title="ID Card Validator", page_icon="🪪")
st.title("🪪 ID Card Validation Tool (OpenCV + EasyOCR + Dataset)")

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

                if "pages" in data:  # handle both single image and PDFs the same way
                    st.subheader("Result(s)")
                    for pg, result in data["pages"].items():
                        st.markdown(f"### 📄 Page {pg}")
                        st.write("**Raw Text:**")
                        st.text(result.get("raw_text", ""))
                        st.write("**Best Match (Person_ID):**")
                        st.text(result.get("best_match", "None"))
                        st.write("**Similarity Score:**")
                        st.text(result.get("similarity", "0"))

        except Exception as e:
            st.error(f"Error: {e}")

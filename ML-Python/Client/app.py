import streamlit as st
import requests
from PIL import Image

st.set_page_config(page_title="ID Card Validator", page_icon="🪪")

st.title("🪪 ID Card Validation Tool (with OCR)")

uploaded_file = st.file_uploader("Upload your ID card image", type=["png", "jpg", "jpeg"])

if uploaded_file:
    st.image(Image.open(uploaded_file), caption="Uploaded ID Image", use_column_width=True)

    if st.button("Validate ID"):
        try:
            response = requests.post(
                "http://localhost:5000/validate",
                files={"file": uploaded_file}
            )
            data = response.json()
            if data["valid"]:
                st.success("✅ ID is valid!")
            else:
                st.error("❌ ID is invalid.")
            st.write("**Extracted Details:**")
            st.json(data["details"])
        except Exception as e:
            st.error(f"Error: {e}")

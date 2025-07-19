import streamlit as st

def file_name_finder():
    for file in st.session_state["file_uploader"]:
        return file.name
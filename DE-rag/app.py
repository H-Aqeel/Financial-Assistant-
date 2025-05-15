import os
import tempfile

import streamlit as st
import pandas as pd
from typing import List
import base64
from dotenv import load_dotenv
from io import BytesIO

# Import our utility modules
from utils import process_documents, create_vector_db, load_vector_db, create_rag_chain, ask_question

# Optional voice support
try:
    from elevenlabs import Voice, VoiceSettings, generate, play
    from elevenlabs.api import User

    ELEVENLABS_AVAILABLE = True
except ImportError as e:
    print(f"ImportError: {e}")
    ELEVENLABS_AVAILABLE = False

# Load environment variables
load_dotenv()

# Constants
DB_PATH = "./db/vector_db"
COLLECTION_NAME = "docs-financial-rag"
MODEL_NAME = "llama3.2"
ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.json']


def save_uploaded_files(uploaded_files) -> List[str]:
    """Save uploaded files and return their paths"""
    temp_dir = tempfile.mkdtemp()
    file_paths = []

    for uploaded_file in uploaded_files:
        file_extension = os.path.splitext(uploaded_file.name)[1].lower()

        if file_extension not in ALLOWED_EXTENSIONS:
            st.warning(f"Unsupported file format: {file_extension}. Skipping {uploaded_file.name}")
            continue

        temp_file_path = os.path.join(temp_dir, uploaded_file.name)
        with open(temp_file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        file_paths.append(temp_file_path)

    return file_paths


def text_to_speech(text: str, api_key: str = None) -> BytesIO:
    """Convert text to speech using ElevenLabs API"""
    if not ELEVENLABS_AVAILABLE:
        st.error("ElevenLabs package is not installed. Voice over is not available.")
        return None

    if not api_key:
        api_key = os.getenv("ELEVENLABS_API_KEY")

    if not api_key:
        st.error("ElevenLabs API key is not set. Voice over is not available.")
        return None

    try:
        import elevenlabs
        elevenlabs.set_api_key(api_key)

        try:
            voices = elevenlabs.voices()
            if not voices:
                st.error("No voices available in your ElevenLabs account")
                return None

            voice_id = voices[0].voice_id
        except Exception as voice_error:
            st.warning(f"Could not retrieve voices: {str(voice_error)}. Using default voice.")
            # Use a default voice from ElevenLabs free tier
            voice_id = "21m00Tcm4TlvDq8ikWAM"  # Adam voice (default voice)

        audio = elevenlabs.generate(
            text=text,
            voice=st.session_state.get("selected_voice_id", "21m00Tcm4TlvDq8ikWAM"),
            model="eleven_turbo_v2"
        )

        return BytesIO(audio)
    except Exception as e:
        st.error(f"Error generating voice: {str(e)}")
        return None


def get_download_link(data, filename, text):
    """Generate a download link for a file"""
    b64 = base64.b64encode(data).decode()
    href = f'<a href="data:file/txt;base64,{b64}" download="{filename}">{text}</a>'
    return href


def main():
    st.set_page_config(
        page_title="Financial Document System",
        page_icon="",
        layout="wide",
    )

    st.title("Finance Assistant")

    if 'vector_db_created' not in st.session_state:
        st.session_state.vector_db_created = False
    if 'rag_chain' not in st.session_state:
        st.session_state.rag_chain = None
    if 'last_response' not in st.session_state:
        st.session_state.last_response = ""
    if 'selected_voice_id' not in st.session_state:
        st.session_state.selected_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default voice ID (Adam)

    if os.path.exists(DB_PATH) and not st.session_state.vector_db_created:
        st.session_state.vector_db_created = True

    st.sidebar.title("Database Operations")

    db_exists = os.path.exists(DB_PATH)
    if db_exists:
        st.sidebar.success("Vector database exists! Ready to answer questions.")
    else:
        st.sidebar.warning("No vector database found. Please upload documents.")

    st.sidebar.header("Upload Documents")
    uploaded_files = st.sidebar.file_uploader(
        "Upload PDF, TXT, or JSON files",
        accept_multiple_files=True,
        type=["pdf", "txt", "json"]
    )

    with st.sidebar.expander("Advanced Options", expanded=False):
        chunk_size = st.number_input("Chunk Size", value=600, min_value=100, max_value=1000)
        chunk_overlap = st.number_input("Chunk Overlap", value=100, min_value=0, max_value=300)

    if st.sidebar.button("Process Documents & Create Database"):
        if not uploaded_files:
            st.sidebar.error("Please upload at least one document.")
        else:
            with st.sidebar.status("Processing documents..."):
                file_paths = save_uploaded_files(uploaded_files)

                if file_paths:
                    st.sidebar.text(f"Processing {len(file_paths)} documents...")
                    docs = process_documents(
                        file_paths,
                        chunk_size=chunk_size,
                        chunk_overlap=chunk_overlap
                    )

                    st.sidebar.text("Creating vector database...")
                    vector_db = create_vector_db(
                        docs,
                        persist_directory=DB_PATH,
                        collection_name=COLLECTION_NAME,
                    )

                    st.session_state.vector_db_created = True
                    st.sidebar.success(f"Vector database created with {len(docs)} chunks!")
                else:
                    st.sidebar.error("No valid documents were uploaded.")

    if st.sidebar.button("Delete Database"):
        if os.path.exists(DB_PATH):
            import shutil
            shutil.rmtree(DB_PATH)
            st.session_state.vector_db_created = False
            st.session_state.rag_chain = None
            st.sidebar.success("Database deleted successfully.")
        else:
            st.sidebar.info("No database to delete.")

    st.header("Finance Assistant")

    if st.session_state.vector_db_created and not st.session_state.rag_chain:
        with st.status("Loading RAG chain..."):
            try:
                vector_db = load_vector_db(
                    persist_directory=DB_PATH,
                    collection_name=COLLECTION_NAME,
                )

                if vector_db:
                    st.session_state.rag_chain = create_rag_chain(vector_db, MODEL_NAME)
                    st.success("Ready to answer your questions!")
                else:
                    st.error("Failed to load vector database. Please create a new one.")
            except Exception as e:
                st.error(f"Error loading database: {str(e)}")
                st.session_state.vector_db_created = False

    if st.session_state.vector_db_created:
        col1, col2 = st.columns([3, 1])

        with col1:
            question = st.text_area(
                "Enter your finance related query:",
                height=100,
                placeholder="Example: Give me stats for Pakistan Petrolum"
            )

        with col2:
            voice_enabled = st.checkbox("Enable voice output", value=ELEVENLABS_AVAILABLE)

            if voice_enabled:
                if not ELEVENLABS_AVAILABLE:
                    st.warning("ElevenLabs package is not installed. Voice output disabled.")
                    voice_enabled = False
                else:
                    api_key = None
                    if not os.getenv("ELEVENLABS_API_KEY"):
                        api_key = st.text_input("ElevenLabs API Key", type="password")
                        if api_key:
                            os.environ["ELEVENLABS_API_KEY"] = api_key

                    # Try to show available voices if API key is provided
                    if api_key or os.getenv("ELEVENLABS_API_KEY"):
                        try:
                            import elevenlabs
                            elevenlabs.set_api_key(api_key or os.getenv("ELEVENLABS_API_KEY"))
                            voices = elevenlabs.voices()
                            if voices:
                                voice_options = {voice.name: voice.voice_id for voice in voices}
                                selected_voice = st.selectbox("Select voice", options=list(voice_options.keys()))
                                st.session_state.selected_voice_id = voice_options[selected_voice]
                            else:
                                st.info("No custom voices found. Will use default voice.")
                                st.session_state.selected_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Adam (default)
                        except Exception:
                            st.info("Could not fetch voices. Will use default voice.")
                            st.session_state.selected_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Adam (default)

        if st.button("Get Results"):
            if not question:
                st.warning("Please enter a question.")
            elif not st.session_state.rag_chain:
                st.error("RAG chain is not loaded. Please create or load a database first.")
            else:
                with st.status("Generating answer..."):
                    try:
                        # Get answer from RAG chain
                        response = ask_question(st.session_state.rag_chain, question)
                        st.session_state.last_response = response
                    except Exception as e:
                        st.error(f"Error generating results: {str(e)}")

        # Display the response
        if st.session_state.last_response:
            st.subheader("Finance Result:")
            st.markdown(st.session_state.last_response)

            col1, col2 = st.columns(2)

            with col1:
                if st.button("Download Result"):
                    download_data = st.session_state.last_response.encode()
                    st.markdown(
                        get_download_link(
                            download_data,
                            "Finace_results.txt",
                            "Download Finance Result"
                        ),
                        unsafe_allow_html=True
                    )

            with col2:
                if voice_enabled and st.button("Play Voice"):
                    with st.spinner("Generating voice..."):
                        audio_data = text_to_speech(st.session_state.last_response, api_key)
                        if audio_data:
                            st.audio(audio_data, format='audio/mp3')
    else:
        st.info("Please upload documents and create a vector database to start asking questions.")

    st.markdown("---")
    st.markdown(
        "**A DE Project** - by Attqa, Rabia, Nawal and Hamna"
    )


if __name__ == "__main__":
    main()
# Medical Document RAG System

A Streamlit application that processes medical documents (PDF, TXT, JSON) and creates a Retrieval Augmented Generation (RAG) system for medical diagnosis assistance.

## Features

- Upload multiple document types (PDF, TXT, JSON)
- Process and chunk documents for optimal retrieval
- Create and manage a vector database of medical information
- Ask questions about medical diagnoses based on symptoms
- Get voice output of the diagnosis results (using ElevenLabs)
- Download diagnosis results as text files

## Prerequisites

- Python 3.8+
- Ollama (running locally with the following models):
  - llama3.2 (for LLM)
  - nomic-embed-text (for embeddings, optional)
- ElevenLabs API key (for voice output, optional)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/medical-document-rag.git
cd medical-document-rag
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your ElevenLabs API key (if you want voice functionality):
```
ELEVENLABS_API_KEY=your_api_key_here
```

## Usage

1. Start the Ollama service if it's not already running
2. Run the Streamlit app:
```bash
streamlit run app.py
```

3. Access the app through your web browser at the provided URL (typically http://localhost:8501)

4. Upload your medical documents using the file uploader in the sidebar
5. Click "Process Documents & Create Database" to create the vector database
6. Enter your medical question in the text area
7. Click "Get Diagnosis" to get an answer based on the uploaded documents
8. Optionally, download the result or play it as audio

## Project Structure

```
project_root/
├── app.py                # Main Streamlit app
├── utils/
│   ├── __init__.py
│   ├── document_processor.py  # Document loading and processing logic
│   ├── vector_db.py      # Vector database creation and management
│   └── rag_chain.py      # RAG implementation and question answering
├── .env                  # Environment variables
└── db/
    └── vector_db/        # Persistent vector database storage
```

## Dependencies

- streamlit: Web application framework
- langchain: Framework for LLM applications
- langchain_community: Community components for LangChain
- langchain_ollama: Ollama integration for LangChain
- pdfplumber: PDF processing
- fastembed: Efficient text embeddings
- chromadb: Vector database
- elevenlabs: Text-to-speech services (optional)
- python-dotenv: Environment variable management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for educational and research purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
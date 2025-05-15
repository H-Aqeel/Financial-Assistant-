from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import datetime
from werkzeug.utils import secure_filename
from utils.rag_chain import create_rag_chain
from utils.vector_db import load_vector_db, create_vector_db
from utils.summarize_chain import create_summarization_chain
from utils.document_processor import process_documents
from langchain.schema import Document



app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = './uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

current_dir = Path(__file__).parent
print(f"Current directory: {current_dir}")

project_root = current_dir.parent
sys.path.append(str(project_root))

try:
    vector_db_path = os.path.join(current_dir, "db", "vector_db")
    print(f"Looking for vector DB at: {vector_db_path}")

    if not os.path.exists(vector_db_path):
        print(f"WARNING: Vector DB directory '{vector_db_path}' does not exist!")
        os.makedirs(vector_db_path, exist_ok=True)
        print(f"Created vector DB directory at: {vector_db_path}")
    else:
        print(f"Vector DB directory found at: {vector_db_path}")
        print("Directory contents:")
        for item in os.listdir(vector_db_path):
            print(f"  - {item}")


    print("Attempting to load vector DB...")
    db = load_vector_db(vector_db_path, "docs-financial-rag")

    if db is None:
        print("ERROR: Vector DB loaded as None")
    else:
        print("Vector DB loaded successfully!")

    print("Creating summarization chain...")
    summarization_chain = create_summarization_chain(db, "gpt-4o-mini")
    qa_chain = create_rag_chain(db, "gpt-4o-mini")
    print("Summarization chain created successfully!")

except Exception as e:
    print(f"ERROR during initialization: {e}")
    import traceback
    traceback.print_exc()
    print("Continuing with a simple API...")
    db = None
    summarization_chain = None

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    if summarization_chain is None:
        return jsonify({
            'error': 'Summarization system not initialized properly',
            'fallback_response': 'The summarization system encountered an initialization error. Please check the server logs.'
        }), 500

    try:
        summary = summarization_chain.invoke({"text": text})
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get("question", "")
    document_id = data.get("document_id", "")

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    if qa_chain is None:
        return jsonify({
            'error': 'QA system not initialized properly',
            'fallback_response': 'The QA system encountered an initialization error. Please check the server logs.'
        }), 500

    try:
        print(f"Asked question: {question}")

        response = qa_chain.invoke({"question": question})

        # If response is not a string, extract the answer
        if isinstance(response, dict):
            answer = response.get('answer', str(response))
        else:
            answer = response

        print(f"Response: {answer[:500]}...")

        return jsonify({'answer': answer})
    except Exception as e:
        print(f"Error in /ask endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/add_summarized_doc', methods=['POST'])
def add_summarized_doc():
    data = request.json
    text = data.get('text', '')
    summary = data.get('summary', '')
    if not text or not summary:
        return jsonify({'error': 'Text and summary are required'}), 400

    if db is None:
        return jsonify({'error': 'Vector DB not initialized'}), 500

    try:
        summarized_doc = Document(
            page_content=summary,
            metadata={'title': 'Summarized Document', 'source': 'summarization', 'date': str(datetime.date.today())}
        )
        processed_docs = process_documents([summarized_doc])
        create_vector_db(processed_docs, vector_db_path, "docs-financial-rag")
        return jsonify({'message': 'Summarized document added to vector DB successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload_and_summarize', methods=['POST'])
def upload_and_summarize():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        print(f"Saved uploaded file to: {file_path}")

        try:
            # Process the uploaded document
            processed_docs = process_documents([file_path])
            if not processed_docs:
                return jsonify({'error': 'Failed to process document'}), 500

            # Combine all chunks into a single text for summarization
            full_text = " ".join(doc.page_content for doc in processed_docs)
            summary = summarization_chain.invoke({"text": full_text})

            # add summary to vector DB
            summarized_doc = Document(
                page_content=summary,
                metadata={'title': f'Summary of {filename}', 'source': 'summarization', 'date': str(datetime.date.today())}
            )
            create_vector_db([summarized_doc], vector_db_path, "docs-financial-rag")
            return jsonify({'summary': summary, 'message': 'File processed and summary generated'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Removed temporary file: {file_path}")

@app.route('/health', methods=['GET'])
def health_check():
    status = {
        'status': 'up',
        'summarization_initialized': summarization_chain is not None,
        'db_loaded': db is not None
    }
    return jsonify(status)

if __name__ == '__main__':
    port = 5006
    print(f"\nAPI initialized. Access the health check at: http://127.0.0.1:{port}/health")
    app.run(host='0.0.0.0', port=port, debug=True)
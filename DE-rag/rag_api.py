from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import load_vector_db, create_rag_chain, ask_question

app = Flask(__name__)
CORS(app)

db = load_vector_db("./db/vector_db", "docs-financial-rag")
rag_chain = create_rag_chain(db, "llama3.2")  # change model name if needed

@app.route('/rag', methods=['POST'])
def rag():
    query = request.json.get('query', '')
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        answer = ask_question(rag_chain, query)
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import logging
import datetime
from pathlib import Path
from utils.vector_db import load_vector_db
from utils.rag_chain import create_rag_chain, ask_question

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('rag_api.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

current_dir = Path(__file__).parent
logger.info(f"Current directory: {current_dir}")
project_root = current_dir.parent
sys.path.append(str(project_root))

# Global variables for the vector DB and RAG chain
db = None
rag_chain = None


def initialize_system():
    """Initialize the RAG system with proper error handling"""
    global db, rag_chain

    try:
        # Set up vector database path
        vector_db_path = os.path.join(current_dir, "db", "vector_db")
        logger.info(f"Looking for vector DB at: {vector_db_path}")

        if not os.path.exists(vector_db_path):
            logger.warning(f"Vector DB directory '{vector_db_path}' does not exist!")
            os.makedirs(vector_db_path, exist_ok=True)
            logger.info(f"Created vector DB directory at: {vector_db_path}")
        else:
            logger.info(f"Vector DB directory found at: {vector_db_path}")
            contents = os.listdir(vector_db_path)
            logger.info(f"Directory contents: {contents}")

        # Load the vector database
        logger.info("Attempting to load vector DB...")
        db = load_vector_db(vector_db_path, "docs-financial-rag")

        if db is None:
            logger.error("Vector DB loaded as None")
            raise ValueError("Failed to load vector database")
        else:
            logger.info("Vector DB loaded successfully!")

        # Get SerpAPI key from environment variable
        serpapi_key = os.environ.get('SERP_API_KEY')
        if not serpapi_key:
            logger.warning("No SerpAPI key found in environment variables")

        # Create RAG chain
        model_name = os.environ.get('LLM_MODEL', 'gpt-4o-mini')
        logger.info(f"Creating RAG chain with model: {model_name}")

        rag_chain = create_rag_chain(
            db,
            model_name=model_name,
            max_length=500,
            top_k=5,
            serpapi_key=serpapi_key
        )
        logger.info("RAG chain created successfully!")
        return True

    except Exception as e:
        logger.error(f"ERROR during initialization: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False


# Initialize the system at startup
system_initialized = initialize_system()


@app.route('/rag', methods=['POST'])
def rag():
    """Endpoint to process financial RAG queries"""
    query = request.json.get('query', '')
    if not query:
        logger.warning("Request received with no query")
        return jsonify({'error': 'No query provided'}), 400

    # Check if system is properly initialized
    if not system_initialized or rag_chain is None:
        logger.error("RAG system not initialized for request: " + query)
        return jsonify({
            'error': 'RAG system not initialized properly',
            'fallback_response': 'The financial information system is currently unavailable. Please try again later.'
        }), 500

    try:
        logger.info(f"Processing query: {query}")
        answer = ask_question(rag_chain, query)
        logger.info(f"Answer generated successfully ({len(answer)} chars)")

        # Return the answer with metadata for frontend use
        return jsonify({
            'answer': answer,
            'sources': {
                'vector_db_used': db is not None,
                'serp_api_used': 'Google Finance via SerpAPI' in answer
            },
            'timestamp': datetime.datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'fallback_response': 'I encountered an error processing your financial query. Please rephrase or try a different question.'
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    global db, rag_chain, system_initialized

    # try reinitializing iun case of failure
    if not system_initialized:
        logger.info("Attempting to reinitialize system during health check")
        system_initialized = initialize_system()

    status = {
        'status': 'up' if system_initialized else 'degraded',
        'rag_initialized': rag_chain is not None,
        'db_loaded': db is not None,
        'timestamp': datetime.datetime.now().isoformat(),
        'app_version': '1.0.1'
    }

    status_code = 200 if system_initialized else 503
    return jsonify(status), status_code


@app.route('/refresh', methods=['POST'])
def refresh_system():
    """Admin endpoint to refresh the RAG system"""
    global system_initialized

    # Check for admin authentication (simplified for example)
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != os.environ.get('ADMIN_API_KEY'):
        logger.warning("Unauthorized refresh attempt")
        return jsonify({'error': 'Unauthorized'}), 401

    logger.info("Manual system refresh requested")
    system_initialized = initialize_system()

    if system_initialized:
        return jsonify({'status': 'System refreshed successfully'})
    else:
        return jsonify({'error': 'System refresh failed'}), 500



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"\nFinancial RAG API initialized. Access the health check at: http://127.0.0.1:{port}/health")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
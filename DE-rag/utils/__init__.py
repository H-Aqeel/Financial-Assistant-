# Make the utils directory a proper package
from utils.document_processor import process_documents
from utils.vector_db import create_vector_db, load_vector_db
from utils.rag_chain import create_rag_chain, ask_question

__all__ = [
    'process_documents',
    'create_vector_db',
    'load_vector_db',
    'create_rag_chain',
    'ask_question'
]
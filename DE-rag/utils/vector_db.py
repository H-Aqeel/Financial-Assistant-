from pathlib import Path
import os
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings
from typing import Optional, List
from langchain.schema import Document
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def create_vector_db(documents: List[Document],
                     persist_directory: str = "./db/vector_db",
                     collection_name: str = "docs-financial-rag") -> Chroma:
    """
    Create or update a vector database from documents using Ollama embeddings.
    """
    os.makedirs(persist_directory, exist_ok=True)

    embedding_model = OllamaEmbeddings(model="nomic-embed-text")
    print("Using OllamaEmbeddings: nomic-embed-text")

    vector_db = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=persist_directory,
        collection_name=collection_name,
    )

    vector_db.persist()
    print(f"Vector DB created with {len(documents)} documents at {persist_directory}")
    return vector_db


def load_vector_db(persist_directory: str = "./db/vector_db",
                   collection_name: str = "docs-financial-rag") -> Optional[Chroma]:
    """
    Load an existing vector database using Ollama embeddings.
    """
    try:
        Path(persist_directory).mkdir(parents=True, exist_ok=True)
        print(f"Loading vector database from {persist_directory} with collection {collection_name}")

        # Initialize embedding function with Ollama
        embedding_model = OllamaEmbeddings(model="nomic-embed-text")
        print("Using OllamaEmbeddings: nomic-embed-text")

        # Initialize or load Chroma DB with the embedding function
        vector_db = Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding_model,
            collection_name=collection_name,
        )

        # Get collection stats
        count = vector_db._collection.count()
        print(f"Loaded vector database with {count} documents")

        return vector_db

    except Exception as e:
        print(f"Error loading vector database: {str(e)}")
        import traceback
        traceback.print_exc()
        return None
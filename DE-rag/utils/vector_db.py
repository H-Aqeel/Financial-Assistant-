import os
from typing import List, Optional
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings


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
    if not os.path.exists(persist_directory):
        print(f"Vector DB directory '{persist_directory}' does not exist.")
        return None

    embedding_model = OllamaEmbeddings(model="nomic-embed-text")

    try:
        vector_db = Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding_model,
            collection_name=collection_name,
        )
        print(f"Loaded vector DB from {persist_directory} with {vector_db._collection.count()} documents")
        return vector_db
    except Exception as e:
        print(f"Failed to load vector DB: {e}")
        return None

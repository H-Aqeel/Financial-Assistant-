import os
import datetime
from typing import List, Dict, Any
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import JSONLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document


def load_documents(file_paths: List[str]) -> List[Document]:
    """
    Load documents from multiple file paths.
    Supports PDF, TXT, and JSON files.

    Args:
        file_paths: List of file paths

    Returns:
        List of loaded documents
    """
    all_docs = []

    for file_path in file_paths:
        print(f"Processing file: {os.path.basename(file_path)}")

        file_extension = os.path.splitext(file_path)[1].lower()

        try:
            if file_extension == '.pdf':
                loader = PDFPlumberLoader(file_path=file_path)
                docs = loader.load_and_split()

            elif file_extension == '.txt':
                loader = TextLoader(file_path=file_path)
                docs = loader.load_and_split()

            elif file_extension == '.json':
                # For JSON files, you might need to specify the jq parameter
                # to extract the right fields depending on your JSON structure
                loader = JSONLoader(
                    file_path=file_path,
                    jq='.',  # Extract everything
                    text_content=False
                )
                docs = loader.load_and_split()

            else:
                print(f"Unsupported file format: {file_extension}")
                continue

            all_docs.extend(docs)
            print(f"Loaded {len(docs)} document chunks from {os.path.basename(file_path)}")

        except Exception as e:
            print(f"Error loading file {file_path}: {str(e)}")

    return all_docs


def chunk_documents(documents: List[Document],
                    chunk_size: int = 1200,
                    chunk_overlap: int = 300) -> List[Document]:
    """
    Split documents into smaller chunks for processing.

    Args:
        documents: List of documents to chunk
        chunk_size: Size of each chunk
        chunk_overlap: Overlap between chunks

    Returns:
        List of chunked documents
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    chunked_docs = []
    for doc in documents:
        chunks = text_splitter.split_text(doc.page_content)
        for chunk in chunks:
            # Preserve the original metadata
            chunked_docs.append(Document(
                page_content=chunk,
                metadata=doc.metadata
            ))

    return chunked_docs


def add_metadata(documents: List[Document],
                 doc_title: str = "Financial-Documents") -> List[Document]:
    """
    Add metadata to documents if not already present.

    Args:
        documents: List of documents
        doc_title: Title to use for documents

    Returns:
        List of documents with metadata
    """
    docs_with_metadata = []

    for doc in documents:
        # Start with existing metadata
        metadata = doc.metadata.copy() if hasattr(doc, 'metadata') and doc.metadata else {}

        # Add default metadata if not present
        if 'title' not in metadata:
            metadata['title'] = doc_title

        if 'author' not in metadata:
            metadata['author'] = "Group-DE"

        if 'date' not in metadata:
            metadata['date'] = str(datetime.date.today())

        # Create new document with updated metadata
        docs_with_metadata.append(Document(
            page_content=doc.page_content,
            metadata=metadata
        ))

    return docs_with_metadata


def process_documents(file_paths: List[str],
                      chunk_size: int = 1200,
                      chunk_overlap: int = 300,
                      doc_title: str = "Financial-Documents") -> List[Document]:
    """
    Main function to process documents: load, chunk, and add metadata.

    Args:
        file_paths: List of file paths to process
        chunk_size: Size of each chunk for splitting
        chunk_overlap: Overlap between chunks
        doc_title: Title to use for documents

    Returns:
        List of processed documents
    """
    # Load documents
    docs = load_documents(file_paths)

    # Chunk documents
    chunked_docs = chunk_documents(docs, chunk_size, chunk_overlap)

    # Add metadata
    processed_docs = add_metadata(chunked_docs, doc_title)

    print(f"Processed {len(processed_docs)} total chunks from {len(file_paths)} files")

    return processed_docs
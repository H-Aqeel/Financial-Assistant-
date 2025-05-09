from typing import Dict, Any
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import Chroma


def create_rag_chain(vector_db: Chroma,
                     model_name: str = "llama3.2",
                     top_k: int = 4) -> Any:
    """
    Create a deterministic, context-sensitive RAG chain for financial assistance.
    """
    # Initialize deterministic LLM (temperature=0 ensures same output for same input)
    llm = ChatOllama(model=model_name, temperature=0, top_p=1)

    # Use simple retriever (NO multi-query to avoid rephrasing)
    retriever = vector_db.as_retriever(search_kwargs={"k": top_k})

    # Updated prompt with new constrained output format
    template = """You are a financial assistant. Use ONLY the context below to provide information.

DO NOT use any external knowledge not found in the context. 
STRICTLY provide only these three sections:

1. Current Situation:
2. History Trends
3. Future Prospects:
Confidence Level: [High if direct match; Medium if suggestive; Low if further evaluation needed]

CONTEXT:
{context}

QUESTION:
{question}
"""

    prompt = ChatPromptTemplate.from_template(template)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain


def ask_question(chain: Any, question: str) -> str:
    """
    Ask a finance question using the RAG chain.
    """
    try:
        response = chain.invoke(question)
        return response
    except Exception as e:
        return f"Error generating response: {str(e)}"
from typing import Dict, Any
from langchain.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import Chroma

def create_summarization_chain(vector_db: Chroma,
                              model_name: str = "gpt-4o-mini") -> Any:
    """
    Create a summarization chain to generate concise summaries.
    """
    llm = ChatOpenAI(model=model_name, temperature=0.2)

    # Prompt for summarization
    template = """You are a financial summarization assistant. Summarize the provided text into a concise paragraph.
    Focus on key points, trends, and insights relevant to financial data. Do not add information not present in the text.

    TEXT:
    {text}
    """

    prompt = ChatPromptTemplate.from_template(template)

    chain = (
        {"text": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain

def ask_question(chain: Any, question: str) -> str:
    """
    Ask a summarization question or provide text to summarize using the chain.
    For summarization, pass the text as the question.
    """
    try:
        response = chain.invoke({"text": question})
        return response
    except Exception as e:
        return f"Error generating summary: {str(e)}"
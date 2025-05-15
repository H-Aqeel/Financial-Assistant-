from typing import Dict, Any, Optional
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def validate_api_key(api_key: str) -> bool:
    """
    Validate the SerpAPI key by making a simple request.
    """
    try:
        params = {
            "engine": "google",
            "q": "test",
            "api_key": api_key
        }
        response = requests.get("https://serpapi.com/search.json", params=params, timeout=10)
        response.raise_for_status()
        data = json.loads(response.text)
        return "error" not in data
    except Exception:
        return False


def fetch_serpapi_finance_data(query: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch Google Finance data using SerpAPI, combining multiple endpoints for comprehensive data.
    """
    api_key = api_key or os.environ.get('SERP_API_KEY',
                                        "1680d06ead92d9a969fb3706eb7c0d5e60faa82843e76ac168993a44695eddd0")

    if not api_key or not validate_api_key(api_key):
        print(f"API key validation failed")
        return {"error": "Invalid or inactive API key"}

    result_data = {
        "market_data": [],
        "stock_data": [],
        "news": []
    }

    # Fetch markets data for broader context
    try:
        markets_url = "https://serpapi.com/search.json"
        markets_params = {
            "engine": "google_finance_markets",
            "q": query,
            "trend": "indexes",
            "hl": "en",
            "api_key": api_key
        }
        markets_response = requests.get(markets_url, params=markets_params, timeout=10)
        markets_response.raise_for_status()
        markets_data = json.loads(markets_response.text)

        # Extract market indices
        markets = markets_data.get("markets", {})
        for region in markets.get("us", []):
            name = str(region.get("name", "N/A"))
            price = str(region.get("price", "N/A"))
            movement = region.get("price_movement", {})
            percentage = str(movement.get("percentage", "N/A"))
            value = str(movement.get("value", "N/A"))
            result_data["market_data"].append({
                "name": name,
                "price": price,
                "percentage": percentage,
                "value": value
            })
    except Exception as e:
        print(f"Error fetching markets data: {str(e)}")

    # Fetch specific stock data if the query looks like a stock query
    try:
        stock_url = "https://serpapi.com/search.json"
        stock_params = {
            "engine": "google_finance",
            "q": query,
            "api_key": api_key
        }
        stock_response = requests.get(stock_url, params=stock_params, timeout=10)
        stock_response.raise_for_status()
        stock_data = json.loads(stock_response.text)

        # Extract stock information
        summary = stock_data.get("summary", {})
        if summary:
            result_data["stock_data"].append({
                "title": summary.get("title", "N/A"),
                "price": summary.get("price", "N/A"),
                "change": summary.get("change", "N/A"),
                "percentage": summary.get("percentage", "N/A"),
                "timestamp": summary.get("extracted_on", "N/A")
            })

            # Extract graph data points if available
            graph = stock_data.get("graph", {})
            data_points = graph.get("data_points", [])
            if data_points:
                # Get last 5 data points for trend analysis
                recent_points = data_points[-5:] if len(data_points) > 5 else data_points
                result_data["stock_data"].append({
                    "recent_points": recent_points
                })

        # Extract news if available
        news_items = stock_data.get("news", [])
        for item in news_items[:3]:
            result_data["news"].append({
                "title": item.get("title", "N/A"),
                "source": item.get("source", "N/A"),
                "date": item.get("date", "N/A"),
                "snippet": item.get("snippet", "N/A")
            })
    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")

    return result_data


def format_serpapi_data(data: Dict[str, Any]) -> str:
    """
    Format the SerpAPI data into a readable string format.
    """
    if "error" in data:
        return f"Error: {data['error']}"

    result = []

    # Format market data
    if data["market_data"]:
        result.append("## Market Data")
        for item in data["market_data"]:
            result.append(f"- {item['name']}: ${item['price']} ({item['percentage']}% {item['value']})")

    # Format stock data
    if data["stock_data"]:
        result.append("\n## Stock Data")
        for item in data["stock_data"]:
            if "title" in item:
                result.append(f"- {item['title']}: ${item['price']} ({item['percentage']} {item['change']})")
                result.append(f"  Last updated: {item['timestamp']}")
            elif "recent_points" in item:
                result.append("- Recent price points (last 5):")
                for point in item["recent_points"]:
                    result.append(f"  * {point}")

    # Format news
    if data["news"]:
        result.append("\n## Recent News")
        for item in data["news"]:
            result.append(f"- {item['title']} ({item['source']}, {item['date']})")
            result.append(f"  {item['snippet']}")

    return "\n".join(result) if result else "No financial data found."


def create_rag_chain(vector_db: Chroma,
                     model_name: str = "gpt-4o-mini",
                     max_length: int = 500,
                     top_k: int = 4,
                     serpapi_key: Optional[str] = None) -> Any:
    """
    Create an enhanced RAG chain with SerpAPI Google Finance integration.
    """
    llm = ChatOpenAI(
        model=model_name,
        temperature=0.2,
        top_p=0.9,
        openai_api_key=os.environ.get('OPENAI_API_KEY', '')
    )

    retriever = vector_db.as_retriever(search_kwargs={"k": top_k})

    template = """You are an advanced financial assistant providing accurate, actionable insights. Your goal is to deliver clear, structured information that is directly viewable and easy to understand.

    INSTRUCTIONS:
    1. Answer the user's question in maximum {max_length} characters.
    2. Use ONLY the information provided in the CONTEXT and SERPAPI_DATA sections.
    3. Prioritize the most recent data, especially from SERPAPI_DATA if available.
    4. Format responses for immediate visual clarity (not Markdown code). This means:
       - Display bold text normally as emphasized words, without **symbols**
       - Use bulleted or numbered lists with proper indentation
       - Headings should look like section headers (do not use # or ### symbols)
       - Render the response as if shown in a UI or webpage — clean and formatted
       - Do not include any source citations, even if present in the data
       - Render proper HTML.

    5. For financial metrics, include when available:
       - Current price and percentage change
       - Market capitalization
       - P/E ratio or other valuation metrics
       - Revenue and growth rates
       - Sector performance compared to indices
       - Notable recent events impacting performance

    6. If the question involves investment:
       - Include current price and recent changes
       - Mention market and sector trends
       - Highlight competitive position and related news
       - Present both risks and opportunities
       - Avoid giving any buy/sell recommendation

    7. If no answer is found, say:  
       "I don't have specific information about [topic]"
       
       Example:
       Q: What is Apple’s revenue?
       A: Apple’s Q1 2025 revenue was 89.5 billion USD, up 12% YoY.

    CONTEXT:
    {context}

    SERPAPI_DATA:
    {serpapi_data}

    QUESTION:
    {question}
    """

    prompt = ChatPromptTemplate.from_template(template)

    def fetch_combined_context(inputs: Dict[str, Any]) -> Dict[str, Any]:
        question = str(inputs["question"])
        context = ""

        # First retrieve information from vector database
        try:
            context_docs = retriever.invoke(question)
            if isinstance(context_docs, list) and context_docs:
                context = "\n".join(
                    [str(doc.page_content) if hasattr(doc, 'page_content') else str(doc) for doc in context_docs]
                )
            elif isinstance(context_docs, str):
                context = context_docs

            print(f"Vector DB context retrieved: {len(context)} characters")
        except Exception as e:
            print(f"Retriever error: {str(e)}")
            context = "Error retrieving context from vector database."

        # Fetch SerpAPI data regardless of context availability for up to date results

        serpapi_data = ""
        try:
            raw_finance_data = fetch_serpapi_finance_data(question, serpapi_key)
            serpapi_data = format_serpapi_data(raw_finance_data)
            print(f"SerpAPI data retrieved: {len(serpapi_data)} characters")
        except Exception as e:
            print(f"SerpAPI error: {str(e)}")
            serpapi_data = "Error retrieving financial data from Google Finance."

        return {
            "context": str(context),
            "serpapi_data": str(serpapi_data),
            "question": question,
            "max_length": str(max_length)
        }

    # Build the chain
    chain = (
            fetch_combined_context
            | prompt
            | llm
            | StrOutputParser()
    )

    return chain


def ask_question(chain: Any, question: str) -> str:
    """
    Ask a finance question using the enhanced RAG chain.
    """
    try:
        print(f"Processing question: {question}")
        response = chain.invoke({"question": question})
        return response
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        import traceback
        traceback.print_exc()
        return "I encountered an error while processing your financial query. Please try again with a more specific question about market trends, stock performance, or financial metrics."
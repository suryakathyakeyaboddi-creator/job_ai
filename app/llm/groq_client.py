import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# ===============================
# Configuration
# ===============================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

if not GROQ_API_KEY:
    raise RuntimeError("❌ GROQ_API_KEY is missing. Check your .env file.")

# LLM Call Function 
def call_groq_llm(
    user_prompt: str,
    system_prompt: str = "You are an expert AI assistant.",
    temperature: float = 0.3,
    max_tokens: int = 512,
):
    """
    Centralized Groq LLM call.
    All backend intelligence must go through this function.
    """

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"❌ Network error while calling Groq API: {e}")

    # Handle non-200 responses clearly
    if response.status_code != 200:
        print("❌ GROQ ERROR STATUS:", response.status_code)
        print("❌ GROQ ERROR BODY:", response.text)
        raise RuntimeError("Groq API call failed")

    data = response.json()

    # Safety check for response structure
    if "choices" not in data or not data["choices"]:
        print("❌ Invalid Groq response format:", data)
        raise RuntimeError("Invalid Groq response format")

    return data["choices"][0]["message"]["content"]


import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

MODEL_NAME = "gemma-4-26b-a4b-it"


def analyze_complaint(description):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("Gemma API key is missing.")

    client = genai.Client(api_key=api_key)

    prompt = f"""
    You are FixGenie, a campus maintenance assistant.

    Analyze this student complaint:
    {description}

    Return:
    Category:
    Urgency: Low, Medium, High, or Critical
    Recommendation:

    For electrical hazards, fire, gas leaks, or similar dangers,
    prioritize safety and advise contacting campus staff promptly.
    Never recommend dangerous DIY repairs.
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return response.text

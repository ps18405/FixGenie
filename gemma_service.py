
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def analyze_complaint(description):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("API key missing in .env")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemma-4-26b-a4b-it",
        contents=(
            "Analyze this campus maintenance complaint: "
            + description
            + ". Give its category, urgency, and safe next action."
        ),
    )

    return response.text

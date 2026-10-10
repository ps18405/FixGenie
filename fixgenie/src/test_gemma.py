
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "API key missing. Check your .env file."
    )

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemma-4-26b-a4b-it",
    contents=(
        "You are FixGenie's AI assistant. "
        "A classroom has a water leak. "
        "Give the category, urgency, and safe next action."
    ),
)

print("Gemma 4 response:")
print(response.text)

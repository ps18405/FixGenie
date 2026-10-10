import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("Check your .env file and API key")

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemma-4-26b-a4b-it",
    contents="A classroom has a water leak. "
             "Classify the issue and suggest a safe next action."
)

print(response.text)
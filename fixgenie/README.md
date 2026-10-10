# FixGenie 🛠️

### AI-Powered Campus Maintenance Reporting and Tracking

FixGenie is a campus maintenance platform designed to help students report infrastructure problems such as water leakage, broken lights, damaged furniture, Wi-Fi issues, and water supply problems.

It integrates **Gemma 4** to analyze maintenance complaints and provide AI-generated insights that can help users understand the issue and determine an appropriate next action.

## ✨ Features

- **AI-powered complaint analysis:** Uses Gemma 4 to analyze complaint descriptions.
- **Maintenance reporting:** Designed for reporting campus infrastructure issues.
- **Issue tracking:** Designed to help students and maintenance teams follow complaint progress.
- **Campus-focused solution:** Aims to improve communication between students and campus maintenance teams.

> Note: Only describe features as completed after verifying that they work in the current application.

## 🤖 AI Integration

FixGenie uses Gemma 4 through the Google Gen AI Python SDK.

The backend sends a complaint description to the model and displays its generated analysis, including relevant category, urgency, and a suggested safe next action.

## 🧰 Tech Stack

- Frontend: React, Vite
- Backend: Python, Flask
- AI: Gemma 4
- Database: SQLite (if enabled in your implementation)
- API communication: HTTP/JSON

## 📁 Project Structure

```text
FixGenie/
├── app.py
├── gemma_service.py
├── test_gemma.py
├── .env
├── .gitignore
├── README.md
├── LICENSE
└── fixgenie/
    ├── package.json
    └── src/
        └── App.jsx
```

The structure above is illustrative. Your actual files may differ.

## ⚙️ Setup and Installation

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- A Google AI API key with access to the configured model

### 1. Clone the repository

```bash
git clone YOUR_PUBLIC_GITHUB_REPOSITORY_URL
cd FixGenie
```

Replace the URL with your actual public repository URL.

### 2. Set up the Python backend

```bash
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
python -m pip install flask flask-cors google-genai python-dotenv
```

### 3. Configure your API key

Create a `.env` file in the backend directory:

```text
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Replace the placeholder with your own API key. Never commit the real key to GitHub.

### 4. Start the backend

```bash
python app.py
```

The Flask backend should run at:

```text
http://127.0.0.1:5000
```

### 5. Start the frontend

Open another terminal:

```bash
cd fixgenie
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| POST | `/api/analyze` | Analyze a complaint using Gemma 4 |

Example request body for `/api/analyze`:

```json
{
  "description": "Water is leaking from the hostel bathroom ceiling."
}
```

## 🔐 Security

- Store API keys in environment variables.
- Keep `.env` out of version control.
- Never expose backend API keys in React code.
- Validate and handle user input safely.

## 🌱 Future Improvements

- Student and administrator authentication
- Persistent complaint storage
- Complaint status tracking
- Upvotes and comments
- Maintenance team dashboard
- Notifications for status updates

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 👥 Team

Built as a campus-focused hackathon project.

Contributions and feedback are welcome.
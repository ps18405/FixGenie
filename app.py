
from flask import Flask, request, jsonify
from flask_cors import CORS
from gemma_service import analyze_complaint

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "Gemma 4"})

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    description = data.get("description", "").strip()

    if not description:
        return jsonify({"error": "Enter a complaint description."}), 400

    if len(description) > 3000:
        return jsonify({"error": "Complaint is too long."}), 400

    try:
        result = analyze_complaint(description)
        return jsonify({
            "success": True,
            "analysis": result,
            "model": "Gemma 4"
        })
    except Exception:
        app.logger.exception("Gemma analysis failed")
        return jsonify({
            "success": False,
            "error": "AI analysis is temporarily unavailable."
        }), 502

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

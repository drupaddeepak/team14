from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
DWANI_API_KEY = os.getenv('DWANI_API_KEY')
DWANI_API_BASE_URL = os.getenv('DWANI_API_BASE_URL', 'https://dwani-amoghavarsha.hf.space')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        language = data.get('language', 'en')
        model = data.get('model', 'indic-llm')
        
        # Get the latest user message
        user_message = messages[-1]['content'] if messages else ""
        
        # Prepare the system prompt
        system_prompt = f"""You are Sarathi AI, a helpful government assistant designed to help people understand and fill out government forms in {language}. You specialize in:

1. Analyzing government forms and documents
2. Providing step-by-step guidance on how to fill out forms
3. Explaining required documents and eligibility criteria
4. Answering questions about government procedures
5. Supporting multiple Indian languages

Guidelines:
- Be patient and explain things in simple terms
- Provide practical, actionable advice
- If you're unsure about specific legal requirements, advise consulting official sources
- Be culturally sensitive and respectful
- Use clear, numbered steps when explaining processes
- Mention required documents and where to obtain them
- Respond in {language} language when appropriate"""

        headers = {
            "Authorization": f"Bearer {DWANI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(f"{DWANI_API_BASE_URL}/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        
        return jsonify(response.json())
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 
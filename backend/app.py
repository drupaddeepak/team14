from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import logging
import dwani
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get API key from environment variable
dwani.api_key = 'drupadd.22.beis@acharya.ac.in__dwani'
dwani.api_base = 'https://dwani-amoghavarsha.hf.space'

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        language = data.get('language', 'en')
        model = data.get('model', 'indic-llm')
        
        # Get the last user message
        last_user_message = next((msg['content'] for msg in reversed(messages) if msg['role'] == 'user'), '')
        
        logger.info(f"Processing chat request - Language: {language}, Model: {model}")
        logger.info(f"User message: {last_user_message}")
        
        # Map language codes to Dwani format
        lang_map = {
            'en': 'eng_Latn',
            'hi': 'hin_Deva',
            'kn': 'kan_Knda',
            'ta': 'tam_Taml',
            'te': 'tel_Telu',
            'bn': 'ben_Beng',
            'gu': 'guj_Gujr',
            'mr': 'mar_Deva',
            'pa': 'pan_Guru',
            'or': 'ory_Orya'
        }
        
        src_lang = lang_map.get(language, 'eng_Latn')
        tgt_lang = lang_map.get(language, 'eng_Latn')
        
        response = dwani.Chat.create(
            prompt=last_user_message,
            src_lang=src_lang,
            tgt_lang=tgt_lang
        )
        
        logger.info("Successfully received response from Dwani API")
        logger.info(f"Raw Dwani response: {response}")
        
        # Format response to match what useChat expects
        formatted_response = {
            'id': f'chatcmpl-{hash(response["response"])}',
            'object': 'chat.completion',
            'created': int(time.time()),
            'model': model,
            'choices': [{
                'index': 0,
                'message': {
                    'role': 'assistant',
                    'content': response['response']
                },
                'finish_reason': 'stop'
            }]
        }
        
        logger.info(f"Formatted response: {formatted_response}")
        return jsonify(formatted_response)
    
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {str(e)}")
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True, port=5000, host='0.0.0.0') 
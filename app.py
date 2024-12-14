from flask import Flask, request, jsonify, render_template, send_from_directory
from openai import OpenAI
import os
from dotenv import load_dotenv
from template import prompt_template, system_prompt

app = Flask(__name__, 
    static_url_path='',
    static_folder='static',    
    template_folder='templates'
)

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.chatanywhere.tech/v1"
)

class TranslationService:
    def __init__(self):
        self.model = "gpt-4o-mini"

    def build_messages(self, style, text):
        # 构建完整的 prompt
        style_prompt = prompt_template.get(style, prompt_template['local'])  # 默认使用本土化风格
        full_system_prompt = f"{system_prompt}\n\n{style_prompt}"
        
        return [
            {"role": "system", "content": full_system_prompt},
            {"role": "user", "content": text}
        ]

    def translate(self, style, text):
        try:
            messages = self.build_messages(style, text)
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.5,
                max_tokens=4096
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Translation error: {str(e)}")
            raise

translation_service = TranslationService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        style = data.get('style', 'local')  # 默认使用本土化风格
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        translation = translation_service.translate(style, text)
        return jsonify({'translation': translation})

    except Exception as e:
        print(f"Error during translation: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

# https://github.com/chatanywhere/GPT_API_free?tab=readme-ov-file
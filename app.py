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

    def build_messages(self, style, direction, text):
        # 构建完整的 prompt
        style_prompt = prompt_template.get(style, prompt_template['official'])
        direction_text = "任务目标：中译英" if direction == "zh2en" else "任务目标：英译中"
        full_system_prompt = f"{direction_text}\n\n{system_prompt}\n\n{style_prompt}"
        
        return [
            {"role": "system", "content": full_system_prompt},
            {"role": "user", "content": text}
        ]

    def translate(self, style, direction, text):
        try:
            messages = self.build_messages(style, direction, text)
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

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        style = data.get('style', 'official')
        direction = data.get('direction', 'zh2en')  # 默认中译英
        
        # 打印接收到的请求数据
        print(f"Received translation request - Style: {style}, Direction: {direction}, Text: {text}")
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # 打印构建的完整 prompt
        messages = translation_service.build_messages(style, direction, text)
        print("Full prompt:")
        for msg in messages:
            print(f"Role: {msg['role']}")
            print(f"Content: {msg['content']}\n")

        translation = translation_service.translate(style, direction, text)

        return jsonify({
            'success': True,
            'translation': translation
        })
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
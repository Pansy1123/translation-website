// 常量定义
const TRANSLATION_STYLES = {
    'standard': 'local',     // 标准本土化
    'humorous': 'humor',     // 幽默游戏化
    'academic': 'scholar',   // 学术严谨化
    'formal': 'official',    // 正式官方化
    'colloquial': 'speaking' // 口语化
};

class TranslationApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentStyle = 'standard';
        this.updateHistoryDisplay();
    }

    initializeElements() {
        // 获取所有需要的DOM元素
        this.elements = {
            languageButtons: document.querySelectorAll('.language-toggle button'),
            styleButtons: document.querySelectorAll('.style-btn'),
            translateBtn: document.querySelector('.translate-btn'),
            inputText: document.querySelector('.input-section textarea'),
            outputText: document.querySelector('.output-section textarea'),
            copyBtn: document.querySelector('.copy-btn'),
            historyBtn: document.querySelector('.show-history-btn'),
            historyModal: document.getElementById('historyModal'),
            closeModal: document.querySelector('.close'),
            historyList: document.querySelector('.history-list')
        };
    }

    bindEvents() {
        // 绑定所有事件监听器
        this.elements.languageButtons.forEach(button => {
            button.addEventListener('click', () => this.handleLanguageToggle(button));
        });

        this.elements.styleButtons.forEach(button => {
            button.addEventListener('click', () => this.handleStyleToggle(button));
        });

        this.elements.translateBtn.addEventListener('click', () => this.handleTranslation());
        this.elements.copyBtn.addEventListener('click', () => this.copyTranslation());
        this.elements.historyBtn.addEventListener('click', () => this.showHistoryModal());
        this.elements.closeModal.addEventListener('click', () => this.hideHistoryModal());
    }

    async handleTranslation() {
        const text = this.elements.inputText.value;
        if (!text.trim()) return;

        try {
            const requestData = this.buildPrompt(text);
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '翻译请求失败');
            }

            const data = await response.json();
            this.elements.outputText.value = data.translation;
            this.saveToHistory(text, data.translation);
        } catch (error) {
            console.error('Translation failed:', error);
            alert(`翻译失败: ${error.message}`);
        }
    }

    buildPrompt(text) {
        // 发送风格类型和文本到后端
        return {
            style: TRANSLATION_STYLES[this.currentStyle],
            text: text
        };
    }

    async copyTranslation() {
        try {
            await navigator.clipboard.writeText(this.elements.outputText.value);
            alert('已复制到剪贴板！');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    saveToHistory(original, translated) {
        const historyItem = {
            original,
            translated,
            timestamp: new Date().toISOString(),
            style: this.currentStyle
        };
        
        let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        history.unshift(historyItem);
        localStorage.setItem('translationHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        this.elements.historyList.innerHTML = history.map(item => `
            <div class="history-item" data-translation="${item.translated}">
                <div class="original">${item.original}</div>
                <div class="translated">${item.translated}</div>
                <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `).join('');

        // 添加点击事件
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.elements.outputText.value = item.dataset.translation;
                this.hideHistoryModal();
            });
        });
    }

    showHistoryModal() {
        this.elements.historyModal.style.display = 'block';
    }

    hideHistoryModal() {
        this.elements.historyModal.style.display = 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TranslationApp();
}); 
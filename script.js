document.addEventListener('DOMContentLoaded', () => {
    // 语言切换
    const languageButtons = document.querySelectorAll('.language-toggle button');
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            languageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // 翻译风格切换
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // 翻译功能
    const translateBtn = document.querySelector('.translate-btn');
    const inputText = document.querySelector('.input-section textarea');
    const outputText = document.querySelector('.output-section textarea');

    translateBtn.addEventListener('click', async () => {
        // 这里添加实际的翻译API调用
        const text = inputText.value;
        const translatedText = await translateText(text);
        outputText.value = translatedText;
        saveToHistory(text, translatedText);
    });

    // 历史记录功能
    function saveToHistory(original, translated) {
        const historyItem = {
            original,
            translated,
            timestamp: new Date().toISOString()
        };
        
        let history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        history.unshift(historyItem);
        localStorage.setItem('translationHistory', JSON.stringify(history));
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        const historyList = document.querySelector('.history-list');
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="original">${item.original}</div>
                <div class="translated">${item.translated}</div>
                <div class="timestamp">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }

    // 初始化显示历史记录
    updateHistoryDisplay();
});

async function translateText(text) {
    // 这里实现实际的翻译API调用
    // 返回翻译结果
    return "Translated text will appear here";
} 
document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    let selectedStyle = 'technical'; // 默认选择技术文档风格

    // 处理风格卡片的选择
    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            // 移除其他卡片的active类
            styleCards.forEach(c => c.classList.remove('active'));
            // 添加当前卡片的active类
            card.classList.add('active');
            // 更新选中的风格
            selectedStyle = card.dataset.style;
        });
    });

    // 初始化默认选中的技术文档风格
    const defaultCard = document.querySelector('[data-style="technical"]');
    defaultCard.classList.add('active');

    // 复制结果按钮
    copyBtn.addEventListener('click', () => {
        const outputText = document.getElementById('outputText');
        outputText.select();
        document.execCommand('copy');
        alert('已复制到剪贴板');
    });

    // 清空按钮
    clearBtn.addEventListener('click', () => {
        document.getElementById('inputText').value = '';
        document.getElementById('outputText').value = '';
    });

    // 翻译按钮
    translateBtn.addEventListener('click', async () => {
        const inputText = document.getElementById('inputText').value;
        if (!inputText.trim()) {
            alert('请输入要翻译的文本');
            return;
        }

        // 显示loading
        loading.classList.remove('hidden');

        try {
            const response = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    style: selectedStyle,
                    direction: document.getElementById('direction').value
                })
            });

            if (!response.ok) {
                throw new Error('翻译请求失败');
            }

            const data = await response.json();
            document.getElementById('outputText').value = data.translation;
        } catch (error) {
            alert('翻译出错：' + error.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    // 添加输入限制
    const inputText = document.getElementById('inputText');
    inputText.addEventListener('input', () => {
        if (inputText.value.length > 1000) {
            inputText.value = inputText.value.slice(0, 1000);
            alert('文本长度已超过1000字限制');
        }
    });
}); 
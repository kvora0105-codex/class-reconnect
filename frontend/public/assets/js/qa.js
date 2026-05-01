// Q&A Chat functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const questionInput = document.getElementById('question-input');
    const sendButton = document.getElementById('send-button');

    let isProcessing = false;

    function appendMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 mb-4';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'flex-shrink-0';
        avatarDiv.innerHTML = isUser 
            ? `<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
               </div>`
            : `<div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'bg-white rounded-lg p-4 shadow-sm max-w-[80%]';
        
        // Convert markdown-style code blocks to HTML
        const formattedContent = content.replace(/\`\`\`(\w*)\n([\s\S]*?)\`\`\`/g, (match, language, code) => {
            return `<pre class="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto"><code class="language-${language}">${code.trim()}</code></pre>`;
        }).replace(/\`([^\`]+)\`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');

        contentDiv.innerHTML = formattedContent;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function handleSendMessage() {
        if (isProcessing || !questionInput.value.trim()) return;

        const question = questionInput.value.trim();
        questionInput.value = '';

        // Append user message
        appendMessage(question, true);

        try {
            isProcessing = true;
            sendButton.disabled = true;
            sendButton.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

            const response = await authAPI.getAnswer(question);
            
            if (response.success && response.answer) {
                appendMessage(response.answer);
            } else {
                throw new Error('Failed to get answer');
            }
        } catch (error) {
            console.error('Error getting answer:', error);
            appendMessage('Sorry, I encountered an error while processing your question. Please try again.');
        } finally {
            isProcessing = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Send';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', handleSendMessage);

    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
});
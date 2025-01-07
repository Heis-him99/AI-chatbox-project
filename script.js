document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const typingIndicator = document.getElementById('typingIndicator');
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const conversationList = document.getElementById('conversationList');

    let conversationHistory = [];

    chatForm.addEventListener('submit', handleSubmit);
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', toggleSidebar);

    async function handleSubmit(e) {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage('user', userMessage);
        userInput.value = '';
        showTypingIndicator();

        try {
            const aiResponse = await getAdvice();
            addMessage('ai', aiResponse);
            updateConversationHistory(userMessage, aiResponse);
        } catch (error) {
            console.error('Error:', error);
            addMessage('ai', 'Sorry, I encountered an error. Please try again.');
        } finally {
            hideTypingIndicator();
        }
    }

    async function getAdvice() {
        const response = await fetch('https://api.adviceslip.com/advice');
        if (!response.ok) {
            throw new Error('Failed to fetch advice');
        }
        const data = await response.json();
        return data.slip.advice;
    }

    function addMessage(sender, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    function updateConversationHistory(userMessage, aiResponse) {
        conversationHistory.push({ role: 'user', content: userMessage });
        conversationHistory.push({ role: 'ai', content: aiResponse });
        renderConversationHistory();
    }

    function renderConversationHistory() {
        conversationList.innerHTML = '';
        const groupedHistory = groupConversations(conversationHistory);

        groupedHistory.forEach((group, index) => {
            const groupElement = document.createElement('div');
            groupElement.classList.add('conversation-group');
            groupElement.innerHTML = `
                <h3>Conversation ${groupedHistory.length - index}</h3>
                ${group.map(item => `
                    <div class="conversation-item" data-role="${item.role}" data-content="${item.content}">
                        <strong>${item.role === 'user' ? 'You' : 'AI'}:</strong> ${item.content.substring(0, 30)}...
                    </div>
                `).join('')}
            `;
            conversationList.appendChild(groupElement);
        });

        addConversationItemListeners();
    }

    function groupConversations(history) {
        const groups = [];
        for (let i = 0; i < history.length; i += 2) {
            if (i + 1 < history.length) {
                groups.push([history[i], history[i + 1]]);
            } else {
                groups.push([history[i]]);
            }
        }
        return groups;
    }

    function addConversationItemListeners() {
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const role = item.dataset.role;
                const content = item.dataset.content;
                addMessage(role, content);
            });
        });
    }

    function toggleSidebar() {
        sidebar.classList.toggle('hidden');
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const typingIndicator = document.getElementById('typingIndicator');

    let conversationHistory = [];

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage) {
            addMessage('user', userMessage);
            userInput.value = '';
            typingIndicator.classList.remove('hidden');
            await processUserMessage(userMessage);
        }
    });

    async function processUserMessage(message) {
        try {
            conversationHistory.push({ role: 'user', content: message });
            const apiResponse = await fetchApiResponse(message);
            const aiResponse = await getAIResponse(conversationHistory, apiResponse);
            addMessage('ai', aiResponse);
            conversationHistory.push({ role: 'assistant', content: aiResponse });
        } catch (error) {
            console.error('Error processing message:', error);
            addMessage('ai', 'Sorry, I encountered an error. Please try again.');
        } finally {
            typingIndicator.classList.add('hidden');
        }
    }

    async function fetchApiResponse(question) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: question }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error fetching API response:', error);
            throw error;
        }
    }

    async function getAIResponse(conversationHistory, apiResponse) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant. Use the following API response to help answer the user's question: " + apiResponse },
                        ...conversationHistory
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('AI response generation failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw error;
        }
    }

    function addMessage(sender, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
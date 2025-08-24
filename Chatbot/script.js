const GEMINI_API_KEY = "Use your own API key";

// Note: Storing API keys directly in client-side code is not recommended for production.

// This will store our chat history for the API
let History = [];

// System instruction and chat history embedded directly
const systemInstructionText = ` Provide the system instruction and chat history embedded directly.`;

const chatHistoryText = ` U can add you messages here and it will be processed by the API. `;
// This function processes the static chat history string and populates the
// History array for the API. It ensures the roles are correctly assigned.
const processStaticHistory = () => {
    const lines = chatHistoryText.split('\n');
    let processedHistory = [];
    lines.forEach(line => {
        if (line.trim() === '') return;

        if (line.startsWith('Pushpa:')) {
            const message = line.substring(7).trim(); // Remove "Pushpa:"
            processedHistory.push({
                role: 'model',
                parts: [{ text: message }]
            });
        } else if (line.startsWith('Ankit:')) {
            const message = line.substring(6).trim(); // Remove "Ankit:"
            processedHistory.push({
                role: 'user',
                parts: [{ text: message }]
            });
        }
    });
    return processedHistory;
};

// Functions related to UI rendering and time, moved to global scope
const addMessageToUI = (text, sender, isTyping = false, isHistory = false) => {
    const chatMessagesEl = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    if (isTyping) {
        messageElement.classList.add('typing');
        messageElement.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
    } else {
        if (sender === 'bot') {
            messageElement.innerHTML = `
                <span class="bot-message-decoration left">❣️</span>
                <span class="message-text">${text}</span>
                <span class="bot-message-decoration right">💖</span>
                <span class="message-time">${isHistory ? 'Earlier' : getCurrentTime()}</span>
            `;
        } else {
            messageElement.innerHTML = `
                <span class="message-text">${text}</span>
                <span class="message-time">${isHistory ? 'Earlier' : getCurrentTime()}</span>
            `;
        }
    }
    
    chatMessagesEl.appendChild(messageElement);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    return messageElement;
};

const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const initializeChatWithHistory = () => {
    const chatMessagesEl = document.getElementById('chatMessages');
    chatMessagesEl.innerHTML = ''; // Clear existing messages
    
    History.forEach(message => {
        if (message.role === 'model') {
            addMessageToUI(message.parts[0].text, 'bot', false, true);
        } else if (message.role === 'user') {
            addMessageToUI(message.parts[0].text, 'user', false, true);
        }
    });
};

const createFloatingHearts = () => {
    const container = document.getElementById('floatingHearts');
    const heartCount = 20;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        
        // Random position and animation delay
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 15}s`;
        heart.style.fontSize = `${10 + Math.random() * 20}px`;
        heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
        
        container.appendChild(heart);
    }
};

// --- Gemini API Interaction ---
const ChattingWithGemini = async (userProblem) => {
    if (!GEMINI_API_KEY) {
        return "Babu, API key set nahi kiya tune! 😠";
    }

    // Add user message to local History for API context
    History.push({
        role: 'user',
        parts: [{ text: userProblem }]
    });

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: History, // Send the current chat history
        generationConfig: {
            temperature: 0.8, // Adjust for more creative/varied responses
            maxOutputTokens: 800, // Max length of the response
        },
        systemInstruction: {
            parts: [{ text: systemInstructionText }]
        },
        safetySettings: [ // Optional: Adjust safety settings if needed
            { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
            { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("API Error Response:", responseData);
            const errorMessage = responseData.error?.message || `API request failed with status ${response.status}`;
            History.push({
                role: 'model',
                parts: [{ text: `API Error: ${errorMessage}` }]
            });
            return `Oh no, Babu! Kuch problem ho gayi API se baat karte waqt 🥺 (${errorMessage}). Check console for details.`;
        }
        
        let botResponseText = "Sorry Babu, main samajh nahi paayi... kuch aur try kar? 🤔";
        if (responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0) {
            botResponseText = responseData.candidates[0].content.parts[0].text;
        } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
            botResponseText = `Babu, main ispe react nahi kar sakti: ${responseData.promptFeedback.blockReason}. Kuch aur pooch le.`;
            console.warn("Prompt blocked:", responseData.promptFeedback);
        } else {
            console.warn("Unexpected API response structure:", responseData);
        }

        // Add AI's response to History
        History.push({
            role: 'model',
            parts: [{ text: botResponseText }]
        });
        
        // Prune history if it gets too long to save tokens, keep last N interactions
        const maxHistoryItems = 20; // Keep last 10 pairs of user/model messages
        if (History.length > maxHistoryItems) {
            History.splice(0, History.length - maxHistoryItems);
        }

        return botResponseText;

    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        History.push({ // Add error to history
            role: 'model',
            parts: [{ text: `Network/Fetch Error: ${error.message}` }]
        });
        return `Aiyo! Network mein kuch issue lag raha hai, Babu 🥺 (${error.message}). Check your connection or console.`;
    }
};

// --- Frontend UI Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    // Process static history once on load
    History = processStaticHistory();
    
    // Create floating hearts background
    createFloatingHearts();
    
    const chatMessagesEl = document.getElementById('chatMessages');
    const userInputEl = document.getElementById('userInput');
    const sendButtonEl = document.getElementById('sendButton');
    
    const handleUserSendMessage = async () => {
        const messageText = userInputEl.value.trim();
        if (messageText === '') return;

        addMessageToUI(messageText, 'user');
        userInputEl.value = '';
        userInputEl.focus();

        const typingIndicator = addMessageToUI('', 'bot', true);

        try {
            const botResponseText = await ChattingWithGemini(messageText);
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI(botResponseText, 'bot');
        } catch (error) {
            console.error("Unhandled error in send message:", error);
            chatMessagesEl.removeChild(typingIndicator);
            addMessageToUI("Oops! Bahut badi gadbad ho gayi, Babu. 😭 Check the console.", 'bot');
        }
    };

    sendButtonEl.addEventListener('click', handleUserSendMessage);
    userInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleUserSendMessage();
        }
    });
    
    // Focus on input when page loads
    userInputEl.focus();
});
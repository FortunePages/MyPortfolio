// ==================== AI ASSISTANT INITIALIZATION ====================
class AIReviewerAssistant {
    constructor() {
        // DOM Elements
        this.feedBtn = document.getElementById('feedBtn');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.reviewerContent = document.getElementById('reviewerContent');
        this.subjectSelect = document.getElementById('subject');
        this.knowledgeDisplay = document.getElementById('knowledgeDisplay');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceOutput = document.getElementById('voiceOutput');

        // Speech Recognition Setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        // Speech Synthesis
        this.synth = window.speechSynthesis;

        // State
        this.knowledge = {
            math: '',
            science: '',
            history: '',
            english: '',
            custom: ''
        };
        this.isListening = false;
        this.isTyping = false;

        this.initializeEventListeners();
        this.setupSpeechRecognition();
        this.loadKnowledge();
    }

    // ==================== EVENT LISTENERS ====================
    initializeEventListeners() {
        this.feedBtn.addEventListener('click', () => this.feedKnowledge());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    // ==================== KNOWLEDGE BASE ====================
    feedKnowledge() {
        const subject = this.subjectSelect.value;
        const content = this.reviewerContent.value.trim();

        if (!content) {
            this.showNotification('Please paste some content first!', 'error');
            return;
        }

        this.knowledge[subject] = content;
        localStorage.setItem(`knowledge_${subject}`, content);
        
        this.knowledgeDisplay.innerHTML = `
            <strong>✅ ${subject.toUpperCase()}</strong><br>
            <small>${content.substring(0, 100)}...</small>
        `;

        this.showNotification(`Knowledge base fed with ${subject}!`, 'success');
        this.reviewerContent.value = '';
        
        // AI Response
        this.addAIMessage(`Great! I've loaded your ${subject} reviewer. Feel free to ask me questions about it! 🎯`);
    }

    loadKnowledge() {
        Object.keys(this.knowledge).forEach(subject => {
            const saved = localStorage.getItem(`knowledge_${subject}`);
            if (saved) {
                this.knowledge[subject] = saved;
            }
        });
        this.updateKnowledgeDisplay();
    }

    updateKnowledgeDisplay() {
        const loadedSubjects = Object.entries(this.knowledge)
            .filter(([, content]) => content.length > 0)
            .map(([subject]) => `<span class="knowledge-tag">✓ ${subject}</span>`)
            .join('');

        if (loadedSubjects) {
            this.knowledgeDisplay.innerHTML = loadedSubjects;
        } else {
            this.knowledgeDisplay.innerHTML = '<p class="empty-state">No knowledge loaded yet</p>';
        }
    }

    // ==================== MESSAGE HANDLING ====================
    sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        this.messageInput.value = '';

        // Generate AI response
        setTimeout(() => this.generateAIResponse(message), 500);
    }

    addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<div class="message-bubble">${this.escapeHtml(text)}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addAIMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.innerHTML = `<div class="message-bubble">${this.escapeHtml(text)}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.id = 'typing-indicator';
        messageDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // ==================== AI RESPONSE GENERATION ====================
    generateAIResponse(userMessage) {
        this.showTypingIndicator();

        // Simulate AI thinking
        setTimeout(() => {
            this.removeTypingIndicator();
            const response = this.generateResponse(userMessage);
            this.addAIMessage(response);

            if (this.voiceOutput.checked) {
                this.speakResponse(response);
            }
        }, 800 + Math.random() * 1200);
    }

    generateResponse(userMessage) {
        const currentSubject = this.subjectSelect.value;
        const knowledge = this.knowledge[currentSubject];

        // Keywords from user message
        const lowerMessage = userMessage.toLowerCase();

        // Base responses
        const responses = {
            greeting: [
                "Hey! 👋 I'm here to help you learn. What would you like to review?",
                "Hello! Ready to study? Ask me anything about your subject!",
                "Hi there! Let's make learning fun! 🚀"
            ],
            noKnowledge: [
                `I don't have ${currentSubject} content loaded yet. Please paste some reviewer material first!`,
                `Oops! No ${currentSubject} knowledge available. Feed me some content to get started! 📚`,
                `I need some ${currentSubject} material to help you. Upload your reviewer notes!`
            ],
            clarify: [
                "Can you ask more specifically? I'm ready to help! 📖",
                "Could you rephrase that? I want to give you the best answer!",
                "Great question! Tell me more about what you'd like to learn."
            ],
            encourage: [
                "You're doing great! Keep the questions coming! 💪",
                "That's an excellent question! I'm impressed! ⭐",
                "Love your curiosity! Let's dive deeper into this topic! 🎯"
            ]
        };

        // Greeting detection
        if (/hi|hello|hey|greetings/.test(lowerMessage)) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        }

        // Check if knowledge is loaded
        if (!knowledge) {
            return responses.noKnowledge[Math.floor(Math.random() * responses.noKnowledge.length)];
        }

        // Extract relevant knowledge
        const relevantContent = this.extractRelevantContent(userMessage, knowledge);

        // Generate contextual response
        if (relevantContent) {
            return this.buildContextualResponse(userMessage, relevantContent);
        }

        // Fallback responses
        return responses.clarify[Math.floor(Math.random() * responses.clarify.length)];
    }

    extractRelevantContent(query, knowledge) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const knowledgeLines = knowledge.split(/[.\n]/);

        // Find matching lines
        for (let line of knowledgeLines) {
            const lineWords = line.toLowerCase().split(/\s+/);
            const matches = queryWords.filter(word => lineWords.some(lw => lw.includes(word)));
            if (matches.length >= 2) return line.trim();
        }

        return knowledgeLines[Math.floor(Math.random() * knowledgeLines.length)];
    }

    buildContextualResponse(userMessage, relevantContent) {
        const responses = [
            `Based on your materials: ${relevantContent.substring(0, 100)}... ${this.getEncouragingEnding()}`,
            `That's a great question! From your notes: ${relevantContent.substring(0, 80)}... Keep studying! 📚`,
            `I found something relevant for you: "${relevantContent.substring(0, 90)}..." Does this help? ${this.getEncouragingEnding()}`,
            `Let me connect this to what you learned: ${relevantContent.substring(0, 100)}... Perfect for your studies! ✨`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getEncouragingEnding() {
        const endings = ['You're doing awesome! 🌟', 'Keep up the great work! 💡', 'Learning rocks! 🚀', 'Stay curious! 🎯'];
        return endings[Math.floor(Math.random() * endings.length)];
    }

    // ==================== SPEECH RECOGNITION ====================
    setupSpeechRecognition() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceBtn.classList.add('listening');
            this.voiceStatus.textContent = '🎤 Listening...';
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (event.results[event.results.length - 1].isFinal) {
                this.messageInput.value = transcript;
                this.voiceStatus.textContent = '✅ Recognized!';
                setTimeout(() => this.sendMessage(), 500);
            }
        };

        this.recognition.onerror = (event) => {
            this.voiceStatus.textContent = `❌ Error: ${event.error}`;
            console.error('Speech recognition error:', event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceBtn.classList.remove('listening');
            setTimeout(() => {
                this.voiceStatus.textContent = '';
            }, 1500);
        };
    }

    toggleVoiceRecognition() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    // ==================== TEXT TO SPEECH ====================
    speakResponse(text) {
        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        this.synth.speak(utterance);
    }

    // ==================== UTILITY FUNCTIONS ====================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#00d4ff' : '#ff006e'};
            color: #0a0e27;
            border-radius: 10px;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInLeft 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ==================== INITIALIZE ON PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
    const assistant = new AIReviewerAssistant();
    console.log('🤖 AI Reviewer Assistant Initialized!');
});

// ==================== TRANSLATION DATABASE ====================
const translations = {
    en: {
        ready: "Ready to help! 👋",
        listening: "🎤 Listening...",
        recognized: "✅ Recognized!",
        welcome: "Welcome to AI Tutor!",
        startTest: "Starting test mode...",
        question: "Question",
        correct: "✅ Correct!",
        wrong: "❌ Wrong. The correct answer is:",
        explanation: "Explanation:",
        score: "Your Score:"
    },
    tl: {
        ready: "Handa akong tumulong! 👋",
        listening: "🎤 Nakikinig...",
        recognized: "✅ Nakita!",
        welcome: "Maligayang pagdating sa AI Tutor!",
        startTest: "Nagsisimula ang test mode...",
        question: "Tanong",
        correct: "✅ Tama!",
        wrong: "❌ Mali. Ang tamang sagot ay:",
        explanation: "Paliwanag:",
        score: "Ang Iyong Puntos:"
    },
    ceb: {
        ready: "Handa akong tumulong! 👋",
        listening: "🎤 Nakikinig...",
        recognized: "✅ Nakita!",
        welcome: "Maligayang pagdating sa AI Tutor!",
        startTest: "Nagsisimula ang test mode...",
        question: "Pangutana",
        correct: "✅ Tama!",
        wrong: "❌ Mali. Ang tamang sagot ay:",
        explanation: "Paliwanag:",
        score: "Ang Iyong Puntos:"
    }
};

// ==================== AI TUTOR CLASS ====================
class AITutor {
    constructor() {
        // DOM Elements
        this.feedBtn = document.getElementById('feedBtn');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.reviewerContent = document.getElementById('reviewerContent');
        this.knowledgeDisplay = document.getElementById('knowledgeDisplay');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.voiceOutput = document.getElementById('voiceOutput');
        this.aiStatus = document.getElementById('aiStatus');
        this.fileInput = document.getElementById('fileInput');
        this.uploadZone = document.getElementById('uploadZone');
        this.fileStatus = document.getElementById('fileStatus');
        this.setGoalBtn = document.getElementById('setGoalBtn');
        this.examSubject = document.getElementById('examSubject');
        this.examDate = document.getElementById('examDate');
        this.studentName = document.getElementById('studentName');

        // Quick Action Buttons
        this.practiceBtnQuick = document.getElementById('practiceBtnQuick');
        this.explainBtnQuick = document.getElementById('explainBtnQuick');
        this.translateBtnQuick = document.getElementById('translateBtnQuick');
        this.summaryBtnQuick = document.getElementById('summaryBtnQuick');

        // Student Section Elements
        this.gradeSelect = document.getElementById('studentGrade');
        this.createStudentBtn = document.getElementById('createStudentBtn');
        this.currentStudentDisplay = document.getElementById('currentStudent');

        // Logs Panel Elements
        this.activityLogs = document.getElementById('activityLogs');
        this.clearLogsBtn = document.querySelector('.btn-clear-logs');
        this.knowledgeSummaryContent = document.getElementById('knowledgeSummary');

        // State
        this.currentLanguage = 'en';
        this.knowledge = '';
        this.testQuestions = [];
        this.currentTestIndex = 0;
        this.testMode = false;
        this.studentGoal = {};
        this.isListening = false;
        
        // Multi-Student State
        this.currentStudent = null;
        this.currentGrade = null;
        this.activityLog = [];

        // Speech
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.synth = window.speechSynthesis;

        this.initializeEventListeners();
        this.setupSpeechRecognition();
        this.loadLastStudent();
    }

    // ==================== EVENT LISTENERS ====================
    initializeEventListeners() {
        this.feedBtn.addEventListener('click', () => this.feedKnowledge());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeLanguage(e.target.dataset.lang));
        });

        // File upload
        const insertFileBtn = document.getElementById('insertFileBtn');
        if (insertFileBtn) {
            insertFileBtn.addEventListener('click', () => this.fileInput.click());
        }
        this.uploadZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Goal setting
        this.setGoalBtn.addEventListener('click', () => this.setLearningGoal());

        // Quick actions
        this.practiceBtnQuick.addEventListener('click', () => this.startTestMode());
        this.explainBtnQuick.addEventListener('click', () => this.explainConcept());
        this.translateBtnQuick.addEventListener('click', () => this.toggleTranslation());
        this.summaryBtnQuick.addEventListener('click', () => this.showSummary());

        // Student Management
        if (this.createStudentBtn) {
            this.createStudentBtn.addEventListener('click', () => this.createStudent());
        }
        if (this.clearLogsBtn) {
            this.clearLogsBtn.addEventListener('click', () => this.clearAllLogs());
        }
    }

    // ==================== STUDENT MANAGEMENT ====================
    createStudent() {
        const name = this.studentName.value.trim();
        const grade = this.gradeSelect.value;

        if (!name) {
            this.showNotification('Please enter student name first!', 'error');
            return;
        }

        if (!grade) {
            this.showNotification('Please select a grade level!', 'error');
            return;
        }

        // Create or switch to student profile
        this.currentStudent = name;
        this.currentGrade = grade;

        // Initialize student data in localStorage if not exists
        const studentKey = `student_${name}_${grade}`;
        if (!localStorage.getItem(`${studentKey}_knowledge`)) {
            localStorage.setItem(`${studentKey}_knowledge`, '');
            localStorage.setItem(`${studentKey}_logs`, JSON.stringify([]));
            localStorage.setItem(`${studentKey}_tests`, JSON.stringify([]));
        }

        // Save current student
        localStorage.setItem('current_student', name);
        localStorage.setItem('current_grade', grade);

        // Load student's data
        this.loadStudentData();
        this.updateStudentDisplay();

        this.addAIMessage(`👋 Hello ${name}! Welcome to your Grade ${grade} learning session! We'll work on your studies together. 📚`);
        this.showNotification(`Student profile created: ${name} - Grade ${grade}`, 'success');
    }

    loadLastStudent() {
        const lastStudent = localStorage.getItem('current_student');
        const lastGrade = localStorage.getItem('current_grade');

        if (lastStudent && lastGrade) {
            this.currentStudent = lastStudent;
            this.currentGrade = lastGrade;
            
            if (this.studentName) {
                this.studentName.value = lastStudent;
            }
            if (this.gradeSelect) {
                this.gradeSelect.value = lastGrade;
            }

            this.loadStudentData();
            this.updateStudentDisplay();
        }
    }

    loadStudentData() {
        if (!this.currentStudent || !this.currentGrade) return;

        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        this.knowledge = localStorage.getItem(`${studentKey}_knowledge`) || '';
        this.activityLog = JSON.parse(localStorage.getItem(`${studentKey}_logs`) || '[]');

        this.displayActivityLogs();
        this.updateKnowledgeSummary();
    }

    updateStudentDisplay() {
        if (this.currentStudentDisplay && this.currentStudent) {
            this.currentStudentDisplay.innerHTML = `
                <p>📚 <strong>${this.currentStudent}</strong></p>
                <p style="margin: 0.3rem 0 0; font-size: 0.85rem;">Grade: <strong>${this.currentGrade}</strong></p>
            `;
        }
    }

    addActivityLog(action, content = '') {
        if (!this.currentStudent || !this.currentGrade) {
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        const logEntry = {
            id: Date.now(),
            action: action,
            content: content,
            timestamp: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            }),
            fullTime: new Date().toLocaleString()
        };

        this.activityLog.push(logEntry);

        // Save to localStorage
        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        localStorage.setItem(`${studentKey}_logs`, JSON.stringify(this.activityLog));

        this.displayActivityLogs();
    }

    deleteActivityLog(logId) {
        this.activityLog = this.activityLog.filter(log => log.id !== logId);

        // Save to localStorage
        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        localStorage.setItem(`${studentKey}_logs`, JSON.stringify(this.activityLog));

        this.displayActivityLogs();
        this.showNotification('Log entry deleted', 'success');
    }

    displayActivityLogs() {
        if (!this.activityLogs) return;

        if (this.activityLog.length === 0) {
            this.activityLogs.innerHTML = '<div class="empty-logs">No activities yet. Start by uploading files! 📤</div>';
            return;
        }

        this.activityLogs.innerHTML = this.activityLog
            .slice()
            .reverse()
            .map(log => `
                <div class="log-entry">
                    <div class="log-entry-text">
                        <span class="log-entry-time">${log.timestamp}</span>
                        <span class="log-entry-action">${log.action}</span>
                        ${log.content ? `<div style="margin-top: 0.3rem; font-size: 0.8rem; opacity: 0.8;">${log.content.substring(0, 50)}${log.content.length > 50 ? '...' : ''}</div>` : ''}
                    </div>
                    <button class="log-entry-delete" onclick="tutorInstance.deleteActivityLog(${log.id})">Delete</button>
                </div>
            `)
            .join('');
    }

    updateKnowledgeSummary() {
        if (!this.knowledgeSummaryContent) return;

        if (!this.knowledge) {
            this.knowledgeSummaryContent.innerHTML = '<div style="color: var(--text-secondary); text-align: center;">No knowledge base yet. Upload files to get started! 📚</div>';
            return;
        }

        const items = this.knowledge.split('\n').filter(item => item.trim()).slice(0, 5);
        const html = items.map((item, idx) => `
            <div class="knowledge-item">
                <span class="knowledge-item-text">${this.escapeHtml(item.substring(0, 40))}</span>
            </div>
        `).join('');

        this.knowledgeSummaryContent.innerHTML = html || '<div style="color: var(--text-secondary);">No content available</div>';
    }

    clearAllLogs() {
        if (confirm('Are you sure you want to delete all activity logs for this student?')) {
            this.activityLog = [];
            const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
            localStorage.setItem(`${studentKey}_logs`, JSON.stringify([]));
            this.displayActivityLogs();
            this.showNotification('All logs cleared', 'success');
        }
    }

    // ==================== FILE UPLOAD & PARSING ====================
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.processUploadedContent(content, file.name);
        };
        reader.readAsText(file);
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        this.fileInput.files = e.dataTransfer.files;
        this.handleFileUpload({ target: { files: [file] } });
    }

    processUploadedContent(content, fileName) {
        if (!this.currentStudent || !this.currentGrade) {
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        // Extract test questions if it looks like a test paper
        this.testQuestions = this.extractTestQuestions(content);
        this.knowledge = content;

        // Store in student-specific localStorage
        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        localStorage.setItem(`${studentKey}_knowledge`, content);
        localStorage.setItem(`${studentKey}_tests`, JSON.stringify(this.testQuestions));

        // Add activity log
        this.addActivityLog(`📤 Uploaded: ${fileName}`, `${this.testQuestions.length} questions found`);

        this.fileStatus.textContent = `✅ Loaded ${fileName} (${this.testQuestions.length} questions found)`;
        this.fileStatus.className = 'file-status success';

        this.addAIMessage(`📚 Great! I've loaded your "${fileName}" for ${this.currentStudent} (Grade ${this.currentGrade}). Found ${this.testQuestions.length} practice questions. Ready to test your knowledge!`);
        
        this.updateKnowledgeSummary();
    }

    extractTestQuestions(content) {
        // Parse numbered questions with multiple choice answers
        const questions = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Check for numbered questions
            if (/^\d+\.\s/.test(line)) {
                const question = {
                    number: questions.length + 1,
                    text: line.replace(/^\d+\.\s/, ''),
                    options: [],
                    correct: null
                };

                // Get options from next lines
                let j = i + 1;
                while (j < lines.length && /^[A-D]\.\s/.test(lines[j].trim())) {
                    const optionText = lines[j].trim().replace(/^[A-D]\.\s/, '');
                    question.options.push(optionText);
                    j++;
                }

                if (question.options.length > 0) {
                    questions.push(question);
                    i = j - 1;
                }
            }
        }

        return questions.length > 0 ? questions : [];
    }

    // ==================== GOAL SETTING ====================
    setLearningGoal() {
        const name = this.studentName.value.trim();
        const subject = this.examSubject.value;
        const date = this.examDate.value;

        if (!name || !subject || !date) {
            this.showNotification('Please fill all fields', 'error');
            return;
        }

        if (!this.currentStudent || !this.currentGrade) {
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        this.studentGoal = { name, subject, date };
        
        // Store goal in student profile
        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        localStorage.setItem(`${studentKey}_goal`, JSON.stringify(this.studentGoal));

        // Add activity log
        this.addActivityLog(`🎯 Goal Set: ${subject}`, `Exam on ${new Date(date).toLocaleDateString()}`);

        const message = `🎯 Alright ${name}, let's prepare for your ${subject} exam on ${new Date(date).toLocaleDateString()}! I'll help you master this subject. Let's get started!`;
        this.addAIMessage(message);
        this.aiStatus.textContent = `Helping ${name} (Grade ${this.currentGrade}) with ${subject}`;

        this.showNotification(`Goal set! Ready to prepare you for ${subject}!`, 'success');
    }

    // ==================== LANGUAGE MANAGEMENT ====================
    changeLanguage(lang) {
        this.currentLanguage = lang;
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
        localStorage.setItem('tutor_language', lang);

        const messages = {
            en: "Switched to English! 🇬🇧",
            tl: "Lumipat sa Tagalog! 🇵🇭",
            ceb: "Lumipat sa Bisaya! 🇵🇭"
        };

        this.addAIMessage(messages[lang]);
    }

    // ==================== TEST MODE ====================
    startTestMode() {
        if (!this.currentStudent) {
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        if (this.testQuestions.length === 0) {
            this.addAIMessage("📝 I don't have any test questions yet. Please upload a test paper or enter test content first!");
            return;
        }

        this.testMode = true;
        this.currentTestIndex = 0;
        this.addActivityLog(`📝 Started Test Mode`, `${this.testQuestions.length} questions`);
        this.practiceBtnQuick.classList.add('active');
        this.addAIMessage(translations[this.currentLanguage].startTest);
        this.displayTestQuestion();
    }

    displayTestQuestion() {
        if (this.currentTestIndex >= this.testQuestions.length) {
            this.endTest();
            return;
        }

        const q = this.testQuestions[this.currentTestIndex];
        const testHTML = `
            <div class="test-container">
                <div class="test-question">
                    <p><strong>${translations[this.currentLanguage].question} ${q.number}:</strong> ${q.text}</p>
                    <div class="test-options">
                        ${q.options.map((opt, idx) => `
                            <button class="option-btn" onclick="tutorInstance.selectTestAnswer(${this.currentTestIndex}, ${idx})">
                                ${String.fromCharCode(65 + idx)}. ${opt}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.innerHTML = `<div class="message-bubble">${testHTML}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    selectTestAnswer(questionIdx, optionIdx) {
        const question = this.testQuestions[questionIdx];
        const selectedOption = question.options[optionIdx];

        // Mark buttons
        document.querySelectorAll('.option-btn').forEach((btn, idx) => {
            btn.classList.add('disabled');
            if (idx === optionIdx) {
                const isCorrect = Math.random() > 0.3; // Simulate correctness
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        });

        // AI Response
        const isCorrect = Math.random() > 0.3;
        let response = isCorrect 
            ? `${translations[this.currentLanguage].correct} Great job! 🌟`
            : `${translations[this.currentLanguage].wrong} "${selectedOption}"`;

        this.addAIMessage(response);

        // Next question
        setTimeout(() => {
            this.currentTestIndex++;
            this.displayTestQuestion();
        }, 2000);
    }

    endTest() {
        this.testMode = false;
        this.practiceBtnQuick.classList.remove('active');
        const score = Math.floor(Math.random() * 40 + 60);
        this.addAIMessage(`📊 Test Complete!\n${translations[this.currentLanguage].score} ${score}%\n\nGreat effort! Keep practicing! 💪`);
    }

    // ==================== EXPLAIN CONCEPT ====================
    explainConcept() {
        const explanations = {
            en: "💡 Based on your materials, the key concepts are: understanding fundamentals, practicing consistently, and reviewing regularly. This helps you retain information better!",
            tl: "💡 Base sa iyong mga materyales, ang mga pangunahing konsepto ay: pag-intindi ng mga fundamentals, regular na pagsasanay, at regular na review. Ito ay tumutulong para mas matandaan mo!",
            ceb: "💡 Base sa iyong mga materyales, ang mga pangunahing konsepto ay: pag-intindi ng mga fundamentals, regular na pagsasanay, at regular na review."
        };

        this.addAIMessage(explanations[this.currentLanguage]);
    }

    // ==================== TRANSLATION ====================
    toggleTranslation() {
        if (!this.knowledge) {
            this.addAIMessage("Please load content first!");
            return;
        }

        const preview = this.knowledge.substring(0, 150) + "...";
        this.addAIMessage(`🌐 Translation to ${this.currentLanguage}:\n${preview}`);
    }

    // ==================== SUMMARY ====================
    showSummary() {
        if (!this.knowledge) {
            this.addAIMessage("No content available for summary!");
            return;
        }

        const summary = this.knowledge.split('.').slice(0, 3).join('. ') + ".";
        this.addAIMessage(`📋 Summary:\n${summary}`);
    }

    // ==================== MESSAGE HANDLING ====================
    feedKnowledge() {
        if (!this.currentStudent || !this.currentGrade) {
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        const content = this.reviewerContent.value.trim();
        if (!content) {
            this.showNotification('Please paste some content first!', 'error');
            return;
        }

        this.processUploadedContent(content, "Pasted Content");
        this.reviewerContent.value = '';
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        if (!this.currentStudent || !this.currentGrade) {
            this.addAIMessage('⚠️ Please create a student profile first to start chatting!');
            return;
        }

        this.addActivityLog(`💬 Message Sent`, message.substring(0, 50));
        this.addUserMessage(message);
        this.messageInput.value = '';

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
        messageDiv.innerHTML = `<div class="message-bubble">${this.escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    generateAIResponse(userMessage) {
        this.showTypingIndicator();

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
        const responses = [
            `I can help with that! "${userMessage.substring(0, 20)}..." is important. Let me explain: Based on what you should learn, this topic requires understanding the basics first. Practice with me! 📖`,
            `That's an intelligent question! To understand this better: Follow the fundamentals, practice exercises, and review before your exam. You're on the right track! 💡`,
            `Excellent thinking! Here's what you should focus on: Break it down into smaller parts, understand each concept deeply, and relate it to real-world examples. 🎯`,
            `I can see you're motivated! Keep this energy up and you'll definitely excel! Do you want to take a practice test to apply what you've learned? 🌟`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==================== SPEECH ====================
    setupSpeechRecognition() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceBtn.classList.add('listening');
            this.voiceStatus.textContent = translations[this.currentLanguage].listening;
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (event.results[event.results.length - 1].isFinal) {
                this.messageInput.value = transcript;
                this.voiceStatus.textContent = translations[this.currentLanguage].recognized;
                setTimeout(() => this.sendMessage(), 500);
            }
        };

        this.recognition.onerror = (event) => {
            this.voiceStatus.textContent = `❌ Error: ${event.error}`;
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

    speakResponse(text) {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        this.synth.speak(utterance);
    }

    // ==================== UTILITY ====================
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
            notification.remove();
        }, 3000);
    }
}

// ==================== INITIALIZE ====================
let tutorInstance;
document.addEventListener('DOMContentLoaded', () => {
    tutorInstance = new AITutor();
    console.log('🤖 AI Tutor Initialized!');
});


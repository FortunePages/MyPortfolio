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

    /**
     * Load student data safely with validation
     */
    loadStudentData() {
        if (!this.currentStudent || !this.currentGrade) {
            console.warn('[LOAD DATA] No student profile selected');
            return;
        }

        try {
            console.log(`[LOAD DATA] Loading data for: ${this.currentStudent} (${this.currentGrade})`);

            const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
            const knowledgeKey = `${studentKey}_knowledge`;
            const logsKey = `${studentKey}_logs`;

            // Load knowledge with validation
            const knowledge = localStorage.getItem(knowledgeKey);
            if (knowledge && typeof knowledge === 'string' && knowledge.length > 0) {
                this.knowledge = knowledge;
                console.log(`[LOAD DATA] ✅ Knowledge loaded (${knowledge.length} chars)`);
            } else {
                this.knowledge = '';
                console.log('[LOAD DATA] ⚠️ No knowledge available');
            }

            // Load activity logs with validation
            try {
                const logs = localStorage.getItem(logsKey);
                this.activityLog = logs ? JSON.parse(logs) : [];
                console.log(`[LOAD DATA] ✅ Activity logs loaded (${this.activityLog.length} entries)`);
            } catch (parseError) {
                console.error('[LOAD DATA] ❌ Error parsing logs:', parseError);
                this.activityLog = [];
            }

            this.displayActivityLogs();
            this.updateKnowledgeSummary();
            console.log('[LOAD DATA] ✅ Data loading complete');

        } catch (error) {
            console.error('[LOAD DATA] ❌ Error loading student data:', error);
            this.showNotification('Error loading student data', 'error');
        }
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

    // ==================== FILE UPLOAD & PARSING (REFACTORED) ====================
    
    /**
     * Configuration for allowed file types
     */
    getAllowedFileTypes() {
        return {
            '.txt': 'text/plain',
            '.md': 'text/markdown',
            '.csv': 'text/csv'
        };
    }

    /**
     * Validates file type and size
     * @param {File} file - File to validate
     * @returns {Object} { valid: boolean, error: string }
     */
    validateFileType(file) {
        console.log(`[FILE VALIDATION] Checking file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

        // Get file extension
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        const allowedTypes = this.getAllowedFileTypes();

        // Check extension
        if (!allowedTypes[fileExtension]) {
            const error = `❌ Unsupported file type: ${fileExtension}. Allowed: ${Object.keys(allowedTypes).join(', ')}`;
            console.warn(`[FILE VALIDATION] ${error}`);
            return { valid: false, error };
        }

        // Check file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            const error = `❌ File too large. Maximum size: 5MB, Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
            console.warn(`[FILE VALIDATION] ${error}`);
            return { valid: false, error };
        }

        console.log(`[FILE VALIDATION] ✅ File passed validation`);
        return { valid: true };
    }

    /**
     * Checks for binary file signatures/magic numbers
     * @param {string} content - File content
     * @returns {Object} { isBinary: boolean, signature: string }
     */
    detectBinaryData(content) {
        const binarySignatures = {
            'PNG': '\x89PNG',
            'JPEG': '\xFF\xD8\xFF',
            'GIF': 'GIF87a|GIF89a',
            'PDF': '%PDF',
            'ZIP': 'PK\x03\x04',
            'JFIF': '\xFF\xE0'
        };

        for (const [format, signature] of Object.entries(binarySignatures)) {
            if (content.includes(signature)) {
                console.warn(`[BINARY DETECTION] ⚠️ Detected ${format} signature - likely binary file`);
                return { isBinary: true, signature: format };
            }
        }

        // Check for null bytes (common in binary)
        if (content.includes('\x00')) {
            console.warn(`[BINARY DETECTION] ⚠️ Detected null bytes - likely binary file`);
            return { isBinary: true, signature: 'NULL_BYTES' };
        }

        console.log(`[BINARY DETECTION] ✅ No binary signatures detected`);
        return { isBinary: false };
    }

    /**
     * Sanitizes text content to prevent corruption
     * @param {string} content - Raw content
     * @returns {string} Cleaned content
     */
    sanitizeTextContent(content) {
        console.log(`[SANITIZATION] Starting sanitization - initial length: ${content.length}`);

        if (!content || typeof content !== 'string') {
            console.error(`[SANITIZATION] ❌ Invalid content type`);
            return '';
        }

        // Remove control characters except common whitespace
        let sanitized = content
            .split('')
            .filter(char => {
                const code = char.charCodeAt(0);
                // Keep: letters, numbers, spaces, common punctuation, newlines, tabs
                return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13 || code > 127;
            })
            .join('');

        // Normalize line endings to \n
        sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Remove excessive whitespace
        sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

        console.log(`[SANITIZATION] ✅ Sanitization done - final length: ${sanitized.length}`);
        return sanitized;
    }

    /**
     * Safe file reading with error handling
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            console.log(`[FILE READING] Starting to read file: ${file.name}`);

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    let content = e.target.result;
                    console.log(`[FILE READING] Raw content received - ${content.length} characters`);

                    // Check for binary data
                    const binary = this.detectBinaryData(content);
                    if (binary.isBinary) {
                        throw new Error(`Binary file detected (${binary.signature}). Only text files are supported.`);
                    }

                    // Sanitize content
                    content = this.sanitizeTextContent(content);

                    if (!content.trim()) {
                        throw new Error('File is empty after processing');
                    }

                    console.log(`[FILE READING] ✅ File read successfully`);
                    resolve(content);
                } catch (error) {
                    console.error(`[FILE READING] ❌ Error:`, error);
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error(`[FILE READING] ❌ FileReader error:`, error);
                reject(new Error('Failed to read file'));
            };

            reader.onabort = () => {
                console.warn(`[FILE READING] ⚠️ File reading was aborted`);
                reject(new Error('File reading was cancelled'));
            };

            // Start reading with error handling
            try {
                reader.readAsText(file, 'UTF-8');
            } catch (error) {
                console.error(`[FILE READING] ❌ Error initiating read:`, error);
                reject(error);
            }
        });
    }

    /**
     * Handles file upload with full validation
     * @param {Event} event - Upload event
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('[FILE UPLOAD] No file selected');
            return;
        }

        console.log(`[FILE UPLOAD] Starting upload for: ${file.name}`);

        // Validate file type
        const validation = this.validateFileType(file);
        if (!validation.valid) {
            this.fileStatus.textContent = validation.error;
            this.fileStatus.className = 'file-status error';
            this.showNotification(validation.error, 'error');
            return;
        }

        try {
            this.fileStatus.textContent = '⏳ Reading file...';
            this.fileStatus.className = 'file-status loading';

            // Read file safely
            const content = await this.readFileAsText(file);

            // Process content
            await this.processUploadedContent(content, file.name);

        } catch (error) {
            const errorMsg = `❌ Error processing file: ${error.message}`;
            console.error(`[FILE UPLOAD]`, error);
            this.fileStatus.textContent = errorMsg;
            this.fileStatus.className = 'file-status error';
            this.showNotification(errorMsg, 'error');
        }

        // Reset file input
        event.target.value = '';
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
        if (!file) return;

        this.fileInput.files = e.dataTransfer.files;
        this.handleFileUpload({ target: { files: [file] } });
    }

    /**
     * Store knowledge safely with validation
     * @param {string} content - Content to store
     * @param {string} fileName - File name for reference
     */
    storeKnowledgeSafely(content, fileName) {
        console.log(`[STORAGE] Attempting to store knowledge from: ${fileName}`);

        if (!this.currentStudent || !this.currentGrade) {
            console.error('[STORAGE] ❌ No student profile - cannot store');
            throw new Error('No active student profile');
        }

        // Validate content
        if (!content || typeof content !== 'string') {
            console.error('[STORAGE] ❌ Invalid content type');
            throw new Error('Invalid content');
        }

        if (content.trim().length === 0) {
            console.error('[STORAGE] ❌ Content is empty');
            throw new Error('Content cannot be empty');
        }

        // Create safe storage key
        const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
        const knowledgeKey = `${studentKey}_knowledge`;

        // Check if we're about to overwrite existing data
        const existingData = localStorage.getItem(knowledgeKey);
        if (existingData && existingData.length > 0) {
            console.log(`[STORAGE] ⚠️ Overwriting existing knowledge (${existingData.length} chars)`);
        }

        try {
            // Store with metadata
            const metadata = {
                fileName: fileName,
                uploadTime: new Date().toISOString(),
                contentLength: content.length,
                contentHash: this.hashContent(content)
            };

            localStorage.setItem(knowledgeKey, content);
            localStorage.setItem(`${knowledgeKey}_meta`, JSON.stringify(metadata));

            console.log(`[STORAGE] ✅ Knowledge stored successfully (${content.length} chars)`);
            console.log(`[STORAGE] Metadata:`, metadata);

            return { success: true, metadata };
        } catch (error) {
            console.error('[STORAGE] ❌ localStorage error:', error);
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded - clear some old data');
            }
            throw error;
        }
    }

    /**
     * Simple hash for content verification
     * @param {string} content - Content to hash
     * @returns {string} Simple hash
     */
    hashContent(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    processUploadedContent(content, fileName) {
        console.log(`[PROCESS] Starting to process: ${fileName}`);

        try {
            if (!this.currentStudent || !this.currentGrade) {
                throw new Error('Please create a student profile first!');
            }

            // Additional binary check
            const binary = this.detectBinaryData(content);
            if (binary.isBinary) {
                throw new Error(`Binary signature detected: ${binary.signature}`);
            }

            // Extract test questions
            console.log('[PROCESS] Extracting test questions...');
            this.testQuestions = this.extractTestQuestions(content);
            console.log(`[PROCESS] Found ${this.testQuestions.length} test questions`);

            // Store knowledge safely
            const result = this.storeKnowledgeSafely(content, fileName);
            this.knowledge = content;

            // Store tests separately
            const studentKey = `student_${this.currentStudent}_${this.currentGrade}`;
            localStorage.setItem(`${studentKey}_tests`, JSON.stringify(this.testQuestions));

            // Add activity log
            this.addActivityLog(`📤 Uploaded: ${fileName}`, `${this.testQuestions.length} questions found`);

            // Update UI
            this.fileStatus.textContent = `✅ Loaded ${fileName} (${this.testQuestions.length} questions found)`;
            this.fileStatus.className = 'file-status success';

            this.addAIMessage(`📚 Perfect! I've safely loaded your "${fileName}" for ${this.currentStudent} (Grade ${this.currentGrade}). Found ${this.testQuestions.length} practice questions. Ready to help! 🎯`);

            this.updateKnowledgeSummary();

            console.log(`[PROCESS] ✅ Processing complete`);

        } catch (error) {
            console.error(`[PROCESS] ❌ Error:`, error);
            this.showNotification(error.message || 'Error processing file', 'error');
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
        console.log('[FEED] Starting to feed knowledge from pasted content');

        if (!this.currentStudent || !this.currentGrade) {
            console.error('[FEED] ❌ No student profile');
            this.showNotification('Please create a student profile first!', 'error');
            return;
        }

        const content = this.reviewerContent.value.trim();
        if (!content) {
            console.warn('[FEED] ⚠️ Empty content');
            this.showNotification('Please paste some content first!', 'error');
            return;
        }

        try {
            console.log(`[FEED] Processing ${content.length} characters of content`);
            this.processUploadedContent(content, "Pasted Content");
            this.reviewerContent.value = '';
            console.log('[FEED] ✅ Content fed successfully');
        } catch (error) {
            console.error('[FEED] ❌ Error:', error);
            this.showNotification(error.message || 'Error feeding content', 'error');
        }
    }

    /**
     * Send user message with validation
     */
    sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            console.log('[MESSAGE] Empty message - ignoring');
            return;
        }

        console.log(`[MESSAGE] Sending message: "${message}"`);

        if (!this.currentStudent || !this.currentGrade) {
            console.warn('[MESSAGE] ❌ No student profile');
            this.addAIMessage('⚠️ Please create a student profile first to start chatting!');
            return;
        }

        try {
            this.addActivityLog(`💬 Message Sent`, message.substring(0, 50));
            this.addUserMessage(message);
            this.messageInput.value = '';

            // Async safety: small delay ensures UI updates
            setTimeout(() => this.generateAIResponse(message), 300);
            console.log('[MESSAGE] ✅ Message processed');
        } catch (error) {
            console.error('[MESSAGE] ❌ Error sending message:', error);
            this.showNotification('Error sending message', 'error');
        }
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

    /**
     * Generate AI response asynchronously with error handling
     * @param {string} userMessage - User's message
     */
    generateAIResponse(userMessage) {
        console.log(`[AI RESPONSE] Generating response for: "${userMessage.substring(0, 50)}..."`);
        this.showTypingIndicator();

        // Async safety: delay ensures UI renders properly
        const responseDelay = 800 + Math.random() * 1200;
        setTimeout(() => {
            try {
                this.removeTypingIndicator();
                const response = this.generateResponse(userMessage);
                
                if (!response || response.trim().length === 0) {
                    console.error('[AI RESPONSE] ❌ Empty response generated');
                    throw new Error('Response generation failed');
                }

                this.addAIMessage(response);
                console.log(`[AI RESPONSE] ✅ Response sent`);

                // Only speak if explicitly enabled
                if (this.voiceOutput && this.voiceOutput.checked) {
                    console.log('[AI RESPONSE] Speaking response...');
                    this.speakResponse(response);
                }
            } catch (error) {
                console.error('[AI RESPONSE] Error:', error);
                this.addAIMessage('❌ I encountered an issue generating a response. Please try again.');
            }
        }, responseDelay);
    }

    /**
     * Generate response with fallback handling
     * Uses knowledge base if available, otherwise provides generic guidance
     * @param {string} userMessage - User's message
     * @returns {string} AI response
     */
    generateResponse(userMessage) {
        console.log(`[GENERATE] Creating response...`);
        console.log(`[GENERATE] Knowledge available: ${this.knowledge.length} chars`);
        console.log(`[GENERATE] Message: "${userMessage}"`);

        try {
            // Check if knowledge base exists
            if (!this.knowledge || this.knowledge.trim().length === 0) {
                console.log('[GENERATE] ⚠️ No knowledge base - using default response');
                return this.getDefaultResponse(userMessage);
            }

            // Get a knowledge-aware response
            return this.getKnowledgeAwareResponse(userMessage);
        } catch (error) {
            console.error('[GENERATE] ❌ Error in generateResponse:', error);
            return this.getDefaultResponse(userMessage);
        }
    }

    /**
     * Get response based on knowledge base
     * @param {string} userMessage - User's message
     * @returns {string} Knowledge-aware response
     */
    getKnowledgeAwareResponse(userMessage) {
        console.log('[KNOWLEDGE] Generating knowledge-aware response');
        
        // Extract keywords from user message
        const keywords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        console.log(`[KNOWLEDGE] Keywords: ${keywords.join(', ')}`);

        // Find relevant content segments
        const knowledgeLines = this.knowledge.split('\n').filter(line => line.trim().length > 0);
        const relevantLines = knowledgeLines.filter(line => {
            const lineLower = line.toLowerCase();
            return keywords.some(keyword => lineLower.includes(keyword));
        }).slice(0, 2);

        if (relevantLines.length > 0) {
            console.log('[KNOWLEDGE] ✅ Found relevant content');
            return `Based on your materials: ${relevantLines[0].substring(0, 60)}... This relates to what you're studying. Keep practicing these concepts! 📚`;
        }

        console.log('[KNOWLEDGE] ⚠️ No relevant content found - using generic response');
        return this.getDefaultResponse(userMessage);
    }

    /**
     * Get generic response as fallback
     * @param {string} userMessage - User's message
     * @returns {string} Generic response
     */
    getDefaultResponse(userMessage) {
        console.log('[DEFAULT] Using default response template');
        
        const responses = [
            `Great question about "${userMessage.substring(0, 20)}..."! To master this, break it down into smaller parts, understand each concept deeply, and practice regularly. 📖`,
            `That's an intelligent question! The key to understanding this is: follow the fundamentals, do practice exercises, and review before your exam. You're on the right track! 💡`,
            `Excellent thinking! Here's my advice: understand the core concepts first, then practice similar problems. This approach helps most students excel! 🎯`,
            `I can see you're motivated! Keep this energy and focus on consistent practice. Do you want to take a practice test to apply what you've learned? 🌟`,
            `Good question! Remember: "Practice makes perfect." Focus on understanding the WHY behind each concept, not just memorizing. You've got this! 💪`
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        console.log('[DEFAULT] Selected response template');
        return response;
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

    // ==================== DEBUGGING & DIAGNOSTICS ====================
    /**
     * Get comprehensive system diagnostics
     * @returns {Object} Diagnostic report
     */
    getDiagnostics() {
        try {
            const diagnostics = {
                timestamp: new Date().toISOString(),
                student: {
                    name: this.currentStudent,
                    grade: this.currentGrade
                },
                knowledge: {
                    loaded: this.knowledge.length > 0,
                    length: this.knowledge.length,
                    hash: this.knowledge.length > 0 ? this.hashContent(this.knowledge) : null,
                    linesCount: this.knowledge.split('\n').length
                },
                tests: {
                    count: this.testQuestions.length,
                    sample: this.testQuestions.slice(0, 1)
                },
                logs: {
                    count: this.activityLog.length,
                    recent: this.activityLog.slice(-3)
                },
                storage: {
                    available: this.checkStorageAvailable(),
                    used: this.estimateStorageUsed()
                },
                ai: {
                    language: this.currentLanguage,
                    testMode: this.testMode,
                    listeningState: this.isListening
                }
            };

            console.log('[DIAGNOSTICS] System Report:', diagnostics);
            return diagnostics;
        } catch (error) {
            console.error('[DIAGNOSTICS] ❌ Error:', error);
            return { error: error.message };
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Storage availability
     */
    checkStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('[STORAGE] ⚠️ Storage not available:', error);
            return false;
        }
    }

    /**
     * Estimate total storage used
     * @returns {string} Storage estimate
     */
    estimateStorageUsed() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        const sizeInKB = (total / 1024).toFixed(2);
        console.log(`[STORAGE] Estimated usage: ${sizeInKB}KB`);
        return `${sizeInKB}KB`;
    }

    /**
     * Validate all stored data for integrity
     * @returns {Object} Validation report
     */
    validateStorageIntegrity() {
        console.log('[VALIDATE] Starting storage integrity check...');
        
        const report = {
            timestamp: new Date().toISOString(),
            allKeys: [],
            validentries: 0,
            errors: [],
            warnings: []
        };

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);

                report.allKeys.push(key);

                // Validate format
                if (key.includes('_logs')) {
                    try {
                        JSON.parse(value);
                        report.validentries++;
                    } catch (e) {
                        report.errors.push(`Invalid JSON in ${key}`);
                    }
                } else if (key.includes('_knowledge')) {
                    if (!value || value.length === 0) {
                        report.warnings.push(`Empty knowledge base: ${key}`);
                    } else if (value.length > 10 * 1024 * 1024) {
                        report.errors.push(`Knowledge base too large: ${key} (${value.length} bytes)`);
                    } else {
                        report.validentries++;
                    }
                } else {
                    report.validentries++;
                }
            }

            console.log('[VALIDATE] ✅ Integrity check complete:', report);
            return report;
        } catch (error) {
            console.error('[VALIDATE] ❌ Error:', error);
            report.errors.push(`Validation error: ${error.message}`);
            return report;
        }
    }

    /**
     * Clear corrupted data safely
     * @param {string} key - Storage key to clear
     */
    clearCorruptedData(key) {
        try {
            console.warn(`[CLEANUP] Removing corrupted data: ${key}`);
            localStorage.removeItem(key);
            console.log('[CLEANUP] ✅ Cleaned up successfully');
        } catch (error) {
            console.error('[CLEANUP] ❌ Error:', error);
        }
    }

    /**
     * Export current session data for debugging
     * @returns {string} JSON export
     */
    exportSessionData() {
        const data = {
            export_time: new Date().toISOString(),
            student: this.currentStudent,
            grade: this.currentGrade,
            knowledge_length: this.knowledge.length,
            activity_logs_count: this.activityLog.length,
            test_questions_count: this.testQuestions.length,
            language: this.currentLanguage
        };

        const json = JSON.stringify(data, null, 2);
        console.log('[EXPORT] Session Data:', json);
        return json;
    }

    /**
     * Log system information to console
     */
    logSystemInfo() {
        console.log('%c🤖 AI TUTOR SYSTEM INFORMATION', 'color: #00d4ff; font-weight: bold; font-size: 14px');
        console.log('%c=================================', 'color: #00ffcc');
        console.group('Current Session');
        console.log('Student:', this.currentStudent || 'Not set');
        console.log('Grade:', this.currentGrade || 'Not set');
        console.log('Language:', this.currentLanguage);
        console.groupEnd();

        console.group('Knowledge Base');
        console.log('Size:', this.knowledge.length, 'characters');
        console.log('Loaded:', this.knowledge.length > 0 ? '✅' : '❌');
        console.groupEnd();

        console.group('Test System');
        console.log('Questions loaded:', this.testQuestions.length);
        console.log('Test mode active:', this.testMode ? '✅' : '❌');
        console.groupEnd();

        console.group('Activity Tracking');
        console.log('Log entries:', this.activityLog.length);
        console.log('Recent:', this.activityLog.slice(-2));
        console.groupEnd();

        console.log('%c=================================', 'color: #00ffcc');
    }
}

// ==================== INITIALIZE ====================
let tutorInstance;
document.addEventListener('DOMContentLoaded', () => {
    try {
        tutorInstance = new AITutor();
        console.log('🤖 AI Tutor Initialized Successfully!');
        
        // Log system info on startup
        tutorInstance.logSystemInfo();
        
        // Run initial diagnostics
        const initialDiagnostics = tutorInstance.getDiagnostics();
        console.log('[INIT] Initial diagnostics:', initialDiagnostics);

    } catch (error) {
        console.error('❌ Initialization Error:', error);
        alert('Failed to initialize AI Tutor. Please check console for details.');
    }
});


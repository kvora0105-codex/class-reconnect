class AIAssistant {
    constructor() {
        this.context = '';
        this.knowledgeBase = {
            programming: {
                'c': {
                    concepts: ['pointers', 'structures', 'memory management', 'arrays', 'functions'],
                    resources: ['syntax', 'data types', 'control flow', 'file handling']
                },
                'c++': {
                    concepts: ['classes', 'objects', 'inheritance', 'polymorphism', 'templates'],
                    resources: ['STL', 'exception handling', 'operator overloading']
                },
                'python': {
                    concepts: ['lists', 'dictionaries', 'functions', 'classes', 'modules'],
                    resources: ['file handling', 'exception handling', 'libraries']
                },
                'java': {
                    concepts: ['classes', 'objects', 'inheritance', 'interfaces', 'collections'],
                    resources: ['multithreading', 'exception handling', 'IO']
                },
                'web': {
                    concepts: ['HTML', 'CSS', 'JavaScript', 'responsive design'],
                    resources: ['DOM manipulation', 'event handling', 'APIs']
                }
            },
            subjects: {
                'DBMS': ['SQL', 'normalization', 'transactions', 'indexing'],
                'DS': ['arrays', 'linked lists', 'trees', 'graphs', 'sorting'],
                'DLCOA': ['digital logic', 'computer architecture', 'assembly'],
                'DSGT': ['graph theory', 'discrete mathematics', 'logic']
            }
        };
    }

    async processQuestion(question) {
        // Normalize question
        question = question.toLowerCase().trim();

        // Check for greeting
        if (this.isGreeting(question)) {
            return this.getGreetingResponse();
        }

        // Check for subject/topic specific questions
        const topic = this.identifyTopic(question);
        if (topic) {
            return this.getTopicResponse(question, topic);
        }

        // Generate a general response
        return this.generateResponse(question);
    }

    isGreeting(question) {
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => question.includes(greeting));
    }

    getGreetingResponse() {
        const greetings = [
            "Hello! How can I help you with your studies today?",
            "Hi there! What would you like to learn about?",
            "Greetings! I'm here to help with your questions."
        ];
        return {
            message: greetings[Math.floor(Math.random() * greetings.length)],
            type: 'greeting'
        };
    }

    identifyTopic(question) {
        // Check programming languages
        for (const lang in this.knowledgeBase.programming) {
            if (question.includes(lang)) {
                return { category: 'programming', topic: lang };
            }
        }

        // Check subjects
        for (const subject in this.knowledgeBase.subjects) {
            if (question.includes(subject.toLowerCase())) {
                return { category: 'subjects', topic: subject };
            }
        }

        return null;
    }

    getTopicResponse(question, topic) {
        let response = '';
        
        if (topic.category === 'programming') {
            const langInfo = this.knowledgeBase.programming[topic.topic];
            response = this.generateProgrammingResponse(question, topic.topic, langInfo);
        } else if (topic.category === 'subjects') {
            const subjectInfo = this.knowledgeBase.subjects[topic.topic];
            response = this.generateSubjectResponse(question, topic.topic, subjectInfo);
        }

        return {
            message: response,
            type: 'topic_response',
            topic: topic
        };
    }

    generateProgrammingResponse(question, language, langInfo) {
        if (question.includes('what') && question.includes('learn')) {
            return `For ${language}, you should focus on these key concepts: ${langInfo.concepts.join(', ')}. Would you like to know more about any specific concept?`;
        }
        
        if (question.includes('how') && question.includes('start')) {
            return `To start learning ${language}, begin with: 1) ${langInfo.resources[0]}, 2) ${langInfo.resources[1]}, 3) ${langInfo.resources[2]}. Would you like a specific example?`;
        }

        return `I can help you with ${language} programming. What specific aspect would you like to learn about? Key areas include: ${langInfo.concepts.join(', ')}.`;
    }

    generateSubjectResponse(question, subject, subjectInfo) {
        if (question.includes('what') && question.includes('cover')) {
            return `${subject} covers these main topics: ${subjectInfo.join(', ')}. Which topic would you like to explore?`;
        }

        if (question.includes('explain') || question.includes('help')) {
            return `I can help explain ${subject} concepts. The key areas are: ${subjectInfo.join(', ')}. What specific topic would you like to understand better?`;
        }

        return `${subject} includes these important topics: ${subjectInfo.join(', ')}. Feel free to ask about any specific topic!`;
    }

    generateResponse(question) {
        // Handle general questions
        if (question.includes('help')) {
            return {
                message: "I can help you with programming languages (C, C++, Python, Java), web development, and subjects like DBMS, DS, DLCOA, and DSGT. What would you like to learn about?",
                type: 'general'
            };
        }

        if (question.includes('example')) {
            return {
                message: "I'd be happy to provide an example. Could you specify which programming language or concept you'd like an example for?",
                type: 'prompt'
            };
        }

        return {
            message: "I'm not sure I understand your question. Could you please rephrase it or specify which subject or programming language you're asking about?",
            type: 'clarification'
        };
    }
}

// Initialize the assistant
const assistant = new AIAssistant();

// Handle sending messages
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const questionInput = document.getElementById('question-input');
    const sendButton = document.getElementById('send-button');

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 mb-4';

        const avatar = document.createElement('div');
        avatar.className = 'flex-shrink-0';
        avatar.innerHTML = isUser ? 
            '<div class="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>' :
            '<div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>';

        const message = document.createElement('div');
        message.className = 'bg-white rounded-lg p-4 shadow-sm max-w-[80%]';
        message.innerHTML = `<p class="text-slate-800">${content}</p>`;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(message);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function handleSendMessage() {
        const question = questionInput.value.trim();
        if (!question) return;

        // Add user's question to chat
        addMessage(question, true);
        questionInput.value = '';

        // Process question and get response
        const response = await assistant.processQuestion(question);
        addMessage(response.message);
    }

    // Send message on button click
    sendButton.addEventListener('click', handleSendMessage);

    // Send message on Enter key (but allow Shift+Enter for new line)
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
});
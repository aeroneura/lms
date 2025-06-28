class Quiz {
    constructor() {
        this.storage = new Storage();
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = null;
    }

    showQuiz(courseId, quizId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        if (!course) {
            window.app.showError('Course not found');
            return;
        }

        // For demo purposes, create a simple quiz
        this.currentQuiz = {
            id: quizId,
            title: `${course.title} - Final Quiz`,
            questions: [
                {
                    question: "What is the main topic of this course?",
                    options: [
                        course.title,
                        "Something else",
                        "Not related",
                        "Unknown"
                    ],
                    correct: 0
                },
                {
                    question: "Who is the instructor of this course?",
                    options: [
                        "Unknown instructor",
                        course.instructor,
                        "Someone else",
                        "Not specified"
                    ],
                    correct: 1
                },
                {
                    question: "What level is this course?",
                    options: [
                        course.level,
                        "Different level",
                        "Not specified",
                        "All levels"
                    ],
                    correct: 0
                }
            ]
        };

        this.showQuizStart(courseId);
    }

    showQuizStart(courseId) {
        const html = `
            <div class="container">
                <div class="quiz-container">
                    <div class="quiz-header card text-center">
                        <h1>${this.currentQuiz.title}</h1>
                        <p>Test your knowledge with this final quiz</p>

                        <div class="quiz-info grid grid-3">
                            <div class="info-item">
                                <strong>${this.currentQuiz.questions.length}</strong>
                                <p>Questions</p>
                            </div>
                            <div class="info-item">
                                <strong>10</strong>
                                <p>Minutes</p>
                            </div>
                            <div class="info-item">
                                <strong>70%</strong>
                                <p>Pass Score</p>
                            </div>
                        </div>

                        <div class="quiz-instructions">
                            <h3>Instructions</h3>
                            <ul style="text-align: left;">
                                <li>Read each question carefully</li>
                                <li>Select the best answer</li>
                                <li>You can navigate between questions</li>
                                <li>Click submit when finished</li>
                            </ul>
                        </div>

                        <button class="btn btn-primary btn-lg" onclick="app.quiz.startQuiz('${courseId}')">
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
    }

    startQuiz(courseId) {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = new Date();
        this.showQuestion(courseId);
    }

    showQuestion(courseId) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;

        const html = `
            <div class="container">
                <div class="quiz-container">
                    <div class="quiz-progress">
                        <div class="progress">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <p>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</p>
                    </div>

                    <div class="question-card card">
                        <h2>${question.question}</h2>

                        <div class="options">
                            ${question.options.map((option, index) => `
                                <label class="option">
                                    <input type="radio" name="answer" value="${index}" 
                                           ${this.answers[this.currentQuestionIndex] === index ? 'checked' : ''}>
                                    <span class="option-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>

                        <div class="quiz-navigation">
                            <button class="btn btn-outline" 
                                    onclick="app.quiz.previousQuestion('${courseId}')"
                                    ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                                Previous
                            </button>

                            ${this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? `
                                <button class="btn btn-success" onclick="app.quiz.submitQuiz('${courseId}')">
                                    Submit Quiz
                                </button>
                            ` : `
                                <button class="btn btn-primary" onclick="app.quiz.nextQuestion('${courseId}')">
                                    Next
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
        this.setupQuestionListeners();
    }

    setupQuestionListeners() {
        const options = document.querySelectorAll('input[name="answer"]');
        options.forEach(option => {
            option.addEventListener('change', (e) => {
                this.answers[this.currentQuestionIndex] = parseInt(e.target.value);
            });
        });
    }

    previousQuestion(courseId) {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion(courseId);
        }
    }

    nextQuestion(courseId) {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion(courseId);
        }
    }

    submitQuiz(courseId) {
        const results = this.calculateResults();
        this.storage.saveQuizResult(courseId, results);

        // Generate certificate if passed
        if (results.passed) {
            window.app.certificates.generateCertificate(courseId, results.score);
        }

        this.showResults(courseId, results);
    }

    calculateResults() {
        let correct = 0;

        this.currentQuiz.questions.forEach((question, index) => {
            if (this.answers[index] === question.correct) {
                correct++;
            }
        });

        const score = Math.round((correct / this.currentQuiz.questions.length) * 100);
        const passed = score >= 70;
        const timeSpent = Math.round((new Date() - this.startTime) / 1000 / 60); // minutes

        return {
            score,
            correct,
            total: this.currentQuiz.questions.length,
            passed,
            timeSpent,
            completedAt: new Date().toISOString()
        };
    }

    showResults(courseId, results) {
        const html = `
            <div class="container">
                <div class="quiz-results">
                    <div class="results-card card text-center">
                        <div class="score ${results.passed ? 'text-success' : 'text-danger'}">
                            ${results.score}%
                        </div>

                        <h2>${results.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}</h2>

                        <p class="results-message">
                            ${results.passed ? 
                                'You passed the quiz! You have successfully completed this course.' :
                                `You scored ${results.score}%. You need 70% to pass. Review the material and try again.`
                            }
                        </p>

                        <div class="results-stats grid grid-4">
                            <div class="stat">
                                <strong>${results.score}%</strong>
                                <p>Score</p>
                            </div>
                            <div class="stat">
                                <strong>${results.correct}/${results.total}</strong>
                                <p>Correct</p>
                            </div>
                            <div class="stat">
                                <strong>${results.timeSpent}</strong>
                                <p>Minutes</p>
                            </div>
                            <div class="stat">
                                <strong>${results.passed ? '✅' : '❌'}</strong>
                                <p>Status</p>
                            </div>
                        </div>

                        <div class="results-actions">
                            <button class="btn btn-outline" onclick="app.router.navigate('course/${courseId}')">
                                Back to Course
                            </button>

                            ${results.passed ? `
                                <button class="btn btn-success" onclick="app.router.navigate('certificates')">
                                    View Certificate
                                </button>
                            ` : `
                                <button class="btn btn-primary" onclick="app.quiz.showQuiz('${courseId}', 'final')">
                                    Retake Quiz
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
    }
}
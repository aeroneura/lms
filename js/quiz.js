// Quiz management functionality
class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = null;
        this.quizTimer = null;
    }
    
    /**
     * Render quiz page
     * @param {string} courseId - Course ID
     * @param {string} quizId - Quiz ID
     */
    renderQuiz(courseId, quizId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        const quiz = course?.quiz;
        
        if (!course || !quiz || quiz.id !== quizId) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Quiz Not Found</h2>
                        <p class="text-gray-600">The quiz you're looking for doesn't exist.</p>
                        <a href="#/course/${courseId}" class="btn btn-primary">Back to Course</a>
                    </div>
                </div>
            `);
            return;
        }
        
        const user = window.lmsApp.getCurrentUser();
        const isEnrolled = user.enrolledCourses.includes(courseId);
        const progress = user.progress[courseId];
        const allLessonsCompleted = progress && progress.completed === progress.total;
        
        if (!isEnrolled) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Access Denied</h2>
                        <p class="text-gray-600">You need to enroll in this course to access the quiz.</p>
                        <a href="#/course/${courseId}" class="btn btn-primary">View Course</a>
                    </div>
                </div>
            `);
            return;
        }
        
        if (!allLessonsCompleted) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Complete All Lessons First</h2>
                        <p class="text-gray-600">You need to complete all lessons before taking the final quiz.</p>
                        <a href="#/course/${courseId}" class="btn btn-primary">Back to Course</a>
                    </div>
                </div>
            `);
            return;
        }
        
        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = new Date();
        
        this.renderQuizStart(courseId, course.title);
    }
    
    /**
     * Render quiz start page
     * @param {string} courseId - Course ID
     * @param {string} courseTitle - Course title
     */
    renderQuizStart(courseId, courseTitle) {
        const html = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <div class="flex items-center gap-4 mb-4">
                        <a href="#/course/${courseId}" class="btn btn-outline">← Back to Course</a>
                    </div>
                    
                    <div class="card">
                        <div class="card-body text-center">
                            <h1>Final Quiz</h1>
                            <h2 class="text-2xl mb-4">${courseTitle}</h2>
                            
                            <div class="quiz-info mb-6">
                                <div class="grid grid-3 gap-4">
                                    <div class="info-item">
                                        <div class="text-2xl font-bold text-blue-600">${this.currentQuiz.questions.length}</div>
                                        <div class="text-sm text-gray-600">Questions</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="text-2xl font-bold text-green-600">${this.currentQuiz.timeLimit || 15}</div>
                                        <div class="text-sm text-gray-600">Minutes</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="text-2xl font-bold text-purple-600">${this.currentQuiz.passingScore || 70}%</div>
                                        <div class="text-sm text-gray-600">To Pass</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="quiz-instructions mb-6">
                                <h3>Instructions</h3>
                                <ul class="text-left">
                                    <li>Read each question carefully before selecting your answer</li>
                                    <li>You can navigate between questions using the Previous/Next buttons</li>
                                    <li>You can change your answers before submitting</li>
                                    <li>The quiz will auto-submit when time expires</li>
                                    <li>You need ${this.currentQuiz.passingScore || 70}% to pass and earn your certificate</li>
                                </ul>
                            </div>
                            
                            <div class="quiz-actions">
                                <button onclick="window.lmsApp.quiz.startQuiz('${courseId}')" class="btn btn-primary btn-lg">
                                    Start Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Start the quiz
     * @param {string} courseId - Course ID
     */
    startQuiz(courseId) {
        this.quizStartTime = new Date();
        this.startTimer();
        this.renderQuestion(courseId);
    }
    
    /**
     * Start the quiz timer
     */
    startTimer() {
        const timeLimit = (this.currentQuiz.timeLimit || 15) * 60; // Convert to seconds
        let timeRemaining = timeLimit;
        
        this.quizTimer = setInterval(() => {
            timeRemaining--;
            this.updateTimerDisplay(timeRemaining);
            
            if (timeRemaining <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }
    
    /**
     * Update timer display
     * @param {number} seconds - Seconds remaining
     */
    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const display = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('quiz-timer');
        if (timerElement) {
            timerElement.textContent = display;
            
            // Change color when time is running low
            if (seconds <= 60) {
                timerElement.className = 'quiz-timer text-red-600 font-bold';
            } else if (seconds <= 300) {
                timerElement.className = 'quiz-timer text-yellow-600 font-bold';
            }
        }
    }
    
    /**
     * Render current question
     * @param {string} courseId - Course ID
     */
    renderQuestion(courseId) {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        
        const html = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <div class="flex items-center justify-between mb-4">
                        <a href="#/course/${courseId}" class="btn btn-outline">← Exit Quiz</a>
                        <div id="quiz-timer" class="quiz-timer font-bold text-lg">15:00</div>
                    </div>
                    
                    <div class="quiz-progress mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium">Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</span>
                            <span class="text-sm text-gray-600">${Math.round(progress)}% complete</span>
                        </div>
                        <div class="progress">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="quiz-question">
                    <div class="question-number">Question ${this.currentQuestionIndex + 1}</div>
                    <div class="question-text">${question.question}</div>
                    
                    <div class="quiz-options">
                        ${question.options.map((option, index) => {
                            const isSelected = this.userAnswers[this.currentQuestionIndex] === index;
                            return `
                                <div class="quiz-option ${isSelected ? 'selected' : ''}" 
                                     onclick="window.lmsApp.quiz.selectAnswer(${index})">
                                    <span class="option-letter">${String.fromCharCode(65 + index)}.</span>
                                    <span class="option-text">${option}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="quiz-navigation">
                    <button onclick="window.lmsApp.quiz.previousQuestion()" 
                            class="btn btn-outline" 
                            ${this.currentQuestionIndex === 0 ? 'disabled' : ''}>
                        Previous
                    </button>
                    
                    <div class="flex gap-4">
                        ${this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? `
                            <button onclick="window.lmsApp.quiz.submitQuiz()" class="btn btn-success">
                                Submit Quiz
                            </button>
                        ` : `
                            <button onclick="window.lmsApp.quiz.nextQuestion()" class="btn btn-primary">
                                Next
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Select an answer for the current question
     * @param {number} optionIndex - Index of selected option
     */
    selectAnswer(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Update UI to show selection
        document.querySelectorAll('.quiz-option').forEach((option, index) => {
            if (index === optionIndex) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion(this.getCurrentCourseId());
        }
    }
    
    /**
     * Go to next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion(this.getCurrentCourseId());
        }
    }
    
    /**
     * Submit the quiz and show results
     */
    submitQuiz() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
        }
        
        const results = this.calculateResults();
        this.saveQuizResults(results);
        this.renderResults(results);
    }
    
    /**
     * Calculate quiz results
     * @returns {object} - Quiz results
     */
    calculateResults() {
        const questions = this.currentQuiz.questions;
        let correctAnswers = 0;
        
        const questionResults = questions.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                correctAnswers++;
            }
            
            return {
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                options: question.options
            };
        });
        
        const score = Math.round((correctAnswers / questions.length) * 100);
        const passed = score >= (this.currentQuiz.passingScore || 70);
        const timeSpent = Math.round((new Date() - this.quizStartTime) / 1000 / 60); // minutes
        
        return {
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: questions.length,
            passed: passed,
            timeSpent: timeSpent,
            questionResults: questionResults,
            completedAt: new Date().toISOString()
        };
    }
    
    /**
     * Save quiz results to storage
     * @param {object} results - Quiz results
     */
    saveQuizResults(results) {
        const courseId = this.getCurrentCourseId();
        const user = window.lmsApp.getCurrentUser();
        
        // Save quiz results to user progress
        if (!user.quizResults) {
            user.quizResults = {};
        }
        
        user.quizResults[courseId] = results;
        
        // If passed, complete the course and generate certificate
        if (results.passed) {
            window.lmsApp.completeCourse(courseId);
        }
        
        window.lmsApp.updateUser(user);
    }
    
    /**
     * Render quiz results
     * @param {object} results - Quiz results
     */
    renderResults(results) {
        const courseId = this.getCurrentCourseId();
        const course = COURSES_DATA.find(c => c.id === courseId);
        
        const html = `
            <div class="quiz-container">
                <div class="quiz-results">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="quiz-score ${results.passed ? 'text-green-600' : 'text-red-600'}">
                                ${results.score}%
                            </div>
                            
                            <h2 class="mb-4">
                                ${results.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
                            </h2>
                            
                            <div class="quiz-feedback mb-6">
                                ${results.passed ? 
                                    `You passed the quiz! You've successfully completed "${course.title}" and earned your certificate.` :
                                    `You scored ${results.score}%. You need ${this.currentQuiz.passingScore || 70}% to pass. Review the course material and try again.`
                                }
                            </div>
                            
                            <div class="quiz-stats grid grid-4 gap-4 mb-6">
                                <div class="stat-item">
                                    <div class="text-2xl font-bold">${results.score}%</div>
                                    <div class="text-sm text-gray-600">Score</div>
                                </div>
                                <div class="stat-item">
                                    <div class="text-2xl font-bold">${results.correctAnswers}/${results.totalQuestions}</div>
                                    <div class="text-sm text-gray-600">Correct</div>
                                </div>
                                <div class="stat-item">
                                    <div class="text-2xl font-bold">${results.timeSpent}</div>
                                    <div class="text-sm text-gray-600">Minutes</div>
                                </div>
                                <div class="stat-item">
                                    <div class="text-2xl font-bold">${results.passed ? '✅' : '❌'}</div>
                                    <div class="text-sm text-gray-600">Status</div>
                                </div>
                            </div>
                            
                            <div class="quiz-actions flex gap-4 justify-center">
                                <a href="#/course/${courseId}" class="btn btn-outline">Back to Course</a>
                                
                                ${results.passed ? `
                                    <a href="#/certificates" class="btn btn-success">View Certificate</a>
                                ` : `
                                    <button onclick="window.lmsApp.quiz.retakeQuiz('${courseId}')" class="btn btn-primary">
                                        Retake Quiz
                                    </button>
                                `}
                                
                                <button onclick="window.lmsApp.quiz.showDetailedResults()" class="btn btn-secondary">
                                    Review Answers
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Show detailed results with correct/incorrect answers
     */
    showDetailedResults() {
        const courseId = this.getCurrentCourseId();
        const user = window.lmsApp.getCurrentUser();
        const results = user.quizResults[courseId];
        
        if (!results) return;
        
        const html = `
            <div class="quiz-container">
                <div class="quiz-review">
                    <div class="flex items-center gap-4 mb-6">
                        <button onclick="window.lmsApp.quiz.renderQuiz('${courseId}', '${this.currentQuiz.id}')" class="btn btn-outline">
                            ← Back to Results
                        </button>
                        <h1>Quiz Review</h1>
                    </div>
                    
                    <div class="questions-review">
                        ${results.questionResults.map((result, index) => `
                            <div class="card mb-4">
                                <div class="card-body">
                                    <div class="question-review">
                                        <div class="question-header">
                                            <span class="question-number">Question ${index + 1}</span>
                                            <span class="question-status ${result.isCorrect ? 'text-green-600' : 'text-red-600'}">
                                                ${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                                            </span>
                                        </div>
                                        
                                        <div class="question-text mb-4">${result.question}</div>
                                        
                                        <div class="options-review">
                                            ${result.options.map((option, optionIndex) => {
                                                let className = 'quiz-option';
                                                
                                                if (optionIndex === result.correctAnswer) {
                                                    className += ' correct';
                                                } else if (optionIndex === result.userAnswer && !result.isCorrect) {
                                                    className += ' incorrect';
                                                } else if (optionIndex === result.userAnswer) {
                                                    className += ' selected';
                                                }
                                                
                                                return `
                                                    <div class="${className}">
                                                        <span class="option-letter">${String.fromCharCode(65 + optionIndex)}.</span>
                                                        <span class="option-text">${option}</span>
                                                        ${optionIndex === result.correctAnswer ? '<span class="ml-auto">✓ Correct Answer</span>' : ''}
                                                        ${optionIndex === result.userAnswer && !result.isCorrect ? '<span class="ml-auto">Your Answer</span>' : ''}
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="review-actions text-center">
                        <a href="#/course/${courseId}" class="btn btn-primary">Back to Course</a>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Retake the quiz
     * @param {string} courseId - Course ID
     */
    retakeQuiz(courseId) {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.renderQuizStart(courseId, COURSES_DATA.find(c => c.id === courseId).title);
    }
    
    /**
     * Get current course ID from URL
     * @returns {string} - Course ID
     */
    getCurrentCourseId() {
        const hash = window.location.hash.slice(1);
        const match = hash.match(/\/quiz\/([^\/]+)/);
        return match ? match[1] : null;
    }
    
    /**
     * Clean up quiz state
     */
    cleanup() {
        if (this.quizTimer) {
            clearInterval(this.quizTimer);
            this.quizTimer = null;
        }
        
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = null;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManager;
}

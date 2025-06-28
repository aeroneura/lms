// Course management functionality
class CoursesManager {
    constructor() {
        this.currentCourse = null;
        this.currentLesson = null;
    }
    
    /**
     * Render the course list page
     */
    renderCourseList() {
        const user = window.lmsApp.getCurrentUser();
        const enrolledCourseIds = user.enrolledCourses || [];
        
        // Group courses by category
        const categories = {};
        COURSES_DATA.forEach(course => {
            if (!categories[course.category]) {
                categories[course.category] = [];
            }
            categories[course.category].push(course);
        });
        
        const html = `
            <div class="courses-page">
                <div class="page-header">
                    <h1>Course Catalog</h1>
                    <p class="text-gray-600">Discover and enroll in courses to advance your skills</p>
                </div>
                
                <div class="course-filters mb-6">
                    <div class="flex gap-4 flex-wrap">
                        <select id="category-filter" class="form-select" style="width: auto;">
                            <option value="">All Categories</option>
                            ${Object.keys(categories).map(category => 
                                `<option value="${category}">${category}</option>`
                            ).join('')}
                        </select>
                        
                        <select id="level-filter" class="form-select" style="width: auto;">
                            <option value="">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        
                        <select id="sort-filter" class="form-select" style="width: auto;">
                            <option value="title">Sort by Title</option>
                            <option value="category">Sort by Category</option>
                            <option value="level">Sort by Level</option>
                            <option value="duration">Sort by Duration</option>
                        </select>
                    </div>
                </div>
                
                <div id="courses-grid" class="grid grid-3">
                    ${this.renderCourseCards(COURSES_DATA, enrolledCourseIds)}
                </div>
                
                <div id="no-courses" class="hidden">
                    <div class="text-center py-12">
                        <h3>No courses found</h3>
                        <p class="text-gray-600">Try adjusting your filters to find more courses.</p>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
        this.setupCourseFilters();
    }
    
    /**
     * Render course cards
     * @param {Array} courses - Array of courses to render
     * @param {Array} enrolledCourseIds - Array of enrolled course IDs
     * @returns {string} - HTML string for course cards
     */
    renderCourseCards(courses, enrolledCourseIds) {
        return courses.map(course => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const progress = window.lmsApp.getCurrentUser().progress[course.id];
            const completionPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
            
            return `
                <div class="course-card card" data-course-id="${course.id}" data-category="${course.category}" data-level="${course.level}">
                    <div class="course-image">
                        ${course.title.charAt(0)}
                    </div>
                    <div class="card-body">
                        <div class="course-meta">
                            <span class="badge badge-primary">${course.category}</span>
                            <span class="badge badge-${this.getLevelBadgeClass(course.level)}">${course.level}</span>
                        </div>
                        
                        <h3 class="course-title">${course.title}</h3>
                        <p class="course-description">${course.description}</p>
                        
                        <div class="course-stats">
                            <div class="text-sm text-gray-600">
                                <div>📚 ${course.lessons.length} lessons</div>
                                <div>⏱️ ${course.duration}</div>
                                <div>👨‍🏫 ${course.instructor}</div>
                            </div>
                        </div>
                        
                        ${isEnrolled ? `
                            <div class="mt-4">
                                <div class="progress mb-2">
                                    <div class="progress-bar" style="width: ${completionPercentage}%"></div>
                                </div>
                                <div class="text-sm text-gray-600">${completionPercentage}% complete</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-footer course-footer">
                        ${isEnrolled ? `
                            <a href="#/course/${course.id}" class="btn btn-primary">
                                ${completionPercentage > 0 ? 'Continue' : 'Start'} Course
                            </a>
                        ` : `
                            <button onclick="window.lmsApp.courses.enrollInCourse('${course.id}')" class="btn btn-primary">
                                Enroll Now
                            </button>
                        `}
                        
                        <a href="#/course/${course.id}" class="btn btn-outline">View Details</a>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Get badge class for course level
     * @param {string} level - Course level
     * @returns {string} - Badge class
     */
    getLevelBadgeClass(level) {
        switch (level.toLowerCase()) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'primary';
        }
    }
    
    /**
     * Setup course filtering functionality
     */
    setupCourseFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const levelFilter = document.getElementById('level-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        const applyFilters = () => {
            const selectedCategory = categoryFilter.value;
            const selectedLevel = levelFilter.value;
            const sortBy = sortFilter.value;
            
            let filteredCourses = [...COURSES_DATA];
            
            // Apply category filter
            if (selectedCategory) {
                filteredCourses = filteredCourses.filter(course => 
                    course.category === selectedCategory
                );
            }
            
            // Apply level filter
            if (selectedLevel) {
                filteredCourses = filteredCourses.filter(course => 
                    course.level === selectedLevel
                );
            }
            
            // Apply sorting
            filteredCourses.sort((a, b) => {
                switch (sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'category':
                        return a.category.localeCompare(b.category);
                    case 'level':
                        const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
                        return levelOrder[a.level] - levelOrder[b.level];
                    case 'duration':
                        // Simple duration comparison (assumes format like "2 hours")
                        const getDurationMinutes = (duration) => {
                            const match = duration.match(/(\d+)/);
                            return match ? parseInt(match[1]) : 0;
                        };
                        return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
                    default:
                        return 0;
                }
            });
            
            // Update the grid
            const coursesGrid = document.getElementById('courses-grid');
            const noCourses = document.getElementById('no-courses');
            const enrolledCourseIds = window.lmsApp.getCurrentUser().enrolledCourses || [];
            
            if (filteredCourses.length > 0) {
                coursesGrid.innerHTML = this.renderCourseCards(filteredCourses, enrolledCourseIds);
                coursesGrid.classList.remove('hidden');
                noCourses.classList.add('hidden');
            } else {
                coursesGrid.classList.add('hidden');
                noCourses.classList.remove('hidden');
            }
        };
        
        // Add event listeners
        categoryFilter.addEventListener('change', applyFilters);
        levelFilter.addEventListener('change', applyFilters);
        sortFilter.addEventListener('change', applyFilters);
    }
    
    /**
     * Enroll user in a course
     * @param {string} courseId - Course ID to enroll in
     */
    enrollInCourse(courseId) {
        const success = window.lmsApp.enrollInCourse(courseId);
        
        if (success) {
            // Show success message
            this.showNotification('Successfully enrolled in course!', 'success');
            
            // Refresh the course list to show updated enrollment status
            setTimeout(() => {
                this.renderCourseList();
            }, 1000);
        } else {
            this.showNotification('You are already enrolled in this course!', 'warning');
        }
    }
    
    /**
     * Render course detail page
     * @param {string} courseId - Course ID to display
     */
    renderCourseDetail(courseId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        
        if (!course) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Course Not Found</h2>
                        <p class="text-gray-600">The course you're looking for doesn't exist.</p>
                        <a href="#/courses" class="btn btn-primary">Back to Courses</a>
                    </div>
                </div>
            `);
            return;
        }
        
        this.currentCourse = course;
        const user = window.lmsApp.getCurrentUser();
        const isEnrolled = user.enrolledCourses.includes(courseId);
        const progress = user.progress[courseId];
        const completionPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
        
        const html = `
            <div class="course-detail">
                <div class="course-header">
                    <div class="flex items-center gap-4 mb-4">
                        <a href="#/courses" class="btn btn-outline">← Back to Courses</a>
                        <div class="flex gap-2">
                            <span class="badge badge-primary">${course.category}</span>
                            <span class="badge badge-${this.getLevelBadgeClass(course.level)}">${course.level}</span>
                        </div>
                    </div>
                    
                    <h1>${course.title}</h1>
                    <p class="text-lg text-gray-600 mb-4">${course.description}</p>
                    
                    <div class="grid grid-4 gap-4 mb-6">
                        <div class="stat-card">
                            <div class="stat-number">${course.lessons.length}</div>
                            <div class="stat-label">Lessons</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${course.duration}</div>
                            <div class="stat-label">Duration</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${course.level}</div>
                            <div class="stat-label">Level</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${course.instructor}</div>
                            <div class="stat-label">Instructor</div>
                        </div>
                    </div>
                    
                    ${isEnrolled ? `
                        <div class="progress-section mb-6">
                            <h3>Your Progress</h3>
                            <div class="progress mb-2">
                                <div class="progress-bar" style="width: ${completionPercentage}%"></div>
                            </div>
                            <div class="text-sm text-gray-600">
                                ${progress?.completed || 0}/${course.lessons.length} lessons completed (${completionPercentage}%)
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="course-content">
                    <div class="grid grid-1 lg:grid-2 gap-6">
                        <div class="course-curriculum">
                            <h3>Course Curriculum</h3>
                            <div class="lessons-list">
                                ${course.lessons.map((lesson, index) => {
                                    const isCompleted = progress?.completedLessons?.includes(lesson.id) || false;
                                    const isCurrent = !isCompleted && (index === 0 || progress?.completedLessons?.includes(course.lessons[index - 1]?.id));
                                    
                                    return `
                                        <div class="lesson-card card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                                            <div class="card-body">
                                                <div class="lesson-header">
                                                    <div class="lesson-title">
                                                        <div class="lesson-icon ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                                                            ${isCompleted ? '✓' : index + 1}
                                                        </div>
                                                        <div>
                                                            <h4>${lesson.title}</h4>
                                                            <p class="text-sm text-gray-600">${lesson.type}</p>
                                                        </div>
                                                    </div>
                                                    <div class="lesson-duration">${lesson.duration}</div>
                                                </div>
                                                
                                                <div class="lesson-actions mt-3">
                                                    ${isEnrolled ? `
                                                        <a href="#/lesson/${courseId}/${lesson.id}" class="btn btn-sm ${isCompleted ? 'btn-success' : 'btn-primary'}">
                                                            ${isCompleted ? 'Review' : 'Start'} Lesson
                                                        </a>
                                                    ` : `
                                                        <button class="btn btn-sm btn-outline" disabled>
                                                            Enroll to Access
                                                        </button>
                                                    `}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                                
                                ${course.quiz ? `
                                    <div class="lesson-card card">
                                        <div class="card-body">
                                            <div class="lesson-header">
                                                <div class="lesson-title">
                                                    <div class="lesson-icon">
                                                        📝
                                                    </div>
                                                    <div>
                                                        <h4>Final Quiz</h4>
                                                        <p class="text-sm text-gray-600">Assessment</p>
                                                    </div>
                                                </div>
                                                <div class="lesson-duration">15 min</div>
                                            </div>
                                            
                                            <div class="lesson-actions mt-3">
                                                ${isEnrolled && completionPercentage === 100 ? `
                                                    <a href="#/quiz/${courseId}/${course.quiz.id}" class="btn btn-sm btn-primary">
                                                        Take Quiz
                                                    </a>
                                                ` : `
                                                    <button class="btn btn-sm btn-outline" disabled>
                                                        Complete all lessons first
                                                    </button>
                                                `}
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="course-info">
                            <div class="card">
                                <div class="card-header">
                                    <h3>Course Information</h3>
                                </div>
                                <div class="card-body">
                                    <div class="info-item">
                                        <strong>What you'll learn:</strong>
                                        <ul class="mt-2">
                                            ${course.objectives?.map(obj => `<li>${obj}</li>`).join('') || '<li>Complete understanding of the course topic</li>'}
                                        </ul>
                                    </div>
                                    
                                    <div class="info-item">
                                        <strong>Prerequisites:</strong>
                                        <p>${course.prerequisites || 'No prerequisites required'}</p>
                                    </div>
                                    
                                    <div class="info-item">
                                        <strong>Course Format:</strong>
                                        <p>Self-paced online learning with interactive lessons</p>
                                    </div>
                                </div>
                                
                                <div class="card-footer">
                                    ${!isEnrolled ? `
                                        <button onclick="window.lmsApp.courses.enrollInCourse('${courseId}')" class="btn btn-primary btn-lg w-full">
                                            Enroll in Course
                                        </button>
                                    ` : `
                                        <a href="#/lesson/${courseId}/${course.lessons[0].id}" class="btn btn-primary btn-lg w-full">
                                            ${completionPercentage > 0 ? 'Continue Learning' : 'Start First Lesson'}
                                        </a>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Render lesson page
     * @param {string} courseId - Course ID
     * @param {string} lessonId - Lesson ID
     */
    renderLesson(courseId, lessonId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        const lesson = course?.lessons.find(l => l.id === lessonId);
        
        if (!course || !lesson) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Lesson Not Found</h2>
                        <p class="text-gray-600">The lesson you're looking for doesn't exist.</p>
                        <a href="#/courses" class="btn btn-primary">Back to Courses</a>
                    </div>
                </div>
            `);
            return;
        }
        
        this.currentCourse = course;
        this.currentLesson = lesson;
        
        const user = window.lmsApp.getCurrentUser();
        const isEnrolled = user.enrolledCourses.includes(courseId);
        
        if (!isEnrolled) {
            window.lmsApp.renderContent(`
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Access Denied</h2>
                        <p class="text-gray-600">You need to enroll in this course to access lessons.</p>
                        <a href="#/course/${courseId}" class="btn btn-primary">View Course</a>
                    </div>
                </div>
            `);
            return;
        }
        
        const currentLessonIndex = course.lessons.findIndex(l => l.id === lessonId);
        const previousLesson = currentLessonIndex > 0 ? course.lessons[currentLessonIndex - 1] : null;
        const nextLesson = currentLessonIndex < course.lessons.length - 1 ? course.lessons[currentLessonIndex + 1] : null;
        
        const progress = user.progress[courseId];
        const isCompleted = progress?.completedLessons?.includes(lessonId) || false;
        
        const html = `
            <div class="lesson-page">
                <div class="lesson-header">
                    <div class="flex items-center gap-4 mb-4">
                        <a href="#/course/${courseId}" class="btn btn-outline">← Back to Course</a>
                        <div class="flex gap-2">
                            <span class="badge badge-primary">${course.title}</span>
                            ${isCompleted ? '<span class="badge badge-success">Completed</span>' : ''}
                        </div>
                    </div>
                    
                    <h1>${lesson.title}</h1>
                    <div class="lesson-meta">
                        <span>Lesson ${currentLessonIndex + 1} of ${course.lessons.length}</span>
                        <span>•</span>
                        <span>${lesson.duration}</span>
                        <span>•</span>
                        <span>${lesson.type}</span>
                    </div>
                </div>
                
                <div class="lesson-content">
                    ${this.renderLessonContent(lesson)}
                </div>
                
                <div class="lesson-navigation">
                    <div class="flex justify-between items-center">
                        ${previousLesson ? `
                            <a href="#/lesson/${courseId}/${previousLesson.id}" class="btn btn-outline">
                                ← Previous: ${previousLesson.title}
                            </a>
                        ` : '<div></div>'}
                        
                        <div class="flex gap-4">
                            ${!isCompleted ? `
                                <button onclick="window.lmsApp.courses.markLessonComplete('${courseId}', '${lessonId}')" class="btn btn-success">
                                    Mark as Complete
                                </button>
                            ` : `
                                <span class="text-success font-semibold">✓ Completed</span>
                            `}
                            
                            ${nextLesson ? `
                                <a href="#/lesson/${courseId}/${nextLesson.id}" class="btn btn-primary">
                                    Next: ${nextLesson.title} →
                                </a>
                            ` : (course.quiz ? `
                                <a href="#/quiz/${courseId}/${course.quiz.id}" class="btn btn-primary">
                                    Take Final Quiz →
                                </a>
                            ` : `
                                <a href="#/course/${courseId}" class="btn btn-primary">
                                    Course Complete! →
                                </a>
                            `)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Render lesson content based on type
     * @param {object} lesson - Lesson object
     * @returns {string} - HTML string for lesson content
     */
    renderLessonContent(lesson) {
        switch (lesson.type) {
            case 'video':
                return `
                    <div class="video-container">
                        <div class="video-placeholder">
                            <div class="text-center">
                                <div class="text-4xl mb-4">🎥</div>
                                <h3>${lesson.title}</h3>
                                <p>Video content would be loaded here</p>
                                <div class="video-controls">
                                    <button class="play-button">▶</button>
                                    <div class="video-timeline">
                                        <div class="video-progress" style="width: 0%"></div>
                                    </div>
                                    <div class="video-time">0:00 / ${lesson.duration}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="lesson-text">
                        <h3>Lesson Overview</h3>
                        <div class="prose">
                            ${lesson.content || this.getDefaultLessonContent(lesson)}
                        </div>
                    </div>
                `;
                
            case 'text':
                return `
                    <div class="lesson-text">
                        <div class="prose">
                            ${lesson.content || this.getDefaultLessonContent(lesson)}
                        </div>
                    </div>
                `;
                
            case 'interactive':
                return `
                    <div class="interactive-lesson">
                        <div class="card">
                            <div class="card-body">
                                <h3>Interactive Learning Module</h3>
                                <div class="prose">
                                    ${lesson.content || this.getDefaultLessonContent(lesson)}
                                </div>
                                <div class="interactive-elements mt-4">
                                    <button class="btn btn-primary">Try Interactive Demo</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
            default:
                return `
                    <div class="lesson-text">
                        <div class="prose">
                            ${lesson.content || this.getDefaultLessonContent(lesson)}
                        </div>
                    </div>
                `;
        }
    }
    
    /**
     * Get default lesson content if none provided
     * @param {object} lesson - Lesson object
     * @returns {string} - Default content HTML
     */
    getDefaultLessonContent(lesson) {
        return `
            <h2>Welcome to ${lesson.title}</h2>
            <p>This lesson will cover important concepts and skills related to the topic.</p>
            
            <h3>Learning Objectives</h3>
            <ul>
                <li>Understand the key concepts</li>
                <li>Apply practical knowledge</li>
                <li>Complete hands-on exercises</li>
            </ul>
            
            <h3>Key Points</h3>
            <p>In this lesson, you will learn about the fundamental principles and practical applications 
            of the topic. Take your time to understand each concept before moving on to the next lesson.</p>
            
            <div class="alert alert-info">
                <strong>Pro Tip:</strong> Take notes as you go through the lesson to help reinforce your learning.
            </div>
            
            <p>Once you've completed this lesson, mark it as complete and proceed to the next one!</p>
        `;
    }
    
    /**
     * Mark a lesson as complete
     * @param {string} courseId - Course ID
     * @param {string} lessonId - Lesson ID
     */
    markLessonComplete(courseId, lessonId) {
        window.lmsApp.updateProgress(courseId, lessonId);
        this.showNotification('Lesson marked as complete!', 'success');
        
        // Refresh the lesson page to show updated status
        setTimeout(() => {
            this.renderLesson(courseId, lessonId);
        }, 1000);
    }
    
    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Notification type (success, warning, error)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#059669' : type === 'warning' ? '#f59e0b' : '#dc2626'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoursesManager;
}

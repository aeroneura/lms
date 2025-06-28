class Courses {
    constructor() {
        this.storage = new Storage();
    }

    showCourseList() {
        const html = `
            <div class="container">
                <div class="courses-page">
                    <div class="page-header">
                        <h1>Course Catalog</h1>
                        <p>Explore our comprehensive collection of courses</p>
                    </div>

                    <div class="filters">
                        <select id="category-filter" class="form-select">
                            <option value="">All Categories</option>
                            <option value="Programming">Programming</option>
                            <option value="Design">Design</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                        </select>

                        <select id="level-filter" class="form-select">
                            <option value="">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div class="courses-grid grid grid-3">
                        ${COURSES_DATA.map(course => window.app.renderCourseCard(course)).join('')}
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
        this.setupFilters();
    }

    showCourse(courseId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        if (!course) {
            window.app.showError('Course not found');
            return;
        }

        const isEnrolled = this.isEnrolled(courseId);
        const progress = this.getCourseProgress(courseId);

        const html = `
            <div class="container">
                <div class="course-detail">
                    <div class="course-header">
                        <button class="btn btn-outline" onclick="history.back()">← Back</button>

                        <div class="course-info">
                            <div class="course-meta">
                                <span class="badge badge-primary">${course.category}</span>
                                <span class="badge badge-success">${course.level}</span>
                            </div>

                            <h1>${course.title}</h1>
                            <p class="course-description">${course.description}</p>

                            <div class="course-stats grid grid-4">
                                <div class="stat">
                                    <strong>${course.lessons?.length || 0}</strong>
                                    <span>Lessons</span>
                                </div>
                                <div class="stat">
                                    <strong>${course.duration}</strong>
                                    <span>Duration</span>
                                </div>
                                <div class="stat">
                                    <strong>${course.level}</strong>
                                    <span>Level</span>
                                </div>
                                <div class="stat">
                                    <strong>${course.instructor}</strong>
                                    <span>Instructor</span>
                                </div>
                            </div>

                            ${isEnrolled && progress ? `
                                <div class="progress-section">
                                    <h3>Your Progress</h3>
                                    <div class="progress">
                                        <div class="progress-bar" style="width: ${progress.percentage}%"></div>
                                    </div>
                                    <p>${progress.completed}/${progress.total} lessons completed (${progress.percentage}%)</p>
                                </div>
                            ` : ''}

                            <div class="course-actions">
                                ${isEnrolled ? `
                                    <button class="btn btn-primary btn-lg" onclick="app.courses.startCourse('${courseId}')">
                                        ${progress?.percentage > 0 ? 'Continue' : 'Start'} Course
                                    </button>
                                ` : `
                                    <button class="btn btn-primary btn-lg" onclick="app.courses.enrollCourse('${courseId}')">
                                        Enroll Now
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>

                    <div class="course-content grid grid-2">
                        <div class="lessons-section">
                            <h2>Course Content</h2>
                            <div class="lessons-list">
                                ${(course.lessons || []).map((lesson, index) => `
                                    <div class="lesson-item card">
                                        <div class="lesson-header">
                                            <span class="lesson-number">${index + 1}</span>
                                            <div class="lesson-info">
                                                <h4>${lesson.title}</h4>
                                                <p>${lesson.duration}</p>
                                            </div>
                                            ${isEnrolled ? `
                                                <button class="btn btn-sm btn-primary" 
                                                        onclick="app.courses.showLesson('${courseId}', '${lesson.id}')">
                                                    Start
                                                </button>
                                            ` : `
                                                <span class="text-muted">🔒</span>
                                            `}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="course-sidebar">
                            <div class="instructor-info card">
                                <h3>Instructor</h3>
                                <div class="instructor">
                                    <h4>${course.instructor}</h4>
                                    <p>Experienced professional with years of expertise in ${course.category.toLowerCase()}.</p>
                                </div>
                            </div>

                            <div class="course-features card">
                                <h3>What You'll Learn</h3>
                                <ul>
                                    <li>Master the fundamentals</li>
                                    <li>Apply practical skills</li>
                                    <li>Build real projects</li>
                                    <li>Earn a certificate</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
    }

    showLesson(courseId, lessonId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        const lesson = course?.lessons?.find(l => l.id === lessonId);

        if (!course || !lesson) {
            window.app.showError('Lesson not found');
            return;
        }

        if (!this.isEnrolled(courseId)) {
            window.app.showNotification('You must enroll in this course first', 'warning');
            window.app.router.navigate(`course/${courseId}`);
            return;
        }

        const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
        const nextLesson = course.lessons[lessonIndex + 1];
        const prevLesson = course.lessons[lessonIndex - 1];

        const html = `
            <div class="container">
                <div class="lesson-page">
                    <div class="lesson-header">
                        <button class="btn btn-outline" onclick="app.router.navigate('course/${courseId}')">
                            ← Back to Course
                        </button>

                        <div class="lesson-nav">
                            ${prevLesson ? `
                                <button class="btn btn-outline" onclick="app.courses.showLesson('${courseId}', '${prevLesson.id}')">
                                    ← Previous
                                </button>
                            ` : ''}

                            ${nextLesson ? `
                                <button class="btn btn-primary" onclick="app.courses.showLesson('${courseId}', '${nextLesson.id}')">
                                    Next →
                                </button>
                            ` : `
                                <button class="btn btn-success" onclick="app.quiz.showQuiz('${courseId}', 'final')">
                                    Take Final Quiz
                                </button>
                            `}
                        </div>
                    </div>

                    <div class="lesson-content">
                        <h1>${lesson.title}</h1>
                        <p class="lesson-meta">Lesson ${lessonIndex + 1} of ${course.lessons.length} • ${lesson.duration}</p>

                        <div class="lesson-body card">
                            <div class="video-placeholder">
                                <div class="video-icon">🎥</div>
                                <p>Video: ${lesson.title}</p>
                                <button class="btn btn-primary">Play Video</button>
                            </div>

                            <div class="lesson-text">
                                <h3>Lesson Overview</h3>
                                <p>This lesson covers important concepts that will help you understand the topic better. 
                                   Take your time to absorb the material and practice the exercises.</p>

                                <h3>Key Points</h3>
                                <ul>
                                    <li>Understand the main concepts</li>
                                    <li>Practice with examples</li>
                                    <li>Apply your knowledge</li>
                                </ul>

                                <div class="lesson-actions">
                                    <button class="btn btn-success" onclick="app.courses.markLessonComplete('${courseId}', '${lessonId}')">
                                        Mark as Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.app.renderContent(html);
    }

    enrollCourse(courseId) {
        this.storage.saveEnrollment(courseId);

        // Initialize progress
        const course = COURSES_DATA.find(c => c.id === courseId);
        if (course) {
            const progress = {
                completed: 0,
                total: course.lessons?.length || 0,
                percentage: 0,
                completedLessons: []
            };
            this.storage.saveCourseProgress(courseId, progress);
        }

        window.app.showNotification('Successfully enrolled in course!', 'success');
        window.app.router.navigate(`course/${courseId}`);
    }

    startCourse(courseId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        if (course && course.lessons && course.lessons.length > 0) {
            window.app.router.navigate(`lesson/${courseId}/${course.lessons[0].id}`);
        }
    }

    markLessonComplete(courseId, lessonId) {
        const progress = this.getCourseProgress(courseId) || { completed: 0, total: 0, completedLessons: [] };

        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            progress.completed = progress.completedLessons.length;
            progress.percentage = Math.round((progress.completed / progress.total) * 100);

            this.storage.saveCourseProgress(courseId, progress);
            window.app.showNotification('Lesson marked as complete!', 'success');

            // Refresh the page to show updated progress
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    }

    setupFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const levelFilter = document.getElementById('level-filter');

        const applyFilters = () => {
            const category = categoryFilter?.value || '';
            const level = levelFilter?.value || '';

            let filtered = COURSES_DATA;

            if (category) {
                filtered = filtered.filter(course => course.category === category);
            }

            if (level) {
                filtered = filtered.filter(course => course.level === level);
            }

            const grid = document.querySelector('.courses-grid');
            if (grid) {
                grid.innerHTML = filtered.map(course => window.app.renderCourseCard(course)).join('');
            }
        };

        categoryFilter?.addEventListener('change', applyFilters);
        levelFilter?.addEventListener('change', applyFilters);
    }

    searchCourses(query) {
        if (!query) return COURSES_DATA;

        const lowercaseQuery = query.toLowerCase();
        return COURSES_DATA.filter(course => 
            course.title.toLowerCase().includes(lowercaseQuery) ||
            course.description.toLowerCase().includes(lowercaseQuery) ||
            course.category.toLowerCase().includes(lowercaseQuery) ||
            course.instructor.toLowerCase().includes(lowercaseQuery)
        );
    }

    getEnrolledCourses() {
        const enrollments = this.storage.getEnrollments();
        return COURSES_DATA.filter(course => enrollments.includes(course.id));
    }

    getCompletedCourses() {
        const enrollments = this.storage.getEnrollments();
        return enrollments.filter(courseId => {
            const progress = this.getCourseProgress(courseId);
            return progress && progress.percentage === 100;
        }).map(courseId => COURSES_DATA.find(c => c.id === courseId)).filter(Boolean);
    }

    getCourseProgress(courseId) {
        return this.storage.getCourseProgress(courseId);
    }

    isEnrolled(courseId) {
        const enrollments = this.storage.getEnrollments();
        return enrollments.includes(courseId);
    }
}
class LMSApp {
    constructor() {
        this.storage = new Storage();
        this.router = new Router();
        this.auth = new Auth();
        this.courses = new Courses();
        this.quiz = new Quiz();
        this.certificates = new Certificates();

        this.currentUser = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            console.log('Initializing LMS App...');

            // Set global reference early for router access
            window.app = this;

            // Check for existing user session
            this.currentUser = this.storage.getUser();

            // Setup routes
            this.setupRoutes();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize router
            this.router.init();

            // Initialize theme
            this.initializeTheme();

            // Hide loading screen
            this.hideLoadingScreen();

            // Show appropriate view based on auth state
            if (this.currentUser) {
                this.showMainApp();
                if (this.currentUser.hasAdmission) {
                    this.router.navigate('dashboard');
                } else {
                    this.router.navigate('admission');
                }
            } else {
                this.showMainApp();
                this.router.navigate('');
            }

            this.isInitialized = true;
            this.updateCurrentYear();
            console.log('LMS App initialized successfully');

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupRoutes() {
        // Public routes
        this.router.addRoute('', () => this.showHome());
        this.router.addRoute('login', () => this.showLogin());
        this.router.addRoute('register', () => this.showRegister());
        this.router.addRoute('courses', () => this.showPublicCourses());
        this.router.addRoute('course/:id', (params) => this.showCourseSyllabus(params.id));
        this.router.addRoute('admission', () => this.showAdmission());
        this.router.addRoute('contact', () => this.showContact());
        this.router.addRoute('profile', () => this.requireAuth(() => this.showProfile()));

        // Protected routes (require admission/enrollment)
        this.router.addRoute('dashboard', () => this.requireAdmission(() => this.showDashboard()));
        this.router.addRoute('my-courses', () => this.requireAdmission(() => this.courses.showCourseList()));
        this.router.addRoute('study/:id', (params) => this.requireAdmission(() => this.courses.showCourse(params.id)));
        this.router.addRoute('lesson/:courseId/:lessonId', (params) => 
            this.requireAdmission(() => this.courses.showLesson(params.courseId, params.lessonId)));
        this.router.addRoute('quiz/:courseId/:quizId', (params) => 
            this.requireAdmission(() => this.quiz.showQuiz(params.courseId, params.quizId)));
        this.router.addRoute('search', () => this.requireAdmission(() => this.showSearch()));
        this.router.addRoute('certificates', () => this.requireAdmission(() => this.certificates.showCertificates()));
        this.router.addRoute('settings', () => this.requireAuth(() => this.showSettings()));

        // Default route
        this.router.setDefaultRoute('');
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());

        // Mobile menu toggle
        document.getElementById('nav-toggle')?.addEventListener('click', () => {
            const navMenu = document.getElementById('nav-menu');
            navMenu?.classList.toggle('active');
        });

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                const route = e.target.getAttribute('data-route');
                if (route) {
                    e.preventDefault();
                    this.router.navigate(route);

                    // Close mobile menu
                    document.getElementById('nav-menu')?.classList.remove('active');
                }
            }
        });
    }

    requireAuth(callback) {
        if (this.currentUser) {
            callback();
        } else {
            this.showNotification('Please log in to access this page', 'warning');
            this.router.navigate('login');
        }
    }

    requireAdmission(callback) {
        if (this.currentUser && this.currentUser.hasAdmission) {
            callback();
        } else if (this.currentUser) {
            this.showNotification('Please complete admission to access course content', 'warning');
            this.router.navigate('admission');
        } else {
            this.showNotification('Please sign up and complete admission to access this page', 'warning');
            this.router.navigate('register');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 300);
            }, 1000);
        }
    }

    showMainApp() {
        document.getElementById('navbar')?.classList.remove('hidden');
        document.getElementById('main-content')?.classList.remove('hidden');
        this.updateNavigation();
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentRoute = this.router.getCurrentRoute();
        const navAuth = document.getElementById('nav-auth');
        const navMenu = document.getElementById('nav-menu');

        // Update active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === currentRoute) {
                link.classList.add('active');
            }
        });

        // Update navigation based on authentication status
        if (this.currentUser) {
            // Show authenticated navigation
            if (navAuth) {
                navAuth.innerHTML = `
                    <span class="nav-user">Welcome, ${this.currentUser.name}</span>
                    <button id="logout-btn" class="btn btn-outline">Logout</button>
                `;

                // Re-attach logout event listener
                document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
            }

            // Show authenticated nav links
            if (navMenu) {
                navMenu.innerHTML = `
                    <a href="/courses" class="nav-link" data-route="courses">Browse Courses</a>
                    <a href="/dashboard" class="nav-link" data-route="dashboard">Dashboard</a>
                    <a href="/my-courses" class="nav-link" data-route="my-courses">My Courses</a>
                    <a href="/search" class="nav-link" data-route="search">Search</a>
                    <a href="/certificates" class="nav-link" data-route="certificates">Certificates</a>
                    <a href="/profile" class="nav-link" data-route="profile">Profile</a>
                    <a href="/settings" class="nav-link" data-route="settings">Settings</a>
                    <a href="/contact" class="nav-link" data-route="contact">Contact</a>
                `;
            }
        } else {
            // Show guest navigation - NO LOGOUT BUTTON
            if (navAuth) {
                navAuth.innerHTML = `
                    <a href="/login" class="btn btn-outline nav-link" data-route="login">Login</a>
                    <a href="/register" class="btn btn-primary nav-link" data-route="register">Sign Up</a>
                `;
            }

            // Show guest nav links
            if (navMenu) {
                navMenu.innerHTML = `
                    <a href="/" class="nav-link" data-route="">Home</a>
                    <a href="/courses" class="nav-link" data-route="courses">Browse Courses</a>
                    <a href="/contact" class="nav-link" data-route="contact">Contact</a>
                `;
            }
        }
    }

    showDashboard() {
        const enrolledCourses = this.courses.getEnrolledCourses();
        const completedCourses = this.courses.getCompletedCourses();
        const certificates = this.certificates.getUserCertificates();

        const html = `
            <div class="container">
                <div class="dashboard">
                    <div class="dashboard-header">
                        <h1>Welcome back, ${this.currentUser.name}!</h1>
                        <p>Continue your learning journey</p>
                    </div>

                    <div class="stats-grid grid grid-4">
                        <div class="stat-card card">
                            <h3>${enrolledCourses.length}</h3>
                            <p>Enrolled Courses</p>
                        </div>
                        <div class="stat-card card">
                            <h3>${completedCourses.length}</h3>
                            <p>Completed</p>
                        </div>
                        <div class="stat-card card">
                            <h3>${certificates.length}</h3>
                            <p>Certificates</p>
                        </div>
                        <div class="stat-card card">
                            <h3>${this.calculateTotalHours()}</h3>
                            <p>Hours Learned</p>
                        </div>
                    </div>

                    ${enrolledCourses.length > 0 ? `
                        <div class="recent-courses">
                            <h2>Continue Learning</h2>
                            <div class="courses-grid grid grid-3">
                                ${enrolledCourses.slice(0, 3).map(course => this.renderCourseCard(course)).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="no-courses card text-center">
                            <h2>Start Your Learning Journey</h2>
                            <p>You haven't enrolled in any courses yet.</p>
                            <button class="btn btn-primary" onclick="app.router.navigate('courses')">
                                Browse Courses
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

        this.renderContent(html);
    }

    showLogin() {
        const html = `
            <div class="container">
                <div class="auth-container">
                    <div class="auth-card card" style="max-width: 400px; margin: 2rem auto;">
                        <div class="card-header text-center">
                            <h1>Welcome to LMS Platform</h1>
                            <p>Sign in to continue learning</p>
                        </div>

                        <form id="login-form" class="card-body">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" name="email" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-input" name="password" required>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                Sign In
                            </button>
                        </form>

                        <div class="card-footer text-center">
                            <p>Don't have an account? 
                                <a href="#" onclick="app.router.navigate('register')">Register here</a>
                            </p>
                        </div>

                         <!-- Social Login Buttons -->
                        <div class="social-login">
                            <button id="google-login" class="btn btn-outline">Login with Google</button>
                            <button id="microsoft-login" class="btn btn-outline">Login with Microsoft</button>
                            <button id="apple-login" class="btn btn-outline">Login with Apple</button>
                        </div>

                        <div class="demo-section card-footer">
                            <p><strong>Demo Account:</strong></p>
                            <p>Email: demo@lms.com</p>
                            <p>Password: demo123</p>
                            <button type="button" class="btn btn-outline" onclick="app.loginDemo()">
                                Login with Demo Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupLoginForm();
    }

    showRegister() {
        const html = `
            <div class="container">
                <div class="auth-container">
                    <div class="auth-card card" style="max-width: 400px; margin: 2rem auto;">
                        <div class="card-header text-center">
                            <h1>Join LMS Platform</h1>
                            <p>Create your account to start learning</p>
                        </div>

                        <form id="register-form" class="card-body">
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-input" name="name" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" name="email" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-input" name="password" required minlength="6">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-input" name="confirmPassword" required>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                Create Account
                            </button>
                        </form>

                        <div class="card-footer text-center">
                            <p>Already have an account? 
                                <a href="#" onclick="app.router.navigate('login')">Sign in here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupRegisterForm();
    }

    showSearch() {
        const html = `
            <div class="container">
                <div class="search-page">
                    <div class="search-header">
                        <h1>Search Courses</h1>
                        <div class="search-bar">
                            <input type="text" class="form-input" id="search-input" 
                                   placeholder="Search for courses, topics, or instructors...">
                            <button class="btn btn-primary" onclick="app.performSearch()">Search</button>
                        </div>
                    </div>

                    <div id="search-results" class="search-results">
                        <div class="courses-grid grid grid-3">
                            ${COURSES_DATA.map(course => this.renderCourseCard(course)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupSearch();
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing In...';

            const formData = new FormData(form);
            const email = formData.get('email');
            const password = formData.get('password');

            const result = this.auth.login(email, password);

            if (result.success) {
                this.currentUser = this.storage.getUser();
                this.showMainApp();

                if (this.currentUser.hasAdmission) {
                    this.router.navigate('dashboard');
                } else {
                    this.router.navigate('admission');
                }

                this.showNotification(`Welcome back, ${this.currentUser.name}!`, 'success');
            } else {
                this.showNotification(result.error, 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        });

        // Handle OAuth login buttons
        document.getElementById('google-login')?.addEventListener('click', () => {
            this.auth.loginWithGoogle();
        });

        document.getElementById('microsoft-login')?.addEventListener('click', () => {
            this.auth.loginWithMicrosoft();
        });

        document.getElementById('apple-login')?.addEventListener('click', () => {
            this.auth.loginWithApple();
        });
    }

    setupRegisterForm() {
        const form = document.getElementById('register-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            const formData = new FormData(form);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
                return;
            }

            const result = this.auth.register(name, email, password);

            if (result.success) {
                this.currentUser = this.storage.getUser();
                this.showMainApp();
                this.router.navigate('admission');
                this.showNotification('Account created successfully! Please complete your admission.', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }

    performSearch(query = '') {
        const searchInput = document.getElementById('search-input');
        if (!query && searchInput) {
            query = searchInput.value;
        }

        const results = this.courses.searchCourses(query);
        const resultsContainer = document.getElementById('search-results');

        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-info">
                    <p>Found ${results.length} course${results.length !== 1 ? 's' : ''} 
                       ${query ? `for "${query}"` : ''}</p>
                </div>
                <div class="courses-grid grid grid-3">
                    ${results.map(course => this.renderCourseCard(course)).join('')}
                </div>
            `;
        }
    }

    loginDemo() {
        if (this.auth.login('demo@lms.com', 'demo123')) {
            this.currentUser = this.storage.getUser();
            this.showMainApp();
            this.router.navigate('dashboard');
            this.showNotification('Logged in with demo account!', 'success');
        }
    }

    logout() {
        this.auth.logout();
        this.currentUser = null;
        this.updateNavigation();
        this.router.navigate('');
        this.showNotification('Logged out successfully', 'info');
    }

    renderCourseCard(course) {
        const progress = this.courses.getCourseProgress(course.id);
        const isEnrolled = this.courses.isEnrolled(course.id);

        return `
            <div class="course-card card">
                <div class="course-image">
                    <div class="course-icon">${course.icon || '📚'}</div>
                </div>

                <div class="card-body">
                    <div class="course-meta">
                        <span class="badge badge-primary">${course.category}</span>
                        <span class="badge badge-success">${course.level}</span>
                    </div>

                    <h3 class="card-title">${course.title}</h3>
                    <p>${course.description}</p>

                    <div class="course-stats">
                        <small>👨‍🏫 ${course.instructor}</small>
                        <small>⏱️ ${course.duration}</small>
                        <small>📖 ${course.lessons?.length || 0} lessons</small>
                    </div>

                    ${isEnrolled && progress ? `
                        <div class="progress-section">
                            <div class="progress">
                                <div class="progress-bar" style="width: ${progress.percentage}%"></div>
                            </div>
                            <small>${progress.percentage}% complete</small>
                        </div>
                    ` : ''}
                </div>

                <div class="card-footer">
                    ${isEnrolled ? `
                        <button class="btn btn-primary" onclick="app.router.navigate('course/${course.id}')">
                            ${progress?.percentage > 0 ? 'Continue' : 'Start'} Course
                        </button>
                    ` : `
                        <button class="btn btn-outline" onclick="app.courses.enrollCourse('${course.id}')">
                            Enroll Now
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    calculateTotalHours() {
        const enrolledCourses = this.courses.getEnrolledCourses();
        return enrolledCourses.reduce((total, course) => {
            const hours = parseInt(course.duration) || 0;
            return total + hours;
        }, 0);
    }

    renderContent(html) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;float:right;cursor:pointer;">&times;</button>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showHome() {
        const html = `
            <div class="container">
                <div class="hero-section text-center">
                    <h1>Welcome to LMS Platform</h1>
                    <p>Your gateway to quality education and professional development</p>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-lg" onclick="app.router.navigate('courses')">
                            Browse Courses
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="app.router.navigate('register')">
                            Sign Up for Admission
                        </button>
                    </div>
                </div>

                <div class="features-section">
                    <h2>Why Choose Our Platform?</h2>
                    <div class="grid grid-3">
                        <div class="feature-card card text-center">
                            <div class="feature-icon">📚</div>
                            <h3>Quality Courses</h3>
                            <p>Learn from industry experts with comprehensive course materials</p>
                        </div>
                        <div class="feature-card card text-center">
                            <div class="feature-icon">🏆</div>
                            <h3>Certification</h3>
                            <p>Get recognized certificates upon successful course completion</p>
                        </div>
                        <div class="feature-card card text-center">
                            <div class="feature-icon">💻</div>
                            <h3>Interactive Learning</h3>
                            <p>Engage with quizzes, assignments, and hands-on projects</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }

    showPublicCourses() {
        const html = `
            <div class="container">
                <div class="courses-header">
                    <h1>Available Courses</h1>
                    <p>Explore our course catalog. Sign up for admission to start learning!</p>
                    <button class="btn btn-primary" onclick="app.router.navigate('register')">
                        Apply for Admission
                    </button>
                </div>

                <div class="courses-grid grid grid-3">
                    ${COURSES_DATA.map(course => this.renderPublicCourseCard(course)).join('')}
                </div>
            </div>
        `;
        this.renderContent(html);
    }

    showCourseSyllabus(courseId) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        if (!course) {
            this.showError('Course not found');
            return;
        }

        const html = `
            <div class="container">
                <div class="course-syllabus">
                    <div class="course-header">
                        <div class="course-icon-large">${course.icon || '📚'}</div>
                        <div class="course-info">
                            <h1>${course.title}</h1>
                            <p class="course-description">${course.description}</p>
                            <div class="course-meta">
                                <span class="badge badge-primary">${course.category}</span>
                                <span class="badge badge-success">${course.level}</span>
                                <span>👨‍🏫 ${course.instructor}</span>
                                <span>⏱️ ${course.duration}</span>
                            </div>
                        </div>
                    </div>

                    <div class="syllabus-content">
                        <h2>Course Syllabus</h2>
                        <div class="lessons-preview">
                            ${(course.lessons || []).map((lesson, index) => `
                                <div class="lesson-preview card">
                                    <div class="lesson-header">
                                        <span class="lesson-number">${index + 1}</span>
                                        <div class="lesson-info">
                                            <h4>${lesson.title}</h4>
                                            <p>${lesson.duration}</p>
                                            <p class="lesson-description">${lesson.description || 'Comprehensive lesson covering key concepts'}</p>
                                        </div>
                                        <span class="text-muted">🔒 Admission Required</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="course-enrollment-cta">
                            <div class="cta-card card text-center">
                                <h3>Ready to Start Learning?</h3>
                                <p>Sign up for admission to access this course and many more!</p>
                                <button class="btn btn-primary btn-lg" onclick="app.router.navigate('register')">
                                    Apply for Admission
                                </button>
                                <p class="text-muted">Already have an account? 
                                    <a href="javascript:void(0)" onclick="app.router.navigate('login')">Sign in here</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }

    showAdmission() {
        if (!this.currentUser) {
            this.router.navigate('register');
            return;
        }

        const html = `
            <div class="container">
                <div class="admission-container">
                    <div class="admission-card card" style="max-width: 600px; margin: 2rem auto;">
                        <div class="card-header text-center">
                            <h1>Complete Your Admission</h1>
                            <p>Welcome ${this.currentUser.name}! Complete your admission to access courses.</p>
                        </div>

                        <form id="admission-form" class="card-body">
                            <div class="form-group">
                                <label class="form-label">Phone Number</label>
                                <input type="tel" class="form-input" name="phone" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Educational Background</label>
                                <select class="form-input" name="education" required>
                                    <option value="">Select your education level</option>
                                    <option value="high_school">High School</option>
                                    <option value="bachelor">Bachelor's Degree</option>
                                    <option value="master">Master's Degree</option>
                                    <option value="phd">PhD</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Learning Goals</label>
                                <textarea class="form-input" name="goals" rows="3" 
                                         placeholder="What do you hope to achieve through our courses?"
                                         required></textarea>
                            </div>

                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="terms" required>
                                    I agree to the terms and conditions
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                Complete Admission
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupAdmissionForm();
    }

    renderPublicCourseCard(course) {
        return `
            <div class="course-card card" onclick="app.router.navigate('course/${course.id}')">
                <div class="course-image">
                    <div class="course-icon">${course.icon || '📚'}</div>
                </div>

                <div class="card-body">
                    <div class="course-meta">
                        <span class="badge badge-primary">${course.category}</span>
                        <span class="badge badge-success">${course.level}</span>
                    </div>

                    <h3 class="card-title">${course.title}</h3>
                    <p>${course.description}</p>

                    <div class="course-stats">
                        <small>👨‍🏫 ${course.instructor}</small>
                        <small>⏱️ ${course.duration}</small>
                        <small>📖 ${course.lessons?.length || 0} lessons</small>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="btn btn-outline" onclick="event.stopPropagation(); app.router.navigate('course/${course.id}')">
                        View Syllabus
                    </button>
                </div>
            </div>
        `;
    }

    setupAdmissionForm() {
        const form = document.getElementById('admission-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            // Update user with admission data
            const updatedUser = {
                ...this.currentUser,
                hasAdmission: true,
                admissionData: {
                    phone: formData.get('phone'),
                    education: formData.get('education'),
                    goals: formData.get('goals'),
                    admissionDate: new Date().toISOString()
                }
            };

            this.storage.saveUser(updatedUser);
            this.currentUser = updatedUser;

            this.showNotification('Admission completed successfully! Welcome to LMS Platform!', 'success');
            this.router.navigate('dashboard');
        });
    }

    showContact() {
        const currentYear = new Date().getFullYear();

        const html = `
            <div class="container">
                <div class="contact-page">
                    <div class="contact-header text-center">
                        <h1>Contact Us</h1>
                        <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    </div>

                    <div class="contact-content grid grid-2">
                        <div class="contact-form card">
                            <div class="card-header">
                                <h2>Send us a Message</h2>
                            </div>
                            <form id="contact-form" class="card-body">
                                <div class="form-group">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-input" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Subject</label>
                                    <input type="text" class="form-input" name="subject" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Message</label>
                                    <textarea class="form-input" name="message" rows="5" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Send Message</button>
                            </form>
                        </div>

                        <div class="contact-info">
                            <div class="contact-methods">
                                <div class="contact-method card">
                                    <div class="contact-icon">📧</div>
                                    <h3>Email</h3>
                                    <p>support@lmsplatform.com</p>
                                    <p>info@lmsplatform.com</p>
                                </div>

                                <div class="contact-method card">
                                    <div class="contact-icon">📞</div>
                                    <h3>Phone</h3>
                                    <p>+1 (555) 123-4567</p>
                                    <p>Monday - Friday, 9 AM - 6 PM</p>
                                </div>

                                <div class="contact-method card">
                                    <div class="contact-icon">📍</div>
                                    <h3>Address</h3>
                                    <p>123 Education Street</p>
                                    <p>Learning City, LC 12345</p>
                                </div>

                                <div class="contact-method card">
                                    <div class="contact-icon">💬</div>
                                    <h3>Live Chat</h3>
                                    <p>Available 24/7</p>
                                    <button class="btn btn-outline" onclick="app.showNotification('Live chat feature coming soon!', 'info')">
                                        Start Chat
                                    </button>
                                </div>
                            </div>

                            <div class="faq-section">
                                <h3>Frequently Asked Questions</h3>
                                <div class="faq-item">
                                    <strong>How do I reset my password?</strong>
                                    <p>Click on "Forgot Password" on the login page and follow the instructions.</p>
                                </div>
                                <div class="faq-item">
                                    <strong>How long do I have access to a course?</strong>
                                    <p>Once enrolled, you have lifetime access to the course materials.</p>                                </div>
                                <div class="faq-item">
                                    <strong>Can I download course materials?</strong>
                                    <p>Yes, most course materials are available for download for offline study.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupContactForm();
    }

    showProfile() {
        if (!this.currentUser) {
            this.router.navigate('login');
            return;
        }

        const currentYear = new Date().getFullYear();
        const joinYear = new Date(this.currentUser.joinDate).getFullYear();

        const html = `
            <div class="container">
                <div class="profile-page">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <div class="avatar-placeholder">
                                ${this.currentUser.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div class="profile-info">
                            <h1>${this.currentUser.name}</h1>
                            <p class="profile-email">${this.currentUser.email}</p>
                            <p class="profile-join-date">Member since ${joinYear}</p>
                            ${this.currentUser.hasAdmission ? 
                                '<span class="badge badge-success">Admission Completed</span>' : 
                                '<span class="badge badge-warning">Admission Pending</span>'
                            }
                        </div>
                    </div>

                    <div class="profile-content grid grid-2">
                        <div class="profile-form card">
                            <div class="card-header">
                                <h2>Edit Profile</h2>
                            </div>
                            <form id="profile-form" class="card-body">
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-input" name="name" value="${this.currentUser.name}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email" value="${this.currentUser.email}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" class="form-input" name="phone" value="${this.currentUser.profile?.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Bio</label>
                                    <textarea class="form-input" name="bio" rows="3" placeholder="Tell us about yourself...">${this.currentUser.profile?.bio || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Education Level</label>
                                    <select class="form-input" name="education">
                                        <option value="">Select education level</option>
                                        <option value="high_school" ${this.currentUser.profile?.education === 'high_school' ? 'selected' : ''}>High School</option>
                                        <option value="bachelor" ${this.currentUser.profile?.education === 'bachelor' ? 'selected' : ''}>Bachelor's Degree</option>
                                        <option value="master" ${this.currentUser.profile?.education === 'master' ? 'selected' : ''}>Master's Degree</option>
                                        <option value="phd" ${this.currentUser.profile?.education === 'phd' ? 'selected' : ''}>PhD</option>
                                        <option value="other" ${this.currentUser.profile?.education === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <button type="submit" class="btn btn-primary">Update Profile</button>
                            </form>
                        </div>

                        <div class="profile-stats">
                            <div class="stats-card card">
                                <h3>Learning Statistics</h3>
                                <div class="stat-item">
                                    <span class="stat-label">Courses Enrolled:</span>
                                    <span class="stat-value">${this.courses.getEnrolledCourses().length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Courses Completed:</span>
                                    <span class="stat-value">${this.courses.getCompletedCourses().length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Certificates Earned:</span>
                                    <span class="stat-value">${this.certificates.getUserCertificates().length}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Learning Hours:</span>
                                    <span class="stat-value">${this.calculateTotalHours()}h</span>
                                </div>
                            </div>

                            <div class="account-actions card">
                                <h3>Account Actions</h3>
                                <button class="btn btn-outline" onclick="app.changePassword()">
                                    Change Password
                                </button>
                                <button class="btn btn-outline" onclick="app.exportData()">
                                    Export Data
                                </button>
                                <button class="btn btn-danger" onclick="app.deleteAccount()">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
        this.setupProfileForm();
    }

    setupContactForm() {
        const form = document.getElementById('contact-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Simulate form submission
            setTimeout(() => {
                this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }, 1000);
        });
    }

    setupProfileForm() {
        const form = document.getElementById('profile-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            const formData = new FormData(form);
            const profileData = {
                name: formData.get('name'),
                email: formData.get('email'),
                profile: {
                    phone: formData.get('phone'),
                    bio: formData.get('bio'),
                    education: formData.get('education')
                }
            };

            const result = this.auth.updateUserProfile(profileData);

            if (result.success) {
                this.currentUser = result.user;
                this.showNotification('Profile updated successfully!', 'success');
                this.updateNavigation();
            } else {
                this.showNotification(result.error, 'error');
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Profile';
        });
    }

    changePassword() {
        this.showNotification('Change password feature coming soon!', 'info');
    }

    exportData() {
        const userData = {
            user: this.currentUser,
            courses: this.courses.getEnrolledCourses(),
            certificates: this.certificates.getUserCertificates()
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `lms-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('Data exported successfully!', 'success');
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            this.logout();
            this.showNotification('Account deleted successfully', 'info');
        }
    }

    updateCurrentYear() {
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }

    initializeTheme() {
        const savedTheme = this.storage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.storage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.showNotification(`Switched to ${newTheme} mode`, 'success');
    }

    showSettings() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        const html = `
            <div class="container">
                <div class="settings-page">
                    <div class="settings-header">
                        <h1>⚙️ Settings</h1>
                        <p>Customize your learning experience</p>
                    </div>

                    <div class="settings-content grid lg:grid-2">
                        <div class="appearance-settings card">
                            <div class="settings-section">
                                <h3>🎨 Appearance</h3>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Theme</h4>
                                        <p>Choose between light and dark mode</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" ${currentTheme === 'dark' ? 'checked' : ''} onchange="app.toggleTheme()">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon moon-icon">🌙</span>
                                            <span class="toggle-icon sun-icon">☀️</span>
                                        </span>
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Font Size</h4>
                                        <p>Adjust text size for better readability</p>
                                    </div>
                                    <select class="form-select" style="width: auto;" onchange="app.changeFontSize(this.value)">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Reduced Motion</h4>
                                        <p>Minimize animations and transitions</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" onchange="app.toggleReducedMotion(this.checked)">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon">🏃</span>
                                            <span class="toggle-icon">🚶</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="learning-settings card">
                            <div class="settings-section">
                                <h3>📚 Learning Preferences</h3>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Auto-save Progress</h4>
                                        <p>Automatically save your course progress</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" checked onchange="app.toggleAutoSave(this.checked)">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon">💾</span>
                                            <span class="toggle-icon">💾</span>
                                        </span>
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Study Reminders</h4>
                                        <p>Get notifications to continue learning</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" onchange="app.toggleReminders(this.checked)">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon">🔔</span>
                                            <span class="toggle-icon">🔕</span>
                                        </span>
                                    </label>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Quiz Timer</h4>
                                        <p>Show timer during quizzes</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" checked onchange="app.toggleQuizTimer(this.checked)">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon">⏱️</span>
                                            <span class="toggle-icon">⏱️</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="privacy-settings card">
                            <div class="settings-section">
                                <h3>🔒 Privacy & Security</h3>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Profile Visibility</h4>
                                        <p>Control who can see your profile</p>
                                    </div>
                                    <select class="form-select" style="width: auto;">
                                        <option value="public">Public</option>
                                        <option value="friends" selected>Friends Only</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Data Collection</h4>
                                        <p>Allow analytics to improve the platform</p>
                                    </div>
                                    <label class="theme-toggle">
                                        <input type="checkbox" checked onchange="app.toggleAnalytics(this.checked)">
                                        <span class="toggle-slider">
                                            <span class="toggle-icon">📊</span>
                                            <span class="toggle-icon">📊</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="account-settings card">
                            <div class="settings-section">
                                <h3>👤 Account Management</h3>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add extra security to your account</p>
                                    </div>
                                    <button class="btn btn-outline" onclick="app.setupTwoFactor()">
                                        Enable 2FA
                                    </button>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Download Data</h4>
                                        <p>Export all your learning data</p>
                                    </div>
                                    <button class="btn btn-outline" onclick="app.exportData()">
                                        Download
                                    </button>
                                </div>

                                <div class="setting-item">
                                    <div class="setting-info">
                                        <h4>Delete Account</h4>
                                        <p>Permanently remove your account and data</p>
                                    </div>
                                    <button class="btn btn-danger" onclick="app.deleteAccount()">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-footer card text-center" style="margin-top: 2rem;">
                        <h3>Need Help?</h3>
                        <p>If you have any questions about these settings, feel free to contact our support team.</p>
                        <button class="btn btn-primary" onclick="app.router.navigate('contact')">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderContent(html);
    }

    changeFontSize(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.documentElement.style.fontSize = sizes[size];
        this.storage.setItem('fontSize', size);
        this.showNotification(`Font size changed to ${size}`, 'success');
    }

    toggleReducedMotion(enabled) {
        if (enabled) {
            document.documentElement.style.setProperty('--transition', 'none');
            document.documentElement.style.setProperty('--transition-slow', 'none');
        } else {
            document.documentElement.style.removeProperty('--transition');
            document.documentElement.style.removeProperty('--transition-slow');
        }
        this.storage.setItem('reducedMotion', enabled);
        this.showNotification(`Reduced motion ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleAutoSave(enabled) {
        this.storage.setItem('autoSave', enabled);
        this.showNotification(`Auto-save ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleReminders(enabled) {
        this.storage.setItem('reminders', enabled);
        this.showNotification(`Study reminders ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleQuizTimer(enabled) {
        this.storage.setItem('quizTimer', enabled);
        this.showNotification(`Quiz timer ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleAnalytics(enabled) {
        this.storage.setItem('analytics', enabled);
        this.showNotification(`Data collection ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    setupTwoFactor() {
        this.showNotification('Two-factor authentication setup coming soon!', 'info');
    }

    showError(message) {
        this.renderContent(`
            <div class="container">
                <div class="error-page text-center">
                    <h1>Oops! Something went wrong</h1>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Reload Application
                    </button>
                </div>
            </div>
        `);
    }

    checkAuthAndRender() {
        this.currentUser = this.auth.getCurrentUser();
        this.updateNavigation();
        this.router.handleRoute();
    }

    // Handle OAuth callbacks
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = window.location.pathname.split('/')[2]; // Extract provider from path

        if (code && provider) {
            // Process OAuth callback
            this.auth.handleOAuthCallback(provider);
            // Clean up URL
            window.history.replaceState({}, document.title, '/');
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LMSApp();
});
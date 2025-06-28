// Main application controller
class LMSApp {
    constructor() {
        this.router = new Router();
        this.storage = new Storage();
        this.courses = new CoursesManager();
        this.quiz = new QuizManager();
        this.search = new SearchManager();
        this.certificate = new CertificateManager();
        
        this.currentUser = null;
        this.installPrompt = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize user session
            this.currentUser = this.storage.getUser() || this.createDefaultUser();
            
            // Setup PWA features
            this.setupPWA();
            
            // Setup offline detection
            this.setupOfflineDetection();
            
            // Setup navigation
            this.setupNavigation();
            
            // Initialize router
            this.setupRoutes();
            
            // Hide loading screen and show app
            this.showApp();
            
            console.log('LMS App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize application');
        }
    }
    
    createDefaultUser() {
        // No default user - authentication required to access courses
        this.currentUser = null;
        return null;
    }
    
    setupPWA() {
        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallBanner();
        });
        
        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            this.hideInstallBanner();
            console.log('PWA was installed');
        });
        
        // Setup install button
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
        
        const dismissBtn = document.getElementById('dismiss-install');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallBanner();
            });
        }
    }
    
    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const banner = document.getElementById('offline-banner');
            if (navigator.onLine) {
                banner?.classList.remove('show');
            } else {
                banner?.classList.add('show');
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial check
        updateOnlineStatus();
    }
    
    setupNavigation() {
        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
            });
        });
        
        // Update active nav link
        this.updateActiveNavLink();
        window.addEventListener('hashchange', () => {
            this.updateActiveNavLink();
        });
    }
    
    setupRoutes() {
        // Public routes (no authentication required)
        this.router.addRoute('/login', () => this.showLogin());
        this.router.addRoute('/signup', () => this.showSignup());
        this.router.addRoute('/contact', () => this.showContact());
        this.router.addRoute('/about', () => this.showAbout());
        this.router.addRoute('/privacy', () => this.showPrivacy());
        this.router.addRoute('/terms', () => this.showTerms());
        
        // Protected routes (authentication required)
        this.router.addRoute('/', () => this.requireAuth(() => this.showDashboard()));
        this.router.addRoute('/courses', () => this.requireAuth(() => this.showCourses()));
        this.router.addRoute('/course/:id', (params) => this.requireAuth(() => this.showCourse(params.id)));
        this.router.addRoute('/lesson/:courseId/:lessonId', (params) => 
            this.requireAuth(() => this.showLesson(params.courseId, params.lessonId)));
        this.router.addRoute('/quiz/:courseId/:quizId', (params) => 
            this.requireAuth(() => this.showQuiz(params.courseId, params.quizId)));
        this.router.addRoute('/search', () => this.requireAuth(() => this.showSearch()));
        this.router.addRoute('/certificates', () => this.requireAuth(() => this.showCertificates()));
        
        // Start router
        this.router.start();
    }
    
    showApp() {
        document.getElementById('loading')?.classList.add('hidden');
        document.getElementById('app')?.classList.remove('hidden');
        this.updateNavigation();
    }
    
    requireAuth(callback) {
        if (!this.currentUser || !this.currentUser.isAuthenticated) {
            this.showNotification('Please log in to access this page.', 'warning');
            this.router.navigate('/login');
            return;
        }
        callback();
    }
    
    updateNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        const navAuth = document.querySelector('.nav-auth');
        
        if (this.currentUser && this.currentUser.isAuthenticated) {
            // Show main navigation for authenticated users
            if (navMenu) navMenu.style.display = 'flex';
            if (navAuth) {
                navAuth.innerHTML = `
                    <span class="nav-user">Welcome, ${this.currentUser.name}</span>
                    <button onclick="window.lmsApp.logout()" class="btn btn-outline btn-sm">Logout</button>
                `;
            }
        } else {
            // Hide main navigation for unauthenticated users
            if (navMenu) navMenu.style.display = 'none';
            if (navAuth) {
                navAuth.innerHTML = `
                    <a href="/login" class="nav-link" data-route="/login">Login</a>
                    <a href="/signup" class="nav-link btn btn-primary" data-route="/signup">Sign Up</a>
                `;
            }
        }
    }
    
    logout() {
        this.currentUser = null;
        this.storage.removeItem('lms_user');
        this.showNotification('You have been logged out successfully.', 'info');
        this.updateNavigation();
        this.router.navigate('/login');
    }
    
    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Error</h2>
                        <p class="text-gray-600">${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            Reload Application
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    showInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (banner && this.installPrompt) {
            banner.classList.add('show');
        }
    }
    
    hideInstallBanner() {
        const banner = document.getElementById('install-banner');
        banner?.classList.remove('show');
    }
    
    async installApp() {
        if (this.installPrompt) {
            const result = await this.installPrompt.prompt();
            console.log('Install prompt result:', result);
            this.installPrompt = null;
            this.hideInstallBanner();
        }
    }
    
    updateActiveNavLink() {
        const currentPath = window.location.pathname || '/';
        document.querySelectorAll('.nav-link').forEach(link => {
            const route = link.getAttribute('data-route');
            if (route === currentPath || (currentPath.startsWith(route) && route !== '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Route handlers
    showDashboard() {
        const enrolledCourses = this.currentUser.enrolledCourses.map(courseId => 
            COURSES_DATA.find(course => course.id === courseId)
        ).filter(Boolean);
        
        const completedCount = this.currentUser.completedCourses.length;
        const inProgressCount = enrolledCourses.length - completedCount;
        const certificatesCount = this.currentUser.certificates.length;
        
        const html = `
            <div class="dashboard">
                <h1>Welcome back, ${this.currentUser.name}!</h1>
                <p class="text-gray-600 mb-6">Continue your learning journey</p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${enrolledCourses.length}</div>
                        <div class="stat-label">Enrolled Courses</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${inProgressCount}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${completedCount}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${certificatesCount}</div>
                        <div class="stat-label">Certificates</div>
                    </div>
                </div>
                
                ${enrolledCourses.length > 0 ? `
                    <div class="card">
                        <div class="card-header">
                            <h3>Continue Learning</h3>
                        </div>
                        <div class="card-body">
                            <div class="progress-card">
                                ${enrolledCourses.map(course => {
                                    const progress = this.currentUser.progress[course.id] || { completed: 0, total: course.lessons.length };
                                    const percentage = Math.round((progress.completed / progress.total) * 100);
                                    
                                    return `
                                        <div class="progress-item">
                                            <div class="progress-info">
                                                <div class="progress-course">${course.title}</div>
                                                <div class="progress-status">${progress.completed}/${progress.total} lessons completed</div>
                                                <div class="progress mt-2">
                                                    <div class="progress-bar" style="width: ${percentage}%"></div>
                                                </div>
                                            </div>
                                            <div class="progress-percentage">${percentage}%</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="/courses" class="btn btn-primary">Browse All Courses</a>
                        </div>
                    </div>
                ` : `
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>Start Your Learning Journey</h3>
                            <p class="text-gray-600 mb-4">You haven't enrolled in any courses yet. Browse our course catalog to get started!</p>
                            <a href="/courses" class="btn btn-primary">Browse Courses</a>
                        </div>
                    </div>
                `}
                
                <div class="grid grid-2 mt-6">
                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Activity</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-gray-600">Your recent learning activity will appear here.</p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>Achievements</h3>
                        </div>
                        <div class="card-body">
                            ${certificatesCount > 0 ? 
                                `<p>You've earned ${certificatesCount} certificate${certificatesCount > 1 ? 's' : ''}!</p>
                                 <a href="/certificates" class="btn btn-outline">View Certificates</a>` :
                                `<p class="text-gray-600">Complete courses to earn certificates and unlock achievements.</p>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderContent(html);
    }
    
    showCourses() {
        this.courses.renderCourseList();
    }
    
    showCourse(courseId) {
        this.courses.renderCourseDetail(courseId);
    }
    
    showLesson(courseId, lessonId) {
        this.courses.renderLesson(courseId, lessonId);
    }
    
    showQuiz(courseId, quizId) {
        this.quiz.renderQuiz(courseId, quizId);
    }
    
    showSearch() {
        this.search.renderSearch();
    }
    
    showCertificates() {
        this.certificate.renderCertificates();
    }
    
    showLogin() {
        const html = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="card" style="max-width: 500px; margin: 0 auto;">
                        <div class="card-header text-center">
                            <h2>Welcome Back</h2>
                            <p class="text-gray-600">Sign in to your account</p>
                        </div>
                        <div class="card-body">
                            <div class="demo-accounts mb-4" style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 1rem;">
                                <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #495057;">Demo Accounts Available:</h4>
                                <div style="font-size: 0.85rem; color: #6c757d;">
                                    <p style="margin: 0.25rem 0;"><strong>Student:</strong> student@demo.com</p>
                                    <p style="margin: 0.25rem 0;"><strong>Teacher:</strong> teacher@demo.com</p>
                                    <p style="margin: 0.25rem 0;"><strong>Admin:</strong> admin@demo.com</p>
                                    <p style="margin: 0.5rem 0 0 0; font-style: italic;">Password for all accounts: <strong>demo123</strong></p>
                                </div>
                            </div>
                            
                            <form id="login-form" onsubmit="window.lmsApp.handleLogin(event)">
                                <div class="form-group">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" id="email" name="email" class="form-input" required 
                                           placeholder="Choose a demo account above">
                                </div>
                                
                                <div class="form-group">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" id="password" name="password" class="form-input" required 
                                           placeholder="Enter demo123">
                                </div>
                                
                                <div class="form-group">
                                    <label class="flex items-center gap-2">
                                        <input type="checkbox" id="remember" name="remember">
                                        <span class="text-sm">Remember me</span>
                                    </label>
                                </div>
                                
                                <button type="submit" class="btn btn-primary" style="width: 100%;">
                                    Sign In
                                </button>
                            </form>
                            
                            <div class="demo-buttons mt-3">
                                <p class="text-sm text-gray-600 mb-2">Quick Login:</p>
                                <div class="grid grid-1 gap-2">
                                    <button onclick="window.lmsApp.quickLogin('student@demo.com')" class="btn btn-outline btn-sm">
                                        Login as Student
                                    </button>
                                    <button onclick="window.lmsApp.quickLogin('teacher@demo.com')" class="btn btn-outline btn-sm">
                                        Login as Teacher
                                    </button>
                                    <button onclick="window.lmsApp.quickLogin('admin@demo.com')" class="btn btn-outline btn-sm">
                                        Login as Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center">
                            <p class="text-sm text-gray-600">
                                New to the platform? 
                                <a href="/signup" class="text-blue-600 font-semibold">Create demo account</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    showSignup() {
        const html = `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="card" style="max-width: 500px; margin: 0 auto;">
                        <div class="card-header text-center">
                            <h2>Create Account</h2>
                            <p class="text-gray-600">Join our learning platform</p>
                        </div>
                        <div class="card-body">
                            <form id="signup-form" onsubmit="window.lmsApp.handleSignup(event)">
                                <div class="grid grid-2 gap-4">
                                    <div class="form-group">
                                        <label for="firstName" class="form-label">First Name</label>
                                        <input type="text" id="firstName" name="firstName" class="form-input" required 
                                               placeholder="Enter your first name">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="lastName" class="form-label">Last Name</label>
                                        <input type="text" id="lastName" name="lastName" class="form-input" required 
                                               placeholder="Enter your last name">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" id="email" name="email" class="form-input" required 
                                           placeholder="Enter your email address">
                                </div>
                                
                                <div class="form-group">
                                    <label for="password" class="form-label">Password</label>
                                    <input type="password" id="password" name="password" class="form-input" required 
                                           placeholder="Create a strong password" minlength="8">
                                    <small class="text-xs text-gray-500">Password must be at least 8 characters long</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" required 
                                           placeholder="Confirm your password">
                                </div>
                                
                                <div class="form-group">
                                    <label class="flex items-start gap-2">
                                        <input type="checkbox" id="terms" name="terms" required class="mt-1">
                                        <span class="text-sm">
                                            I agree to the <a href="/terms" class="text-blue-600">Terms of Service</a> 
                                            and <a href="/privacy" class="text-blue-600">Privacy Policy</a>
                                        </span>
                                    </label>
                                </div>
                                
                                <div class="form-group">
                                    <label class="flex items-center gap-2">
                                        <input type="checkbox" id="newsletter" name="newsletter">
                                        <span class="text-sm">Subscribe to our newsletter for updates and tips</span>
                                    </label>
                                </div>
                                
                                <button type="submit" class="btn btn-primary" style="width: 100%;">
                                    Create Account
                                </button>
                            </form>
                        </div>
                        <div class="card-footer text-center">
                            <p class="text-sm text-gray-600">
                                Already have an account? 
                                <a href="/login" class="text-blue-600 font-semibold">Sign in here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    showContact() {
        const html = `
            <div class="contact-page">
                <div class="page-header text-center">
                    <h1>Contact Us</h1>
                    <p class="text-gray-600">Get in touch with our team</p>
                </div>
                
                <div class="grid grid-1 lg:grid-2 gap-8">
                    <div class="contact-info">
                        <div class="card">
                            <div class="card-header">
                                <h3>Get in Touch</h3>
                            </div>
                            <div class="card-body">
                                <div class="contact-methods">
                                    <div class="contact-method">
                                        <div class="contact-icon">📧</div>
                                        <div>
                                            <h4>Email Support</h4>
                                            <p class="text-gray-600">support@lmsplatform.com</p>
                                            <p class="text-sm text-gray-500">We typically respond within 24 hours</p>
                                        </div>
                                    </div>
                                    
                                    <div class="contact-method">
                                        <div class="contact-icon">📞</div>
                                        <div>
                                            <h4>Phone Support</h4>
                                            <p class="text-gray-600">+1 (555) 123-4567</p>
                                            <p class="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
                                        </div>
                                    </div>
                                    
                                    <div class="contact-method">
                                        <div class="contact-icon">💬</div>
                                        <div>
                                            <h4>Live Chat</h4>
                                            <p class="text-gray-600">Available on website</p>
                                            <p class="text-sm text-gray-500">Monday - Friday, 9 AM - 5 PM EST</p>
                                        </div>
                                    </div>
                                    
                                    <div class="contact-method">
                                        <div class="contact-icon">📍</div>
                                        <div>
                                            <h4>Office Address</h4>
                                            <p class="text-gray-600">123 Learning Street<br>Education City, EC 12345</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-form">
                        <div class="card">
                            <div class="card-header">
                                <h3>Send us a Message</h3>
                            </div>
                            <div class="card-body">
                                <form id="contact-form" onsubmit="window.lmsApp.handleContact(event)">
                                    <div class="grid grid-2 gap-4">
                                        <div class="form-group">
                                            <label for="firstName" class="form-label">First Name</label>
                                            <input type="text" id="firstName" name="firstName" class="form-input" required>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="lastName" class="form-label">Last Name</label>
                                            <input type="text" id="lastName" name="lastName" class="form-input" required>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" id="email" name="email" class="form-input" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="subject" class="form-label">Subject</label>
                                        <select id="subject" name="subject" class="form-select" required>
                                            <option value="">Select a topic</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="billing">Billing Questions</option>
                                            <option value="courses">Course Content</option>
                                            <option value="partnership">Partnership Opportunities</option>
                                            <option value="feedback">Feedback & Suggestions</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="message" class="form-label">Message</label>
                                        <textarea id="message" name="message" class="form-input" rows="5" required 
                                                  placeholder="Tell us how we can help you..."></textarea>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="faq-section mt-8">
                    <div class="card">
                        <div class="card-header">
                            <h3>Frequently Asked Questions</h3>
                        </div>
                        <div class="card-body">
                            <div class="faq-list">
                                <div class="faq-item">
                                    <h4>How do I reset my password?</h4>
                                    <p class="text-gray-600">Click on "Forgot Password" on the login page and follow the instructions sent to your email.</p>
                                </div>
                                
                                <div class="faq-item">
                                    <h4>Can I access courses offline?</h4>
                                    <p class="text-gray-600">Yes! Our platform works offline once you've loaded the content. You can continue learning even without internet.</p>
                                </div>
                                
                                <div class="faq-item">
                                    <h4>How do I download my certificates?</h4>
                                    <p class="text-gray-600">Visit the Certificates page in your dashboard and click the download button next to any completed course certificate.</p>
                                </div>
                                
                                <div class="faq-item">
                                    <h4>Is there a mobile app?</h4>
                                    <p class="text-gray-600">Our web platform is fully responsive and can be installed as a PWA (Progressive Web App) on your mobile device for a native app experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    showAbout() {
        const html = `
            <div class="about-page">
                <div class="hero-section text-center mb-8">
                    <h1>About LMS Platform</h1>
                    <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                        Empowering learners worldwide with accessible, high-quality education through innovative technology and expert instruction.
                    </p>
                </div>
                
                <div class="grid grid-1 lg:grid-2 gap-8 mb-8">
                    <div class="card">
                        <div class="card-body">
                            <h3>Our Mission</h3>
                            <p class="text-gray-600">
                                To democratize education by providing accessible, high-quality learning experiences that empower 
                                individuals to achieve their personal and professional goals, regardless of their background or location.
                            </p>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-body">
                            <h3>Our Vision</h3>
                            <p class="text-gray-600">
                                A world where everyone has the opportunity to learn, grow, and succeed through innovative, 
                                technology-driven education that adapts to each learner's unique needs and circumstances.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="features-section mb-8">
                    <h2 class="text-center mb-6">Why Choose Our Platform?</h2>
                    <div class="grid grid-1 md:grid-3 gap-6">
                        <div class="feature-card text-center">
                            <div class="feature-icon">🌐</div>
                            <h4>Offline Learning</h4>
                            <p class="text-gray-600">Learn anywhere, anytime with our offline-capable Progressive Web App technology.</p>
                        </div>
                        
                        <div class="feature-card text-center">
                            <div class="feature-icon">🎓</div>
                            <h4>Expert Instructors</h4>
                            <p class="text-gray-600">Learn from industry professionals and experienced educators who are passionate about teaching.</p>
                        </div>
                        
                        <div class="feature-card text-center">
                            <div class="feature-icon">📱</div>
                            <h4>Mobile-First Design</h4>
                            <p class="text-gray-600">Seamlessly switch between devices with our responsive, mobile-optimized platform.</p>
                        </div>
                        
                        <div class="feature-card text-center">
                            <div class="feature-icon">🏆</div>
                            <h4>Verified Certificates</h4>
                            <p class="text-gray-600">Earn recognized certificates that showcase your achievements and skills to employers.</p>
                        </div>
                        
                        <div class="feature-card text-center">
                            <div class="feature-icon">📊</div>
                            <h4>Progress Tracking</h4>
                            <p class="text-gray-600">Monitor your learning journey with detailed progress analytics and personalized recommendations.</p>
                        </div>
                        
                        <div class="feature-card text-center">
                            <div class="feature-icon">🔒</div>
                            <h4>Privacy Focused</h4>
                            <p class="text-gray-600">Your data stays secure with local storage and privacy-first design principles.</p>
                        </div>
                    </div>
                </div>
                
                <div class="stats-section">
                    <div class="card">
                        <div class="card-header text-center">
                            <h3>Our Impact</h3>
                        </div>
                        <div class="card-body">
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-number">10,000+</div>
                                    <div class="stat-label">Active Learners</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">500+</div>
                                    <div class="stat-label">Courses Available</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">50+</div>
                                    <div class="stat-label">Expert Instructors</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-number">95%</div>
                                    <div class="stat-label">Completion Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    showPrivacy() {
        const html = `
            <div class="legal-page">
                <div class="page-header">
                    <h1>Privacy Policy</h1>
                    <p class="text-gray-600">Last updated: December 2024</p>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="legal-content">
                            <section class="mb-6">
                                <h3>Information We Collect</h3>
                                <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support.</p>
                                <ul class="mt-3">
                                    <li>Personal information (name, email address)</li>
                                    <li>Learning progress and course completion data</li>
                                    <li>Device and usage information for improving our services</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>How We Use Your Information</h3>
                                <p>We use the information we collect to:</p>
                                <ul class="mt-3">
                                    <li>Provide and maintain our educational services</li>
                                    <li>Track your learning progress and issue certificates</li>
                                    <li>Communicate with you about our services</li>
                                    <li>Improve our platform and develop new features</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Data Storage and Security</h3>
                                <p>Your learning data is primarily stored locally on your device using browser storage technologies. This means:</p>
                                <ul class="mt-3">
                                    <li>Your progress and preferences stay on your device</li>
                                    <li>You maintain control over your personal learning data</li>
                                    <li>We implement industry-standard security measures</li>
                                    <li>Data is encrypted both in transit and at rest</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Offline Functionality</h3>
                                <p>Our platform is designed to work offline using Progressive Web App technology. This means course content and your progress are cached locally for offline access.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Your Rights</h3>
                                <p>You have the right to:</p>
                                <ul class="mt-3">
                                    <li>Access and update your personal information</li>
                                    <li>Delete your account and associated data</li>
                                    <li>Export your learning data</li>
                                    <li>Opt out of non-essential communications</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Contact Us</h3>
                                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                                <ul class="mt-3">
                                    <li>Email: privacy@lmsplatform.com</li>
                                    <li>Address: 123 Learning Street, Education City, EC 12345</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    showTerms() {
        const html = `
            <div class="legal-page">
                <div class="page-header">
                    <h1>Terms of Service</h1>
                    <p class="text-gray-600">Last updated: December 2024</p>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <div class="legal-content">
                            <section class="mb-6">
                                <h3>Acceptance of Terms</h3>
                                <p>By accessing and using the LMS Platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Use License</h3>
                                <p>Permission is granted to temporarily access the materials on LMS Platform for personal, non-commercial transitory viewing only. This includes:</p>
                                <ul class="mt-3">
                                    <li>Access to course content for enrolled courses</li>
                                    <li>Personal use of learning materials</li>
                                    <li>Downloading certificates for completed courses</li>
                                </ul>
                                <p class="mt-3">This license shall automatically terminate if you violate any of these restrictions.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>User Accounts</h3>
                                <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
                                <ul class="mt-3">
                                    <li>Safeguarding your password and account information</li>
                                    <li>All activities that occur under your account</li>
                                    <li>Notifying us immediately of unauthorized access</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Course Access and Completion</h3>
                                <p>Course access and completion policies:</p>
                                <ul class="mt-3">
                                    <li>Course content is available for the duration of your enrollment</li>
                                    <li>Certificates are issued upon successful completion of course requirements</li>
                                    <li>Progress is tracked and stored locally on your device</li>
                                    <li>You may retake quizzes as needed to meet passing requirements</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Prohibited Uses</h3>
                                <p>You may not use our platform to:</p>
                                <ul class="mt-3">
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Share course content with unauthorized users</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Upload malicious code or interfere with platform functionality</li>
                                </ul>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Intellectual Property</h3>
                                <p>All course content, including but not limited to text, graphics, videos, and interactive elements, are the property of LMS Platform or our content partners and are protected by copyright laws.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Limitation of Liability</h3>
                                <p>LMS Platform shall not be liable for any damages arising from the use or inability to use our platform, including but not limited to direct, indirect, incidental, or consequential damages.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Changes to Terms</h3>
                                <p>We reserve the right to update these terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the updated terms.</p>
                            </section>
                            
                            <section class="mb-6">
                                <h3>Contact Information</h3>
                                <p>For questions about these Terms of Service, contact us at:</p>
                                <ul class="mt-3">
                                    <li>Email: legal@lmsplatform.com</li>
                                    <li>Address: 123 Learning Street, Education City, EC 12345</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.renderContent(html);
    }
    
    renderContent(html) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
        }
    }
    
    // User management methods
    enrollInCourse(courseId) {
        if (!this.currentUser.enrolledCourses.includes(courseId)) {
            this.currentUser.enrolledCourses.push(courseId);
            
            // Initialize progress tracking
            const course = COURSES_DATA.find(c => c.id === courseId);
            if (course) {
                this.currentUser.progress[courseId] = {
                    completed: 0,
                    total: course.lessons.length,
                    completedLessons: [],
                    lastAccessed: new Date().toISOString()
                };
            }
            
            this.storage.saveUser(this.currentUser);
            return true;
        }
        return false;
    }
    
    updateProgress(courseId, lessonId) {
        const progress = this.currentUser.progress[courseId];
        if (progress && !progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
            progress.completed = progress.completedLessons.length;
            progress.lastAccessed = new Date().toISOString();
            
            // Check if course is completed
            if (progress.completed === progress.total) {
                this.completeCourse(courseId);
            }
            
            this.storage.saveUser(this.currentUser);
        }
    }
    
    completeCourse(courseId) {
        if (!this.currentUser.completedCourses.includes(courseId)) {
            this.currentUser.completedCourses.push(courseId);
            
            // Generate certificate
            const course = COURSES_DATA.find(c => c.id === courseId);
            if (course) {
                const certificate = {
                    id: 'cert_' + Date.now(),
                    courseId: courseId,
                    courseTitle: course.title,
                    studentName: this.currentUser.name,
                    completionDate: new Date().toISOString(),
                    score: 100 // You can calculate actual score based on quizzes
                };
                
                this.currentUser.certificates.push(certificate);
            }
            
            this.storage.saveUser(this.currentUser);
        }
    }
    
    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }
    
    updateUser(userData) {
        this.currentUser = { ...this.currentUser, ...userData };
        this.storage.saveUser(this.currentUser);
    }
    
    handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        // Demo users for authentication
        const demoUsers = {
            'student@demo.com': {
                id: 'demo_student',
                name: 'Demo Student',
                email: 'student@demo.com',
                role: 'student',
                enrolledCourses: ['js-basics', 'web-dev'],
                completedLessons: [],
                certificates: [],
                progress: {},
                isAuthenticated: true,
                loginDate: new Date().toISOString()
            },
            'teacher@demo.com': {
                id: 'demo_teacher',
                name: 'Demo Teacher',
                email: 'teacher@demo.com',
                role: 'teacher',
                enrolledCourses: ['js-basics', 'web-dev', 'react-advanced', 'node-backend'],
                completedLessons: [],
                certificates: [],
                progress: {},
                isAuthenticated: true,
                loginDate: new Date().toISOString()
            },
            'admin@demo.com': {
                id: 'demo_admin',
                name: 'Demo Admin',
                email: 'admin@demo.com',
                role: 'admin',
                enrolledCourses: ['js-basics', 'web-dev', 'react-advanced', 'node-backend', 'python-intro'],
                completedLessons: [],
                certificates: [],
                progress: {},
                isAuthenticated: true,
                loginDate: new Date().toISOString()
            }
        };
        
        // Validate demo user credentials
        if (email && password === 'demo123' && demoUsers[email]) {
            const user = demoUsers[email];
            
            this.storage.saveUser(user);
            this.currentUser = user;
            
            // Show success message
            this.showNotification(`Welcome back, ${user.name}! You have been successfully logged in.`, 'success');
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
                this.router.navigate('/');
            }, 1500);
        } else {
            this.showNotification('Invalid credentials. Please use one of the demo accounts shown below.', 'error');
        }
    }
    
    handleSignup(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const termsAccepted = formData.get('terms');
        const newsletter = formData.get('newsletter');
        
        // Validate form data
        if (!firstName || !lastName || !email || !password) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match.', 'error');
            return;
        }
        
        if (password.length < 8) {
            this.showNotification('Password must be at least 8 characters long.', 'error');
            return;
        }
        
        if (!termsAccepted) {
            this.showNotification('You must accept the Terms of Service to create an account.', 'error');
            return;
        }
        
        // Create new user account
        const user = {
            id: 'user_' + Date.now(),
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`,
            email: email,
            signupDate: new Date().toISOString(),
            newsletter: !!newsletter,
            isAuthenticated: true,
            enrolledCourses: [],
            completedLessons: [],
            certificates: [],
            progress: {}
        };
        
        this.storage.saveUser(user);
        this.currentUser = user;
        
        // Show success message
        this.showNotification('Account created successfully! Welcome to our learning platform.', 'success');
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
            this.router.navigate('/');
        }, 2000);
    }
    
    handleContact(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Validate form data
        if (!firstName || !lastName || !email || !subject || !message) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Simulate sending message (in a real app, this would send to a backend)
        const contactMessage = {
            id: 'msg_' + Date.now(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            subject: subject,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        
        // Store message locally for demo purposes
        const existingMessages = JSON.parse(localStorage.getItem('lms_contact_messages') || '[]');
        existingMessages.push(contactMessage);
        localStorage.setItem('lms_contact_messages', JSON.stringify(existingMessages));
        
        // Show success message
        this.showNotification('Thank you for your message! We will get back to you within 24 hours.', 'success');
        
        // Reset form
        event.target.reset();
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    quickLogin(email) {
        // Auto-fill and submit login form
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput && passwordInput) {
            emailInput.value = email;
            passwordInput.value = 'demo123';
            
            // Create and dispatch a form submit event
            const form = document.getElementById('login-form');
            if (form) {
                const event = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(event);
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lmsApp = new LMSApp();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

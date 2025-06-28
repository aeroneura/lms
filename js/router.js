// Simple client-side router for the LMS application
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.defaultRoute = '/login';
    }
    
    /**
     * Add a new route to the router
     * @param {string} path - The route path (can include parameters like :id)
     * @param {function} handler - The function to call when the route matches
     */
    addRoute(path, handler) {
        this.routes[path] = {
            handler: handler,
            regex: this.pathToRegex(path)
        };
    }
    
    /**
     * Convert a path with parameters to a regex
     * @param {string} path - The path to convert
     * @returns {RegExp} - The regex for matching the path
     */
    pathToRegex(path) {
        const parameterNames = [];
        const regexPath = path
            .replace(/\//g, '\\/')
            .replace(/:\w+/g, (match) => {
                parameterNames.push(match.slice(1));
                return '([^/]+)';
            });
        
        const regex = new RegExp(`^${regexPath}$`);
        regex.parameterNames = parameterNames;
        return regex;
    }
    
    /**
     * Navigate to a specific route
     * @param {string} path - The path to navigate to
     */
    navigate(path) {
        history.pushState({}, '', path);
        this.handleRouteChange();
    }
    
    /**
     * Get the current path from the URL
     * @returns {string} - The current path
     */
    getCurrentPath() {
        return window.location.pathname || this.defaultRoute;
    }
    
    /**
     * Match the current path against registered routes
     * @param {string} path - The path to match
     * @returns {object|null} - Match result with handler and params
     */
    matchRoute(path) {
        for (const [routePath, route] of Object.entries(this.routes)) {
            const match = path.match(route.regex);
            if (match) {
                const params = {};
                if (route.regex.parameterNames) {
                    route.regex.parameterNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                }
                
                return {
                    handler: route.handler,
                    params: params,
                    path: routePath
                };
            }
        }
        return null;
    }
    
    /**
     * Handle route changes
     */
    handleRouteChange() {
        const currentPath = this.getCurrentPath();
        const match = this.matchRoute(currentPath);
        
        if (match ) {
            try {
                // Store current route info
                this.currentRoute = {
                    path: currentPath,
                    params: match.params
                };
                
                // Call the route handler
                match.handler(match.params);
                
                // Update page title based on route
                this.updatePageTitle(currentPath, match.params);
                
                // Scroll to top of page
                window.scrollTo(0, 0);
                
            } catch (error) {
                console.error('Error handling route:', error);
                this.handleRouteError(error);
            }
        } else {
            console.warn('No route found for:', currentPath);
            this.handle404();
        }
    }
    
    /**
     * Update the page title based on the current route
     * @param {string} path - The current path
     * @param {object} params - Route parameters
     */
    updatePageTitle(path, params) {
        let title = 'LMS Platform';
        
        switch (true) {
            case path === '/':
                title = 'Dashboard - LMS Platform';
                break;
            case path === '/courses':
                title = 'Courses - LMS Platform';
                break;
            case path.startsWith('/course/'):
                if (params.id && window.lmsApp) {
                    const course = COURSES_DATA.find(c => c.id === params.id);
                    title = course ? `${course.title} - LMS Platform` : 'Course - LMS Platform';
                }
                break;
            case path.startsWith('/lesson/'):
                title = 'Lesson - LMS Platform';
                break;
            case path.startsWith('/quiz/'):
                title = 'Quiz - LMS Platform';
                break;
            case path === '/search':
                title = 'Search Courses - LMS Platform';
                break;
            case path === '/certificates':
                title = 'My Certificates - LMS Platform';
                break;
            case path === '/login':
                title = 'Login - LMS Platform';
                break;
            case path === '/signup':
                title = 'Sign Up - LMS Platform';
                break;
            case path === '/contact':
                title = 'Contact Us - LMS Platform';
                break;
            case path === '/about':
                title = 'About - LMS Platform';
                break;
            case path === '/privacy':
                title = 'Privacy Policy - LMS Platform';
                break;
            case path === '/terms':
                title = 'Terms of Service - LMS Platform';
                break;
            default:
                title = 'LMS Platform';
        }
        
        document.title = title;
    }
    
    /**
     * Handle 404 errors
     */
    handle404() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Page Not Found</h2>
                        <p class="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                        <div class="flex gap-4 justify-center">
                            <a href="/" class="btn btn-primary">Go to Dashboard</a>
                            <a href="/courses" class="btn btn-outline">Browse Courses</a>
                        </div>
                    </div>
                </div>
            `;
        }
        document.title = 'Page Not Found - LMS Platform';
    }
    
    /**
     * Handle route errors
     * @param {Error} error - The error that occurred
     */
    handleRouteError(error) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="card">
                    <div class="card-body text-center">
                        <h2>Something Went Wrong</h2>
                        <p class="text-gray-600 mb-4">An error occurred while loading this page.</p>
                        <details class="mb-4">
                            <summary class="cursor-pointer text-sm text-gray-500">Technical Details</summary>
                            <pre class="text-left text-xs mt-2 p-2 bg-gray-100 rounded">${error.message}</pre>
                        </details>
                        <div class="flex gap-4 justify-center">
                            <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
                            <a href="/" class="btn btn-outline">Go to Dashboard</a>
                        </div>
                    </div>
                </div>
            `;
        }
        document.title = 'Error - LMS Platform';
    }
    
    /**
     * Get query parameters from the URL
     * @returns {object} - Object containing query parameters
     */
    getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    }
    
    /**
     * Get the current route information
     * @returns {object|null} - Current route info
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    /**
     * Check if the current route matches a pattern
     * @param {string} pattern - The pattern to check against
     * @returns {boolean} - Whether the current route matches
     */
    isCurrentRoute(pattern) {
        if (!this.currentRoute) return false;
        
        if (pattern === this.currentRoute.path) return true;
        if (pattern.endsWith('*') && this.currentRoute.path.startsWith(pattern.slice(0, -1))) return true;
        
        return false;
    }
    
    /**
     * Add navigation guards (for future use)
     * @param {function} guard - Function that returns true/false for navigation
     */
    addGuard(guard) {
        this.guards = this.guards || [];
        this.guards.push(guard);
    }
    
    /**
     * Execute navigation guards
     * @param {string} path - The path being navigated to
     * @returns {boolean} - Whether navigation should proceed
     */
    executeGuards(path) {
        if (!this.guards) return true;
        
        return this.guards.every(guard => {
            try {
                return guard(path, this.currentRoute);
            } catch (error) {
                console.error('Navigation guard error:', error);
                return false;
            }
        });
    }
    
    /**
     * Start the router
     */
    start() {
        // Handle initial route
        this.handleRouteChange();
        
        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
        
        // Intercept clicks on internal links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="/"]');
            if (link && link.href.startsWith(window.location.origin)) {
                event.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== window.location.pathname) {
                    this.navigate(href);
                }
            }
        });
        
        console.log('Router started');
    }
    
    /**
     * Stop the router (cleanup)
     */
    stop() {
        // Remove event listeners if needed
        // This is mainly for testing or if the router needs to be restarted
        console.log('Router stopped');
    }
    
    /**
     * Get a list of all registered routes
     * @returns {Array} - Array of route paths
     */
    getRoutes() {
        return Object.keys(this.routes);
    }
    
    /**
     * Build a URL for a route with parameters
     * @param {string} routePath - The route path template
     * @param {object} params - Parameters to substitute
     * @returns {string} - The built URL
     */
    buildUrl(routePath, params = {}) {
        let url = routePath;
        
        // Replace route parameters
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, encodeURIComponent(value));
        });
        
        return url;
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}

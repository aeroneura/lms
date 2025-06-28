class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = '';
        this.defaultRoute = '';
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    setDefaultRoute(path) {
        this.defaultRoute = path;
    }

    navigate(path, params = {}) {
        // Update URL using History API
        if (window.location.pathname !== `/${path}`) {
            window.history.pushState({}, '', `/${path}`);
        }
        this.currentRoute = path;

        // Find and execute route handler
        const handler = this.routes.get(path);
        if (handler) {
            handler(params);
        } else {
            // Try to match dynamic routes
            const matchedRoute = this.matchDynamicRoute(path);
            if (matchedRoute) {
                matchedRoute.handler(matchedRoute.params);
            } else if (this.defaultRoute) {
                this.navigate(this.defaultRoute);
            }
        }

        // Update navigation state
        if (window.app && window.app.updateNavigation && typeof window.app.updateNavigation === 'function') {
            window.app.updateNavigation();
        }
    }

    matchDynamicRoute(path) {
        for (const [routePath, handler] of this.routes) {
            if (routePath.includes(':')) {
                const routeParts = routePath.split('/');
                const pathParts = path.split('/');

                if (routeParts.length === pathParts.length) {
                    const params = {};
                    let isMatch = true;

                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            // Dynamic parameter
                            const paramName = routeParts[i].substring(1);
                            params[paramName] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            // Static part doesn't match
                            isMatch = false;
                            break;
                        }
                    }

                    if (isMatch) {
                        return { handler, params };
                    }
                }
            }
        }
        return null;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    init() {
        // Handle initial route from URL pathname
        const path = window.location.pathname.substring(1) || this.defaultRoute;
        this.navigate(path);

        // Listen for popstate (back/forward button)
        window.addEventListener('popstate', () => {
            const newPath = window.location.pathname.substring(1) || this.defaultRoute;
            if (newPath !== this.currentRoute) {
                this.navigate(newPath);
            }
        });
    }
}

class Auth {
    constructor() {
        this.storage = new Storage();
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.oauthProviders = {
            google: {
                clientId: 'your-google-client-id',
                redirectUri: window.location.origin + '/oauth/google',
                scope: 'openid email profile'
            },
            microsoft: {
                clientId: 'your-microsoft-client-id',
                redirectUri: window.location.origin + '/oauth/microsoft',
                scope: 'openid email profile'
            },
            apple: {
                clientId: 'your-apple-client-id',
                redirectUri: window.location.origin + '/oauth/apple',
                scope: 'openid email name'
            }
        };
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 6;
    }

    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    login(email, password) {
        try {
            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Demo authentication
            if (email === 'demo@lms.com' && password === 'demo123') {
                const user = {
                    id: 'demo_user',
                    name: 'Demo User',
                    email: 'demo@lms.com',
                    joinDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    hasAdmission: true,
                    isDemo: true
                };
                
                this.storage.saveUser(user);
                return { success: true, user };
            }
            
            // Check for existing users
            const users = this.storage.getItem('users') || [];
            const hashedPassword = this.hashPassword(password);
            const user = users.find(u => u.email === email && u.hashedPassword === hashedPassword);
            
            if (user) {
                // Check session validity
                const lastLogin = new Date(user.lastLogin || 0);
                const now = new Date();
                
                if (now - lastLogin > this.sessionTimeout) {
                    // Session expired, but allow login
                }

                // Update last login
                user.lastLogin = now.toISOString();
                
                // Update user in storage
                const userIndex = users.findIndex(u => u.id === user.id);
                users[userIndex] = user;
                this.storage.setItem('users', users);
                
                // Remove sensitive data from session
                const { hashedPassword: _, ...userWithoutPassword } = user;
                this.storage.saveUser(userWithoutPassword);
                
                return { success: true, user: userWithoutPassword };
            }
            
            throw new Error('Invalid email or password');
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    register(name, email, password) {
        try {
            // Input validation
            if (!name || !email || !password) {
                throw new Error('All fields are required');
            }

            if (name.length < 2) {
                throw new Error('Name must be at least 2 characters long');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            // Check if user already exists
            const users = this.storage.getItem('users') || [];
            if (users.find(u => u.email === email)) {
                throw new Error('An account with this email already exists');
            }
            
            // Create new user
            const user = {
                id: this.generateId(),
                name: name.trim(),
                email: email.toLowerCase().trim(),
                hashedPassword: this.hashPassword(password),
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                hasAdmission: false,
                profile: {
                    avatar: null,
                    bio: '',
                    phone: '',
                    education: '',
                    goals: ''
                }
            };
            
            // Save to users list
            users.push(user);
            this.storage.setItem('users', users);
            
            // Save as current user (without password)
            const { hashedPassword: _, ...userWithoutPassword } = user;
            this.storage.saveUser(userWithoutPassword);
            
            return { success: true, user: userWithoutPassword };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        try {
            this.storage.removeUser();
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to logout' };
        }
    }

    getCurrentUser() {
        try {
            const user = this.storage.getUser();
            if (user && user.lastLogin) {
                const lastLogin = new Date(user.lastLogin);
                const now = new Date();
                
                // Check if session is still valid
                if (now - lastLogin > this.sessionTimeout) {
                    this.logout();
                    return null;
                }
            }
            return user;
        } catch (error) {
            return null;
        }
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    updateUserProfile(profileData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const users = this.storage.getItem('users') || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user profile
            users[userIndex] = {
                ...users[userIndex],
                ...profileData,
                profile: {
                    ...users[userIndex].profile,
                    ...profileData.profile
                }
            };

            // Save updated users list
            this.storage.setItem('users', users);

            // Update current user session
            const { hashedPassword: _, ...userWithoutPassword } = users[userIndex];
            this.storage.saveUser(userWithoutPassword);

            return { success: true, user: userWithoutPassword };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // OAuth Login Methods
    loginWithGoogle() {
        const config = this.oauthProviders.google;
        const authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scope)}&` +
            `response_type=code&` +
            `state=${this.generateState()}`;
        
        this.openOAuthWindow(authUrl, 'google');
    }

    loginWithMicrosoft() {
        const config = this.oauthProviders.microsoft;
        const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scope)}&` +
            `response_type=code&` +
            `state=${this.generateState()}`;
        
        this.openOAuthWindow(authUrl, 'microsoft');
    }

    loginWithApple() {
        const config = this.oauthProviders.apple;
        const authUrl = `https://appleid.apple.com/auth/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scope)}&` +
            `response_type=code&` +
            `response_mode=form_post&` +
            `state=${this.generateState()}`;
        
        this.openOAuthWindow(authUrl, 'apple');
    }

    openOAuthWindow(url, provider) {
        const width = 500;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);

        const popup = window.open(
            url,
            `${provider}_oauth`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Listen for the OAuth callback
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                // Check for OAuth result in storage
                this.handleOAuthCallback(provider);
            }
        }, 1000);

        // Listen for messages from popup
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'oauth_success') {
                clearInterval(checkClosed);
                popup.close();
                this.processOAuthUser(event.data.user, provider);
            } else if (event.data.type === 'oauth_error') {
                clearInterval(checkClosed);
                popup.close();
                console.error('OAuth error:', event.data.error);
            }
        });
    }

    generateState() {
        const state = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('oauth_state', state);
        return state;
    }

    handleOAuthCallback(provider) {
        // This would be called after OAuth redirect
        // In a real implementation, you'd handle the authorization code here
        // For demo purposes, we'll simulate successful OAuth
        const mockUser = {
            google: {
                id: 'google_demo_user',
                name: 'Google User',
                email: 'user@gmail.com',
                picture: 'https://via.placeholder.com/100'
            },
            microsoft: {
                id: 'microsoft_demo_user',
                name: 'Microsoft User',
                email: 'user@outlook.com',
                picture: 'https://via.placeholder.com/100'
            },
            apple: {
                id: 'apple_demo_user',
                name: 'Apple User',
                email: 'user@icloud.com',
                picture: 'https://via.placeholder.com/100'
            }
        };

        this.processOAuthUser(mockUser[provider], provider);
    }

    processOAuthUser(oauthUser, provider) {
        try {
            // Check if user already exists
            const users = this.storage.getItem('users') || [];
            let existingUser = users.find(u => u.email === oauthUser.email);

            if (existingUser) {
                // Update existing user
                existingUser.lastLogin = new Date().toISOString();
                existingUser.oauthProvider = provider;
                
                const userIndex = users.findIndex(u => u.id === existingUser.id);
                users[userIndex] = existingUser;
                this.storage.setItem('users', users);
                this.storage.saveUser(existingUser);
            } else {
                // Create new user from OAuth data
                const newUser = {
                    id: this.generateId(),
                    name: oauthUser.name,
                    email: oauthUser.email,
                    joinDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    hasAdmission: true,
                    oauthProvider: provider,
                    oauthId: oauthUser.id,
                    profile: {
                        avatar: oauthUser.picture || null,
                        bio: '',
                        phone: '',
                        education: '',
                        goals: ''
                    }
                };

                users.push(newUser);
                this.storage.setItem('users', users);
                this.storage.saveUser(newUser);
            }

            // Trigger app refresh to show logged in state
            if (window.app) {
                window.app.checkAuthAndRender();
            }

            return { success: true, user: existingUser || newUser };
        } catch (error) {
            console.error('OAuth processing error:', error);
            return { success: false, error: error.message };
        }
    }
}


class Auth {
    constructor() {
        this.storage = new Storage();
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
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
}

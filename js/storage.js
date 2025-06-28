// Local storage management for the LMS application
class Storage {
    constructor() {
        this.prefix = 'lms_';
        this.version = '1.0.0';
        this.init();
    }
    
    /**
     * Initialize storage and handle version migrations
     */
    init() {
        try {
            // Check if localStorage is available
            this.isSupported = this.checkSupport();
            
            if (!this.isSupported) {
                console.warn('localStorage not supported, using memory storage');
                this.memoryStorage = {};
                return;
            }
            
            // Check version and migrate if needed
            this.checkVersion();
            
            console.log('Storage initialized');
        } catch (error) {
            console.error('Error initializing storage:', error);
            this.isSupported = false;
            this.memoryStorage = {};
        }
    }
    
    /**
     * Check if localStorage is supported
     * @returns {boolean} - Whether localStorage is supported
     */
    checkSupport() {
        try {
            const testKey = '__lms_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Check version and handle migrations
     */
    checkVersion() {
        const storedVersion = this.getItem('version');
        
        if (!storedVersion) {
            // First time setup
            this.setItem('version', this.version);
            this.setItem('created_at', new Date().toISOString());
        } else if (storedVersion !== this.version) {
            // Handle version migration
            this.migrateData(storedVersion, this.version);
            this.setItem('version', this.version);
        }
    }
    
    /**
     * Migrate data between versions
     * @param {string} fromVersion - The old version
     * @param {string} toVersion - The new version
     */
    migrateData(fromVersion, toVersion) {
        console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
        
        // Add specific migration logic here as needed
        try {
            // Example migration logic
            if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
                // Migrate user data structure
                const user = this.getUser();
                if (user && !user.preferences) {
                    user.preferences = {
                        theme: 'light',
                        notifications: true
                    };
                    this.saveUser(user);
                }
            }
            
            console.log('Data migration completed successfully');
        } catch (error) {
            console.error('Error during data migration:', error);
        }
    }
    
    /**
     * Get an item from storage
     * @param {string} key - The key to retrieve
     * @returns {any} - The stored value or null
     */
    getItem(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isSupported) {
                const value = localStorage.getItem(fullKey);
                return value ? JSON.parse(value) : null;
            } else {
                return this.memoryStorage[fullKey] || null;
            }
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }
    
    /**
     * Set an item in storage
     * @param {string} key - The key to store
     * @param {any} value - The value to store
     * @returns {boolean} - Whether the operation was successful
     */
    setItem(key, value) {
        const fullKey = this.prefix + key;
        
        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.isSupported) {
                localStorage.setItem(fullKey, serializedValue);
            } else {
                this.memoryStorage[fullKey] = serializedValue;
            }
            
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                this.handleQuotaExceeded();
            }
            
            return false;
        }
    }
    
    /**
     * Remove an item from storage
     * @param {string} key - The key to remove
     */
    removeItem(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isSupported) {
                localStorage.removeItem(fullKey);
            } else {
                delete this.memoryStorage[fullKey];
            }
        } catch (error) {
            console.error('Error removing item from storage:', error);
        }
    }
    
    /**
     * Clear all LMS data from storage
     */
    clear() {
        try {
            if (this.isSupported) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                this.memoryStorage = {};
            }
            
            console.log('Storage cleared');
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
    
    /**
     * Get storage usage information
     * @returns {object} - Storage usage info
     */
    getStorageInfo() {
        try {
            if (!this.isSupported) {
                return {
                    used: JSON.stringify(this.memoryStorage).length,
                    available: Infinity,
                    type: 'memory'
                };
            }
            
            let used = 0;
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    used += localStorage.getItem(key).length;
                }
            });
            
            // Estimate available space (localStorage typically has 5-10MB limit)
            const estimated = 5 * 1024 * 1024; // 5MB estimate
            
            return {
                used: used,
                available: estimated - used,
                total: estimated,
                type: 'localStorage'
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
    
    /**
     * Handle storage quota exceeded
     */
    handleQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup');
        
        try {
            // Remove old cached data or temporary items
            this.cleanupOldData();
            
            // Notify user about storage issues
            if (window.lmsApp) {
                // Could show a notification to the user
                console.warn('Storage space is running low. Some features may be limited.');
            }
        } catch (error) {
            console.error('Error during storage cleanup:', error);
        }
    }
    
    /**
     * Clean up old or unnecessary data
     */
    cleanupOldData() {
        const now = new Date().getTime();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        // Remove old temporary data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix + 'temp_')) {
                const item = this.getItem(key.replace(this.prefix, ''));
                if (item && item.timestamp && (now - item.timestamp) > maxAge) {
                    this.removeItem(key.replace(this.prefix, ''));
                }
            }
        });
    }
    
    // User-specific methods
    /**
     * Get user data
     * @returns {object|null} - User data
     */
    getUser() {
        return this.getItem('user');
    }
    
    /**
     * Save user data
     * @param {object} userData - User data to save
     */
    saveUser(userData) {
        userData.updatedAt = new Date().toISOString();
        return this.setItem('user', userData);
    }
    
    /**
     * Get user progress for a specific course
     * @param {string} courseId - Course ID
     * @returns {object|null} - Progress data
     */
    getCourseProgress(courseId) {
        const user = this.getUser();
        return user?.progress?.[courseId] || null;
    }
    
    /**
     * Save user progress for a specific course
     * @param {string} courseId - Course ID
     * @param {object} progressData - Progress data
     */
    saveCourseProgress(courseId, progressData) {
        const user = this.getUser();
        if (user) {
            user.progress = user.progress || {};
            user.progress[courseId] = {
                ...progressData,
                lastUpdated: new Date().toISOString()
            };
            this.saveUser(user);
        }
    }
    
    /**
     * Get user certificates
     * @returns {Array} - Array of certificates
     */
    getCertificates() {
        const user = this.getUser();
        return user?.certificates || [];
    }
    
    /**
     * Add a certificate for the user
     * @param {object} certificate - Certificate data
     */
    addCertificate(certificate) {
        const user = this.getUser();
        if (user) {
            user.certificates = user.certificates || [];
            user.certificates.push({
                ...certificate,
                issuedAt: new Date().toISOString()
            });
            this.saveUser(user);
        }
    }
    
    // Settings and preferences
    /**
     * Get user preferences
     * @returns {object} - User preferences
     */
    getPreferences() {
        const user = this.getUser();
        return user?.preferences || {
            theme: 'light',
            notifications: true,
            autoplay: false,
            language: 'en'
        };
    }
    
    /**
     * Update user preferences
     * @param {object} preferences - Preferences to update
     */
    updatePreferences(preferences) {
        const user = this.getUser();
        if (user) {
            user.preferences = {
                ...user.preferences,
                ...preferences
            };
            this.saveUser(user);
        }
    }
    
    // Cache management for offline functionality
    /**
     * Cache course data for offline access
     * @param {string} courseId - Course ID
     * @param {object} courseData - Course data to cache
     */
    cacheCourseData(courseId, courseData) {
        return this.setItem(`cache_course_${courseId}`, {
            data: courseData,
            cachedAt: new Date().toISOString()
        });
    }
    
    /**
     * Get cached course data
     * @param {string} courseId - Course ID
     * @returns {object|null} - Cached course data
     */
    getCachedCourseData(courseId) {
        const cached = this.getItem(`cache_course_${courseId}`);
        if (cached) {
            // Check if cache is still valid (e.g., less than 7 days old)
            const cacheAge = new Date().getTime() - new Date(cached.cachedAt).getTime();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            if (cacheAge < maxAge) {
                return cached.data;
            } else {
                // Remove expired cache
                this.removeItem(`cache_course_${courseId}`);
            }
        }
        return null;
    }
    
    /**
     * Export user data for backup
     * @returns {object} - Exported user data
     */
    exportUserData() {
        const user = this.getUser();
        const preferences = this.getPreferences();
        const storageInfo = this.getStorageInfo();
        
        return {
            user: user,
            preferences: preferences,
            version: this.version,
            exportedAt: new Date().toISOString(),
            storageInfo: storageInfo
        };
    }
    
    /**
     * Import user data from backup
     * @param {object} data - Data to import
     * @returns {boolean} - Whether import was successful
     */
    importUserData(data) {
        try {
            if (data.user) {
                this.saveUser(data.user);
            }
            
            if (data.preferences) {
                this.updatePreferences(data.preferences);
            }
            
            console.log('User data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing user data:', error);
            return false;
        }
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}

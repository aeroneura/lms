class Storage {
    constructor() {
        this.storageKey = 'lms_data';
        this.userKey = 'lms_user';
        this.coursesKey = 'lms_courses';
        this.isSupported = this.checkSupport();
        this.memoryStorage = {};
    }

    checkSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not supported, using memory storage');
            return false;
        }
    }

    setItem(key, value) {
        try {
            const data = JSON.stringify(value);
            if (this.isSupported) {
                localStorage.setItem(key, data);
            } else {
                this.memoryStorage[key] = data;
            }
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    getItem(key) {
        try {
            const data = this.isSupported ? 
                localStorage.getItem(key) : 
                this.memoryStorage[key];
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    }

    removeItem(key) {
        if (this.isSupported) {
            localStorage.removeItem(key);
        } else {
            delete this.memoryStorage[key];
        }
    }

    clear() {
        if (this.isSupported) {
            localStorage.clear();
        } else {
            this.memoryStorage = {};
        }
    }

    // User management
    saveUser(user) {
        this.setItem(this.userKey, user);
    }

    getUser() {
        return this.getItem(this.userKey);
    }

    removeUser() {
        this.removeItem(this.userKey);
    }

    // Course progress management
    saveCourseProgress(courseId, progress) {
        const allProgress = this.getItem('course_progress') || {};
        allProgress[courseId] = progress;
        this.setItem('course_progress', allProgress);
    }

    getCourseProgress(courseId) {
        const allProgress = this.getItem('course_progress') || {};
        return allProgress[courseId] || null;
    }

    // Enrollment management
    saveEnrollment(courseId) {
        const enrollments = this.getEnrollments();
        if (!enrollments.includes(courseId)) {
            enrollments.push(courseId);
            this.setItem('enrollments', enrollments);
        }
    }

    getEnrollments() {
        return this.getItem('enrollments') || [];
    }

    // Certificates management
    saveCertificate(certificate) {
        const certificates = this.getCertificates();
        certificates.push(certificate);
        this.setItem('certificates', certificates);
    }

    getCertificates() {
        return this.getItem('certificates') || [];
    }

    // Quiz results
    saveQuizResult(courseId, result) {
        const results = this.getItem('quiz_results') || {};
        results[courseId] = result;
        this.setItem('quiz_results', results);
    }

    getQuizResult(courseId) {
        const results = this.getItem('quiz_results') || {};
        return results[courseId] || null;
    }

    getTheme() {
        return this.getItem('theme') || 'light';
    }

    saveTheme(theme) {
        this.setItem('theme', theme);
    }

    getSettings() {
        return this.getItem('userSettings') || {};
    }

    saveSettings(settings) {
        this.setItem('userSettings', settings);
    }
}
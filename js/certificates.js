
class Certificates {
    constructor() {
        this.storage = new Storage();
    }

    showCertificates() {
        const certificates = this.getUserCertificates();
        
        const html = `
            <div class="container">
                <div class="certificates-page">
                    <div class="page-header">
                        <h1>My Certificates</h1>
                        <p>Your learning achievements and certifications</p>
                    </div>
                    
                    ${certificates.length > 0 ? `
                        <div class="certificates-grid grid grid-2">
                            ${certificates.map(cert => this.renderCertificate(cert)).join('')}
                        </div>
                    ` : `
                        <div class="no-certificates card text-center">
                            <h2>No Certificates Yet</h2>
                            <p>Complete courses and pass quizzes to earn certificates.</p>
                            <button class="btn btn-primary" onclick="app.router.navigate('courses')">
                                Browse Courses
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        window.app.renderContent(html);
    }

    renderCertificate(certificate) {
        return `
            <div class="certificate-card card">
                <div class="certificate-content">
                    <div class="certificate-header">
                        <div class="certificate-icon">🏆</div>
                        <h3>Certificate of Completion</h3>
                    </div>
                    
                    <div class="certificate-body">
                        <h4>${certificate.courseTitle}</h4>
                        <p>Awarded to <strong>${certificate.studentName}</strong></p>
                        <p>Score: <strong>${certificate.score}%</strong></p>
                        <p>Date: ${new Date(certificate.earnedAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="certificate-actions">
                        <button class="btn btn-primary" onclick="app.certificates.viewCertificate('${certificate.id}')">
                            View Certificate
                        </button>
                        <button class="btn btn-outline" onclick="app.certificates.downloadCertificate('${certificate.id}')">
                            Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateCertificate(courseId, score) {
        const course = COURSES_DATA.find(c => c.id === courseId);
        const user = window.app.currentUser;
        
        if (!course || !user) return;
        
        const certificate = {
            id: this.generateId(),
            courseId,
            courseTitle: course.title,
            studentName: user.name,
            instructor: course.instructor,
            score,
            earnedAt: new Date().toISOString(),
            certificateNumber: this.generateCertificateNumber()
        };
        
        this.storage.saveCertificate(certificate);
        return certificate;
    }

    viewCertificate(certificateId) {
        const certificates = this.getUserCertificates();
        const certificate = certificates.find(c => c.id === certificateId);
        
        if (!certificate) {
            window.app.showError('Certificate not found');
            return;
        }
        
        const html = `
            <div class="container">
                <div class="certificate-viewer">
                    <div class="certificate-display">
                        <div class="certificate-paper">
                            <div class="certificate-border">
                                <div class="certificate-content-full">
                                    <div class="certificate-logo">🎓</div>
                                    
                                    <h1>Certificate of Completion</h1>
                                    
                                    <div class="certificate-text">
                                        <p>This is to certify that</p>
                                        <h2 class="student-name">${certificate.studentName}</h2>
                                        <p>has successfully completed the course</p>
                                        <h3 class="course-title">${certificate.courseTitle}</h3>
                                        <p>with a score of <strong>${certificate.score}%</strong></p>
                                    </div>
                                    
                                    <div class="certificate-footer">
                                        <div class="signature-section">
                                            <div class="signature">
                                                <div class="signature-line"></div>
                                                <p>${certificate.instructor}</p>
                                                <small>Instructor</small>
                                            </div>
                                            
                                            <div class="certificate-seal">
                                                <div class="seal">LMS</div>
                                            </div>
                                        </div>
                                        
                                        <div class="certificate-info">
                                            <p>Certificate #${certificate.certificateNumber}</p>
                                            <p>Issued on ${new Date(certificate.earnedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="certificate-actions text-center">
                        <button class="btn btn-outline" onclick="history.back()">← Back</button>
                        <button class="btn btn-primary" onclick="app.certificates.downloadCertificate('${certificateId}')">
                            Download Certificate
                        </button>
                        <button class="btn btn-secondary" onclick="app.certificates.shareCertificate('${certificateId}')">
                            Share Certificate
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        window.app.renderContent(html);
    }

    downloadCertificate(certificateId) {
        // Simple implementation - in a real app, this would generate a PDF
        window.app.showNotification('Certificate download feature coming soon!', 'info');
    }

    shareCertificate(certificateId) {
        const certificate = this.getUserCertificates().find(c => c.id === certificateId);
        
        if (navigator.share) {
            navigator.share({
                title: 'My Certificate',
                text: `I just completed ${certificate.courseTitle} and earned a certificate!`,
                url: window.location.href
            });
        } else {
            // Fallback for browsers without Web Share API
            const text = `I just completed ${certificate.courseTitle} and earned a certificate!`;
            navigator.clipboard.writeText(text).then(() => {
                window.app.showNotification('Certificate text copied to clipboard!', 'success');
            });
        }
    }

    getUserCertificates() {
        return this.storage.getCertificates();
    }

    generateId() {
        return 'cert_' + Math.random().toString(36).substr(2, 9);
    }

    generateCertificateNumber() {
        return 'LMS-' + Date.now().toString().slice(-8);
    }
}

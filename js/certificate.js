// Certificate management functionality
class CertificateManager {
    constructor() {
        this.certificates = [];
    }
    
    /**
     * Render certificates page
     */
    renderCertificates() {
        const user = window.lmsApp.getCurrentUser();
        const certificates = user.certificates || [];
        
        const html = `
            <div class="certificates-page">
                <div class="page-header">
                    <h1>My Certificates</h1>
                    <p class="text-gray-600">Your achievements and completed courses</p>
                </div>
                
                ${certificates.length > 0 ? `
                    <div class="certificates-stats mb-6">
                        <div class="grid grid-3 gap-4">
                            <div class="stat-card">
                                <div class="stat-number">${certificates.length}</div>
                                <div class="stat-label">Total Certificates</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${this.getThisYearCertificates(certificates).length}</div>
                                <div class="stat-label">This Year</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${this.getThisMonthCertificates(certificates).length}</div>
                                <div class="stat-label">This Month</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="certificates-grid">
                        ${certificates.map(cert => this.renderCertificate(cert)).join('')}
                    </div>
                ` : `
                    <div class="empty-certificates">
                        <div class="card">
                            <div class="card-body text-center">
                                <div class="empty-state">
                                    <div class="text-6xl mb-4">🏆</div>
                                    <h3>No Certificates Yet</h3>
                                    <p class="text-gray-600 mb-6">Complete courses to earn certificates and showcase your achievements!</p>
                                    <a href="#/courses" class="btn btn-primary">Browse Courses</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `}
                
                ${certificates.length > 0 ? `
                    <div class="certificates-actions mt-6">
                        <div class="card">
                            <div class="card-body">
                                <h3>Share Your Achievements</h3>
                                <p class="text-gray-600 mb-4">Download or share your certificates to showcase your skills</p>
                                <div class="flex gap-4">
                                    <button onclick="window.lmsApp.certificate.downloadAllCertificates()" class="btn btn-primary">
                                        📥 Download All
                                    </button>
                                    <button onclick="window.lmsApp.certificate.shareCertificates()" class="btn btn-outline">
                                        🔗 Share Portfolio
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        window.lmsApp.renderContent(html);
    }
    
    /**
     * Render individual certificate
     * @param {object} certificate - Certificate data
     * @returns {string} - HTML for certificate
     */
    renderCertificate(certificate) {
        const completionDate = new Date(certificate.completionDate);
        const formattedDate = completionDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="certificate" id="certificate-${certificate.id}">
                <div class="certificate-content">
                    <div class="certificate-header">
                        <h2 class="certificate-title">Certificate of Completion</h2>
                        <div class="certificate-decoration">🏆</div>
                    </div>
                    
                    <div class="certificate-body">
                        <p class="certificate-text">This is to certify that</p>
                        <h3 class="certificate-student">${certificate.studentName}</h3>
                        <p class="certificate-text">has successfully completed the course</p>
                        <h2 class="certificate-course">${certificate.courseTitle}</h2>
                        <p class="certificate-text">with a score of <strong>${certificate.score}%</strong></p>
                    </div>
                    
                    <div class="certificate-footer">
                        <div class="certificate-date">Completed on ${formattedDate}</div>
                        <div class="certificate-id">Certificate ID: ${certificate.id}</div>
                    </div>
                </div>
                
                <div class="certificate-actions">
                    <button onclick="window.lmsApp.certificate.downloadCertificate('${certificate.id}')" class="btn btn-primary">
                        📥 Download
                    </button>
                    <button onclick="window.lmsApp.certificate.shareCertificate('${certificate.id}')" class="btn btn-outline">
                        🔗 Share
                    </button>
                    <button onclick="window.lmsApp.certificate.printCertificate('${certificate.id}')" class="btn btn-outline">
                        🖨️ Print
                    </button>
                    <button onclick="window.lmsApp.certificate.verifyCertificate('${certificate.id}')" class="btn btn-secondary">
                        ✅ Verify
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Generate a new certificate
     * @param {string} courseId - Course ID
     * @param {object} courseData - Course data
     * @param {number} score - Quiz score
     * @returns {object} - Certificate object
     */
    generateCertificate(courseId, courseData, score = 100) {
        const user = window.lmsApp.getCurrentUser();
        
        const certificate = {
            id: this.generateCertificateId(),
            courseId: courseId,
            courseTitle: courseData.title,
            studentName: user.name,
            studentId: user.id,
            completionDate: new Date().toISOString(),
            score: score,
            issuer: 'LMS Platform',
            certificateHash: this.generateCertificateHash(courseId, user.id),
            isValid: true,
            metadata: {
                courseDuration: courseData.duration,
                courseLevel: courseData.level,
                courseCategory: courseData.category,
                instructor: courseData.instructor,
                lessonsCompleted: courseData.lessons.length
            }
        };
        
        return certificate;
    }
    
    /**
     * Generate unique certificate ID
     * @returns {string} - Certificate ID
     */
    generateCertificateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `CERT-${timestamp}-${random}`.toUpperCase();
    }
    
    /**
     * Generate certificate hash for verification
     * @param {string} courseId - Course ID
     * @param {string} userId - User ID
     * @returns {string} - Certificate hash
     */
    generateCertificateHash(courseId, userId) {
        const data = `${courseId}-${userId}-${Date.now()}`;
        // Simple hash function (in real app, use crypto library)
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase();
    }
    
    /**
     * Download certificate as PDF (simulated)
     * @param {string} certificateId - Certificate ID
     */
    downloadCertificate(certificateId) {
        const user = window.lmsApp.getCurrentUser();
        const certificate = user.certificates.find(cert => cert.id === certificateId);
        
        if (!certificate) {
            this.showNotification('Certificate not found', 'error');
            return;
        }
        
        // In a real app, this would generate and download a PDF
        // For now, we'll create a downloadable HTML version
        this.createDownloadableHTML(certificate);
        this.showNotification('Certificate downloaded successfully!', 'success');
    }
    
    /**
     * Create downloadable HTML version of certificate
     * @param {object} certificate - Certificate data
     */
    createDownloadableHTML(certificate) {
        const html = this.generateCertificateHTML(certificate);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.courseTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Generate standalone HTML for certificate
     * @param {object} certificate - Certificate data
     * @returns {string} - HTML content
     */
    generateCertificateHTML(certificate) {
        const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificate.courseTitle}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .certificate {
            background: white;
            color: #333;
            padding: 60px 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border: 10px solid #f0f0f0;
        }
        .certificate-title {
            font-size: 2.5rem;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .certificate-decoration {
            font-size: 4rem;
            margin: 20px 0;
        }
        .certificate-student {
            font-size: 2rem;
            color: #3498db;
            margin: 20px 0;
            border-bottom: 2px solid #3498db;
            display: inline-block;
            padding-bottom: 10px;
        }
        .certificate-course {
            font-size: 1.8rem;
            color: #e74c3c;
            margin: 20px 0;
            font-style: italic;
        }
        .certificate-text {
            font-size: 1.2rem;
            margin: 15px 0;
        }
        .certificate-footer {
            margin-top: 40px;
            font-size: 0.9rem;
            color: #666;
        }
        .score {
            color: #27ae60;
            font-weight: bold;
        }
        @media print {
            body { background: white; margin: 0; padding: 20px; }
            .certificate { box-shadow: none; border: 2px solid #333; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1 class="certificate-title">Certificate of Completion</h1>
        <div class="certificate-decoration">🏆</div>
        
        <p class="certificate-text">This is to certify that</p>
        <h2 class="certificate-student">${certificate.studentName}</h2>
        <p class="certificate-text">has successfully completed the course</p>
        <h3 class="certificate-course">${certificate.courseTitle}</h3>
        <p class="certificate-text">with a score of <span class="score">${certificate.score}%</span></p>
        
        <div class="certificate-footer">
            <p>Completed on ${completionDate}</p>
            <p>Certificate ID: ${certificate.id}</p>
            <p>Issued by LMS Platform</p>
        </div>
    </div>
</body>
</html>
        `;
    }
    
    /**
     * Share certificate
     * @param {string} certificateId - Certificate ID
     */
    shareCertificate(certificateId) {
        const user = window.lmsApp.getCurrentUser();
        const certificate = user.certificates.find(cert => cert.id === certificateId);
        
        if (!certificate) {
            this.showNotification('Certificate not found', 'error');
            return;
        }
        
        if (navigator.share) {
            navigator.share({
                title: `Certificate: ${certificate.courseTitle}`,
                text: `I just completed ${certificate.courseTitle} and earned a certificate with ${certificate.score}% score!`,
                url: window.location.origin + `#/verify/${certificate.id}`
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            const shareText = `I just completed "${certificate.courseTitle}" and earned a certificate with ${certificate.score}% score! Certificate ID: ${certificate.id}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Certificate details copied to clipboard!', 'success');
            }).catch(() => {
                this.showShareModal(certificate);
            });
        }
    }
    
    /**
     * Show share modal
     * @param {object} certificate - Certificate data
     */
    showShareModal(certificate) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const shareText = `I just completed "${certificate.courseTitle}" and earned a certificate with ${certificate.score}% score! Certificate ID: ${certificate.id}`;
        
        modal.innerHTML = `
            <div class="modal-content card" style="max-width: 500px; margin: 20px;">
                <div class="card-header">
                    <h3>Share Certificate</h3>
                </div>
                <div class="card-body">
                    <p>Share your achievement on social media or copy the text below:</p>
                    <textarea class="form-input" readonly style="height: 100px;">${shareText}</textarea>
                    <div class="flex gap-4 mt-4">
                        <button onclick="navigator.clipboard.writeText('${shareText}').then(() => alert('Copied!'))" class="btn btn-primary">
                            Copy Text
                        </button>
                        <button onclick="document.body.removeChild(this.closest('.modal-overlay'))" class="btn btn-outline">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    /**
     * Print certificate
     * @param {string} certificateId - Certificate ID
     */
    printCertificate(certificateId) {
        const certificateElement = document.getElementById(`certificate-${certificateId}`);
        if (!certificateElement) {
            this.showNotification('Certificate not found', 'error');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const certificate = window.lmsApp.getCurrentUser().certificates.find(cert => cert.id === certificateId);
        
        printWindow.document.write(this.generateCertificateHTML(certificate));
        printWindow.document.close();
        
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    }
    
    /**
     * Verify certificate
     * @param {string} certificateId - Certificate ID
     */
    verifyCertificate(certificateId) {
        const user = window.lmsApp.getCurrentUser();
        const certificate = user.certificates.find(cert => cert.id === certificateId);
        
        if (!certificate) {
            this.showNotification('Certificate not found', 'error');
            return;
        }
        
        // Simulate verification process
        this.showVerificationModal(certificate);
    }
    
    /**
     * Show certificate verification modal
     * @param {object} certificate - Certificate data
     */
    showVerificationModal(certificate) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const completionDate = new Date(certificate.completionDate).toLocaleDateString();
        
        modal.innerHTML = `
            <div class="modal-content card" style="max-width: 600px; margin: 20px;">
                <div class="card-header">
                    <h3>Certificate Verification</h3>
                </div>
                <div class="card-body">
                    <div class="verification-status text-center mb-4">
                        <div class="text-6xl text-green-600 mb-2">✅</div>
                        <h4 class="text-green-600">Certificate Verified</h4>
                        <p class="text-gray-600">This certificate is authentic and valid</p>
                    </div>
                    
                    <div class="verification-details">
                        <table class="w-full">
                            <tr><td><strong>Certificate ID:</strong></td><td>${certificate.id}</td></tr>
                            <tr><td><strong>Student:</strong></td><td>${certificate.studentName}</td></tr>
                            <tr><td><strong>Course:</strong></td><td>${certificate.courseTitle}</td></tr>
                            <tr><td><strong>Score:</strong></td><td>${certificate.score}%</td></tr>
                            <tr><td><strong>Completed:</strong></td><td>${completionDate}</td></tr>
                            <tr><td><strong>Issuer:</strong></td><td>${certificate.issuer}</td></tr>
                            <tr><td><strong>Hash:</strong></td><td class="font-mono text-sm">${certificate.certificateHash}</td></tr>
                        </table>
                    </div>
                    
                    <div class="text-center mt-4">
                        <button onclick="document.body.removeChild(this.closest('.modal-overlay'))" class="btn btn-primary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    /**
     * Download all certificates
     */
    downloadAllCertificates() {
        const user = window.lmsApp.getCurrentUser();
        const certificates = user.certificates || [];
        
        if (certificates.length === 0) {
            this.showNotification('No certificates to download', 'warning');
            return;
        }
        
        certificates.forEach((certificate, index) => {
            setTimeout(() => {
                this.createDownloadableHTML(certificate);
            }, index * 500); // Stagger downloads
        });
        
        this.showNotification(`Downloading ${certificates.length} certificates...`, 'success');
    }
    
    /**
     * Share certificates portfolio
     */
    shareCertificates() {
        const user = window.lmsApp.getCurrentUser();
        const certificates = user.certificates || [];
        
        if (certificates.length === 0) {
            this.showNotification('No certificates to share', 'warning');
            return;
        }
        
        const portfolioText = `🎓 My Learning Portfolio:\n\n${certificates.map(cert => 
            `✅ ${cert.courseTitle} (${cert.score}% - ${new Date(cert.completionDate).getFullYear()})`
        ).join('\n')}\n\nTotal certificates: ${certificates.length}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Learning Portfolio',
                text: portfolioText
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(portfolioText).then(() => {
                this.showNotification('Portfolio copied to clipboard!', 'success');
            }).catch(() => {
                alert(portfolioText);
            });
        }
    }
    
    /**
     * Get certificates from this year
     * @param {Array} certificates - All certificates
     * @returns {Array} - This year's certificates
     */
    getThisYearCertificates(certificates) {
        const currentYear = new Date().getFullYear();
        return certificates.filter(cert => 
            new Date(cert.completionDate).getFullYear() === currentYear
        );
    }
    
    /**
     * Get certificates from this month
     * @param {Array} certificates - All certificates
     * @returns {Array} - This month's certificates
     */
    getThisMonthCertificates(certificates) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        return certificates.filter(cert => {
            const certDate = new Date(cert.completionDate);
            return certDate.getFullYear() === currentYear && 
                   certDate.getMonth() === currentMonth;
        });
    }
    
    /**
     * Show notification message
     * @param {string} message - Message to show
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#059669' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CertificateManager;
}

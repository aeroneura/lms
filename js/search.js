// Search functionality for the LMS application
class SearchManager {
    constructor() {
        this.searchResults = [];
        this.currentQuery = '';
    }
    
    search(query) {
        this.currentQuery = query.toLowerCase();
        
        if (!query.trim()) {
            this.searchResults = [];
            return this.searchResults;
        }
        
        this.searchResults = COURSES_DATA.filter(course => {
            return course.title.toLowerCase().includes(this.currentQuery) ||
                   course.description.toLowerCase().includes(this.currentQuery) ||
                   course.category.toLowerCase().includes(this.currentQuery) ||
                   course.instructor.toLowerCase().includes(this.currentQuery);
        });
        
        return this.searchResults;
    }
    
    renderSearch() {
        const html = `
            <div class="search-page">
                <div class="page-header">
                    <h1>Search Courses</h1>
                    <p class="text-gray-600">Find the perfect course for you</p>
                </div>
                
                <div class="search-form">
                    <div class="form-group">
                        <input type="text" 
                               id="search-input" 
                               placeholder="Search courses, topics, or instructors..." 
                               class="form-input"
                               value="${this.currentQuery}">
                        <button onclick="window.lmsApp.search.performSearch()" class="btn btn-primary">Search</button>
                    </div>
                </div>
                
                <div id="search-results" class="search-results">
                    ${this.renderResults()}
                </div>
            </div>
        `;
        
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
            
            // Add event listener for enter key
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.performSearch();
                    }
                });
            }
        }
    }
    
    performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value : '';
        
        this.search(query);
        
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.renderResults();
        }
    }
    
    renderResults() {
        if (!this.currentQuery) {
            return `
                <div class="text-center py-8">
                    <p class="text-gray-600">Enter a search term to find courses</p>
                </div>
            `;
        }
        
        if (this.searchResults.length === 0) {
            return `
                <div class="text-center py-8">
                    <p class="text-gray-600">No courses found for "${this.currentQuery}"</p>
                </div>
            `;
        }
        
        return `
            <div class="search-results-header">
                <p>Found ${this.searchResults.length} course${this.searchResults.length !== 1 ? 's' : ''} for "${this.currentQuery}"</p>
            </div>
            <div class="course-grid">
                ${this.searchResults.map(course => `
                    <div class="course-card">
                        <div class="course-image">
                            <img src="${course.image}" alt="${course.title}" loading="lazy">
                        </div>
                        <div class="course-content">
                            <h3>${course.title}</h3>
                            <p class="course-description">${course.description}</p>
                            <div class="course-meta">
                                <span class="course-instructor">By ${course.instructor}</span>
                                <span class="course-duration">${course.duration}</span>
                                <span class="course-level">${course.level}</span>
                            </div>
                            <div class="course-actions">
                                <a href="/course/${course.id}" class="btn btn-primary">View Course</a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
class SearchManager {
    constructor() {
        this.searchResults = [];
        this.searchQuery = '';
        this.searchFilters = {
            category: '',
            level: '',
            duration: '',
            instructor: ''
        };
    }
    
    /**
     * Render search page
     */
    renderSearch() {
        const html = `
            <div class="search-page">
                <div class="page-header">
                    <h1>Search Courses</h1>
                    <p class="text-gray-600">Find the perfect course for your learning goals</p>
                </div>
                
                <div class="search-container">
                    <div class="search-input-container">
                        <input type="text" 
                               id="search-input" 
                               class="search-input" 
                               placeholder="Search for courses, topics, or instructors..."
                               value="${this.searchQuery}">
                        <button onclick="window.lmsApp.search.performSearch()" class="btn btn-primary">
                            🔍 Search
                        </button>
                    </div>
                    
                    <div class="search-filters">
                        <select id="category-filter" class="form-select">
                            <option value="">All Categories</option>
                            ${this.getUniqueCategories().map(category => 
                                `<option value="${category}" ${this.searchFilters.category === category ? 'selected' : ''}>${category}</option>`
                            ).join('')}
                        </select>
                        
                        <select id="level-filter" class="form-select">
                            <option value="">All Levels</option>
                            <option value="Beginner" ${this.searchFilters.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="Intermediate" ${this.searchFilters.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="Advanced" ${this.searchFilters.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                        </select>
                        
                        <select id="duration-filter" class="form-select">
                            <option value="">Any Duration</option>
                            <option value="short" ${this.searchFilters.duration === 'short' ? 'selected' : ''}>Short (< 2 hours)</option>
                            <option value="medium" ${this.searchFilters.duration === 'medium' ? 'selected' : ''}>Medium (2-5 hours)</option>
                            <option value="long" ${this.searchFilters.duration === 'long' ? 'selected' : ''}>Long (> 5 hours)</option>
                        </select>
                        
                        <select id="instructor-filter" class="form-select">
                            <option value="">All Instructors</option>
                            ${this.getUniqueInstructors().map(instructor => 
                                `<option value="${instructor}" ${this.searchFilters.instructor === instructor ? 'selected' : ''}>${instructor}</option>`
                            ).join('')}
                        </select>
                        
                        <button onclick="window.lmsApp.search.clearFilters()" class="btn btn-outline">
                            Clear Filters
                        </button>
                    </div>
                </div>
                
                <div id="search-results-container">
                    ${this.renderSearchResults()}
                </div>
            </div>
        `;
        
        window.lmsApp.renderContent(html);
        this.setupSearchListeners();
        
        // Perform initial search if there's a query
        if (this.searchQuery) {
            this.performSearch();
        } else {
            this.showAllCourses();
        }
    }
    
    /**
     * Setup search event listeners
     */
    setupSearchListeners() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const levelFilter = document.getElementById('level-filter');
        const durationFilter = document.getElementById('duration-filter');
        const instructorFilter = document.getElementById('instructor-filter');
        
        // Search on Enter key
        searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Search on input (debounced)
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value;
                this.performSearch();
            }, 300);
        });
        
        // Filter changes
        categoryFilter?.addEventListener('change', (e) => {
            this.searchFilters.category = e.target.value;
            this.performSearch();
        });
        
        levelFilter?.addEventListener('change', (e) => {
            this.searchFilters.level = e.target.value;
            this.performSearch();
        });
        
        durationFilter?.addEventListener('change', (e) => {
            this.searchFilters.duration = e.target.value;
            this.performSearch();
        });
        
        instructorFilter?.addEventListener('change', (e) => {
            this.searchFilters.instructor = e.target.value;
            this.performSearch();
        });
    }
    
    /**
     * Perform search with current query and filters
     */
    performSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.searchQuery = searchInput.value.trim();
        }
        
        this.searchResults = this.searchCourses(this.searchQuery, this.searchFilters);
        this.updateSearchResults();
    }
    
    /**
     * Search courses based on query and filters
     * @param {string} query - Search query
     * @param {object} filters - Search filters
     * @returns {Array} - Filtered courses
     */
    searchCourses(query, filters) {
        let results = [...COURSES_DATA];
        
        // Text search
        if (query) {
            const queryLower = query.toLowerCase();
            results = results.filter(course => {
                return (
                    course.title.toLowerCase().includes(queryLower) ||
                    course.description.toLowerCase().includes(queryLower) ||
                    course.category.toLowerCase().includes(queryLower) ||
                    course.instructor.toLowerCase().includes(queryLower) ||
                    course.lessons.some(lesson => 
                        lesson.title.toLowerCase().includes(queryLower)
                    )
                );
            });
        }
        
        // Category filter
        if (filters.category) {
            results = results.filter(course => course.category === filters.category);
        }
        
        // Level filter
        if (filters.level) {
            results = results.filter(course => course.level === filters.level);
        }
        
        // Duration filter
        if (filters.duration) {
            results = results.filter(course => {
                const duration = this.parseDuration(course.duration);
                switch (filters.duration) {
                    case 'short':
                        return duration < 2;
                    case 'medium':
                        return duration >= 2 && duration <= 5;
                    case 'long':
                        return duration > 5;
                    default:
                        return true;
                }
            });
        }
        
        // Instructor filter
        if (filters.instructor) {
            results = results.filter(course => course.instructor === filters.instructor);
        }
        
        // Sort results by relevance if there's a search query
        if (query) {
            results = this.sortByRelevance(results, query);
        }
        
        return results;
    }
    
    /**
     * Parse duration string to hours
     * @param {string} duration - Duration string
     * @returns {number} - Duration in hours
     */
    parseDuration(duration) {
        const match = duration.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h)/i);
        return match ? parseFloat(match[1]) : 0;
    }
    
    /**
     * Sort courses by search relevance
     * @param {Array} courses - Courses to sort
     * @param {string} query - Search query
     * @returns {Array} - Sorted courses
     */
    sortByRelevance(courses, query) {
        const queryLower = query.toLowerCase();
        
        return courses.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            
            // Title matches get highest score
            if (a.title.toLowerCase().includes(queryLower)) scoreA += 10;
            if (b.title.toLowerCase().includes(queryLower)) scoreB += 10;
            
            // Exact title matches get bonus
            if (a.title.toLowerCase() === queryLower) scoreA += 20;
            if (b.title.toLowerCase() === queryLower) scoreB += 20;
            
            // Category matches
            if (a.category.toLowerCase().includes(queryLower)) scoreA += 5;
            if (b.category.toLowerCase().includes(queryLower)) scoreB += 5;
            
            // Description matches
            if (a.description.toLowerCase().includes(queryLower)) scoreA += 3;
            if (b.description.toLowerCase().includes(queryLower)) scoreB += 3;
            
            // Instructor matches
            if (a.instructor.toLowerCase().includes(queryLower)) scoreA += 4;
            if (b.instructor.toLowerCase().includes(queryLower)) scoreB += 4;
            
            // Lesson title matches
            const lessonMatchesA = a.lessons.filter(lesson => 
                lesson.title.toLowerCase().includes(queryLower)
            ).length;
            const lessonMatchesB = b.lessons.filter(lesson => 
                lesson.title.toLowerCase().includes(queryLower)
            ).length;
            
            scoreA += lessonMatchesA * 2;
            scoreB += lessonMatchesB * 2;
            
            return scoreB - scoreA;
        });
    }
    
    /**
     * Update search results display
     */
    updateSearchResults() {
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = this.renderSearchResults();
        }
    }
    
    /**
     * Render search results
     * @returns {string} - HTML for search results
     */
    renderSearchResults() {
        const resultsCount = this.searchResults.length;
        const user = window.lmsApp.getCurrentUser();
        const enrolledCourseIds = user.enrolledCourses || [];
        
        if (resultsCount === 0 && (this.searchQuery || this.hasActiveFilters())) {
            return this.renderNoResults();
        }
        
        return `
            <div class="search-results">
                <div class="search-result-count">
                    ${resultsCount > 0 ? `Found ${resultsCount} course${resultsCount > 1 ? 's' : ''}` : 'Showing all courses'}
                    ${this.searchQuery ? ` for "${this.searchQuery}"` : ''}
                </div>
                
                <div class="search-results-grid grid grid-2 lg:grid-3">
                    ${this.searchResults.map(course => {
                        const isEnrolled = enrolledCourseIds.includes(course.id);
                        const progress = user.progress[course.id];
                        const completionPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
                        
                        return `
                            <div class="course-card card" onclick="window.lmsApp.router.navigate('/course/${course.id}')">
                                <div class="course-image">
                                    ${course.title.charAt(0)}
                                </div>
                                <div class="card-body">
                                    <div class="course-meta">
                                        <span class="badge badge-primary">${course.category}</span>
                                        <span class="badge badge-${this.getLevelBadgeClass(course.level)}">${course.level}</span>
                                    </div>
                                    
                                    <h3 class="course-title">${this.highlightSearchTerm(course.title, this.searchQuery)}</h3>
                                    <p class="course-description">${this.highlightSearchTerm(course.description, this.searchQuery)}</p>
                                    
                                    <div class="course-stats">
                                        <div class="text-sm text-gray-600">
                                            <div>📚 ${course.lessons.length} lessons</div>
                                            <div>⏱️ ${course.duration}</div>
                                            <div>👨‍🏫 ${this.highlightSearchTerm(course.instructor, this.searchQuery)}</div>
                                        </div>
                                    </div>
                                    
                                    ${isEnrolled ? `
                                        <div class="mt-4">
                                            <div class="progress mb-2">
                                                <div class="progress-bar" style="width: ${completionPercentage}%"></div>
                                            </div>
                                            <div class="text-sm text-gray-600">${completionPercentage}% complete</div>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div class="card-footer course-footer">
                                    ${isEnrolled ? `
                                        <a href="#/course/${course.id}" class="btn btn-primary">
                                            ${completionPercentage > 0 ? 'Continue' : 'Start'} Course
                                        </a>
                                    ` : `
                                        <button onclick="event.stopPropagation(); window.lmsApp.courses.enrollInCourse('${course.id}')" class="btn btn-primary">
                                            Enroll Now
                                        </button>
                                    `}
                                    
                                    <a href="#/course/${course.id}" class="btn btn-outline" onclick="event.stopPropagation()">View Details</a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render no results message
     * @returns {string} - HTML for no results
     */
    renderNoResults() {
        return `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>No courses found</h3>
                <p>We couldn't find any courses matching your search criteria.</p>
                <div class="mt-4">
                    <button onclick="window.lmsApp.search.clearFilters()" class="btn btn-primary">
                        Clear Filters
                    </button>
                    <a href="#/courses" class="btn btn-outline">
                        Browse All Courses
                    </a>
                </div>
            </div>
        `;
    }
    
    /**
     * Show all courses when no search is active
     */
    showAllCourses() {
        this.searchResults = [...COURSES_DATA];
        this.updateSearchResults();
    }
    
    /**
     * Clear all search filters and query
     */
    clearFilters() {
        this.searchQuery = '';
        this.searchFilters = {
            category: '',
            level: '',
            duration: '',
            instructor: ''
        };
        
        // Clear form inputs
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const levelFilter = document.getElementById('level-filter');
        const durationFilter = document.getElementById('duration-filter');
        const instructorFilter = document.getElementById('instructor-filter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (levelFilter) levelFilter.value = '';
        if (durationFilter) durationFilter.value = '';
        if (instructorFilter) instructorFilter.value = '';
        
        this.showAllCourses();
    }
    
    /**
     * Check if any filters are active
     * @returns {boolean} - Whether any filters are active
     */
    hasActiveFilters() {
        return Object.values(this.searchFilters).some(filter => filter !== '');
    }
    
    /**
     * Highlight search terms in text
     * @param {string} text - Text to highlight
     * @param {string} query - Search query
     * @returns {string} - Text with highlighted terms
     */
    highlightSearchTerm(text, query) {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * Get unique categories from all courses
     * @returns {Array} - Array of unique categories
     */
    getUniqueCategories() {
        return [...new Set(COURSES_DATA.map(course => course.category))].sort();
    }
    
    /**
     * Get unique instructors from all courses
     * @returns {Array} - Array of unique instructors
     */
    getUniqueInstructors() {
        return [...new Set(COURSES_DATA.map(course => course.instructor))].sort();
    }
    
    /**
     * Get badge class for course level
     * @param {string} level - Course level
     * @returns {string} - Badge class
     */
    getLevelBadgeClass(level) {
        switch (level.toLowerCase()) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'primary';
        }
    }
    
    /**
     * Search for specific query (for external use)
     * @param {string} query - Search query
     */
    searchFor(query) {
        this.searchQuery = query;
        this.clearFilters();
        this.renderSearch();
    }
    
    /**
     * Filter by category (for external use)
     * @param {string} category - Category to filter by
     */
    filterByCategory(category) {
        this.searchFilters.category = category;
        this.performSearch();
    }
    
    /**
     * Filter by level (for external use)
     * @param {string} level - Level to filter by
     */
    filterByLevel(level) {
        this.searchFilters.level = level;
        this.performSearch();
    }
    
    /**
     * Get search suggestions based on partial input
     * @param {string} partial - Partial search input
     * @returns {Array} - Array of suggestions
     */
    getSearchSuggestions(partial) {
        if (!partial || partial.length < 2) return [];
        
        const partialLower = partial.toLowerCase();
        const suggestions = new Set();
        
        COURSES_DATA.forEach(course => {
            // Course titles
            if (course.title.toLowerCase().includes(partialLower)) {
                suggestions.add(course.title);
            }
            
            // Categories
            if (course.category.toLowerCase().includes(partialLower)) {
                suggestions.add(course.category);
            }
            
            // Instructors
            if (course.instructor.toLowerCase().includes(partialLower)) {
                suggestions.add(course.instructor);
            }
            
            // Lesson titles
            course.lessons.forEach(lesson => {
                if (lesson.title.toLowerCase().includes(partialLower)) {
                    suggestions.add(lesson.title);
                }
            });
        });
        
        return Array.from(suggestions).slice(0, 10);
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}

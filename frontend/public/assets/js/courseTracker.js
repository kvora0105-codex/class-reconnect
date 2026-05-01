// Course tracking functionality
class CourseTracker {
    constructor() {
        this.recentStorageKey = 'recentCourses';
        this.viewsStorageKey = 'courseViews';
        this.maxRecentCourses = 5;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Add click event listeners to all course links
        document.querySelectorAll('.course-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const courseCard = link.closest('.course-card');
                if (courseCard) {
                    const courseName = courseCard.querySelector('h3').textContent;
                    this.trackCourseView(courseName, link.href);
                }
            });
        });
    }

    // Track when a course is viewed
    trackCourseView(courseName, courseUrl) {
        // Track in recent courses
        let recentCourses = this.getRecentCourses();
        
        // Create new course entry
        const courseEntry = {
            name: courseName,
            url: courseUrl,
            timestamp: new Date().toISOString(),
            id: Date.now() // Unique identifier for each view
        };

        // Add to beginning of array
        recentCourses.unshift(courseEntry);

        // Keep only the most recent views
        recentCourses = recentCourses.slice(0, this.maxRecentCourses);

        // Save recent courses to localStorage
        localStorage.setItem(this.recentStorageKey, JSON.stringify(recentCourses));

        // Track view count
        const views = this.getCourseViews();
        views[courseName] = {
            lastViewed: new Date().toISOString(),
            count: (views[courseName]?.count || 0) + 1
        };
        localStorage.setItem(this.viewsStorageKey, JSON.stringify(views));

        // Update dashboard if we're on it
        this.updateDashboardResources();
        this.updateCourseStats();
    }

    // Get recent courses from storage
    getRecentCourses() {
        const stored = localStorage.getItem(this.recentStorageKey);
        return stored ? JSON.parse(stored) : [];
    }

    // Get course views from storage
    getCourseViews() {
        const stored = localStorage.getItem(this.viewsStorageKey);
        return stored ? JSON.parse(stored) : {};
    }

    // Update the dashboard's course stats section
    updateCourseStats() {
        const statsContainer = document.getElementById('course-stats');
        if (!statsContainer) return;

        const views = this.getCourseViews();
        const courseEntries = Object.entries(views).sort((a, b) => {
            return new Date(b[1].lastViewed) - new Date(a[1].lastViewed);
        });

        if (courseEntries.length === 0) {
            statsContainer.innerHTML = '<p class="text-slate-500">No courses viewed yet</p>';
            return;
        }

        const statsHTML = courseEntries.map(([course, data]) => `
            <div class="p-4 bg-white rounded-lg shadow-sm mb-3">
                <h4 class="font-semibold text-gray-800">${course}</h4>
                <div class="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Viewed ${data.count} time${data.count === 1 ? '' : 's'}</span>
                    <span>Last viewed: ${this.formatTimestamp(data.lastViewed)}</span>
                </div>
            </div>
        `).join('');

        statsContainer.innerHTML = statsHTML;
    }

    // Update the dashboard's recent resources section
    updateDashboardResources() {
        const container = document.getElementById('recent-resources-container');
        if (!container) return;

        const recentCourses = this.getRecentCourses();

        if (recentCourses.length === 0) {
            container.innerHTML = '<p class="text-slate-500">No resources viewed recently. Go to the library to start exploring!</p>';
            return;
        }

        // Update view count in stats
        const resourceCount = document.getElementById('dashboard-resource-count');
        if (resourceCount) {
            resourceCount.textContent = recentCourses.length.toString();
        }

        // Create HTML for recent courses
        const coursesHTML = recentCourses.map(course => `
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5z"></path>
                                <line x1="12" y1="10" x2="12" y2="14"></line>
                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-slate-800">${course.name}</h4>
                        <p class="text-xs text-slate-500">${this.formatTimestamp(course.timestamp)}</p>
                    </div>
                </div>
                <a href="${course.url}" target="_blank" rel="noopener noreferrer" 
                   class="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                    Resume →
                </a>
            </div>
        `).join('');

        container.innerHTML = coursesHTML;
    }

    // Format timestamp to relative time
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize the course tracker
const courseTracker = new CourseTracker();

// Add click event listeners to course links
document.addEventListener('DOMContentLoaded', () => {
    // Update dashboard on load if we're on the dashboard
    courseTracker.updateDashboardResources();
    courseTracker.updateCourseStats();
});

// Handle URL hash changes to update dashboard when navigating
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#dashboard') {
        courseTracker.updateDashboardResources();
        courseTracker.updateCourseStats();
    }
});
// API utility functions for authentication
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Helper function to get current user from localStorage
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return null;
    }
}

// Helper function to set current user in localStorage
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    // Build headers - don't set Content-Type if body is FormData
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    
    // Only add Content-Type if body is not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    const config = {
        headers,
        ...options
    };

    console.debug('[API] Making request to:', url, {
        method: config.method || 'GET',
        hasToken: !!token,
        bodyLength: config.body ? (config.body instanceof FormData ? 'FormData' : config.body.length) : 0
    });

    try {
        const response = await fetch(url, config);
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
            console.warn('[API] Response was not JSON:', { contentType, data: data.substring(0, 100) });
        }
        
        if (!response.ok) {
            console.error('[API] Request failed:', {
                status: response.status,
                statusText: response.statusText,
                data
            });
            throw new Error(
                typeof data === 'object' ? data.error || 'API request failed' :
                `API request failed: ${response.status} ${response.statusText}`
            );
        }
        
        console.debug('[API] Request successful:', {
            endpoint,
            status: response.status,
            dataType: typeof data
        });
        
        return data;
    } catch (error) {
        console.error('[API] Request error:', {
            endpoint,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Export apiRequest so other modules (e.g., resources.js) can use it
export { apiRequest };

// Authentication API functions
export const authAPI = {
    // Student registration
    async registerStudent(userData) {
        const response = await apiRequest('/auth/register/student', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser(response.user);
        }
        
        return response;
    },

    // Teacher registration
    async registerTeacher(userData) {
        const response = await apiRequest('/auth/register/teacher', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser(response.user);
        }
        
        return response;
    },

    // Login
    async login(email, password, role) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role })
        });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser(response.user);
        }
        
        return response;
    },

    // Get current user profile
    async getProfile() {
        const response = await apiRequest('/auth/profile');
        setCurrentUser(response.user);
        return response.user;
    },

    // Update user profile
    async updateProfile(userData) {
        const response = await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        setCurrentUser(response.user);
        return response.user;
    },

    // Logout
    async logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {}
        removeAuthToken();
        localStorage.removeItem('currentUser');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!getAuthToken();
    },

    // Get current user
    getCurrentUser,

    // Get answer for Q&A
    async getAnswer(question) {
        const response = await apiRequest('/qa/answer', {
            method: 'POST',
            body: JSON.stringify({ question })
        });
        return response;
    }
};

// API Health Check
export async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const isHealthy = response.ok;
        console.debug('[API] Health check:', {
            status: response.status,
            ok: isHealthy,
            baseUrl: API_BASE_URL
        });
        return isHealthy;
    } catch (error) {
        console.error('[API] Health check failed:', error);
        return false;
    }
}

// Export utility functions
export { getCurrentUser, setCurrentUser, getAuthToken, setAuthToken, removeAuthToken };

// Convenience/login helpers
// loginUser: performs login via authAPI and redirects based on role
export async function loginUser(email, password, role, options = {}) {
    try {
        console.debug('[auth] loginUser called', { email, role });
        const res = await authAPI.login(email, password, role);
        console.debug('[auth] login succeeded', res);

        // Determine redirect based on role if not specified
        let redirect = options.redirect;
        if (!redirect) {
            redirect = role === 'teacher' ? 'index.html#contribute' : 'index.html#dashboard';
        }

        // Perform redirect
        console.debug('[auth] redirecting to', redirect);
        window.location.href = redirect;
        
        return res;
    } catch (err) {
        console.warn('[auth] loginUser error', err);
        throw err;
    }
}

// logoutAndRedirect: reads role from storage before clearing it, then redirects to teacher or student login
export function logoutAndRedirect() {
    // Clear auth data
    authAPI.logout();

    // Redirect to landing page
    console.debug('[auth] redirecting to landing page');
    window.location.href = 'landing.html';
}

// Ensure the user is authenticated client-side. If not authenticated, redirect to login.
// If a stored role exists it will redirect to the role-specific login page.
export function ensureAuthenticated(defaultRedirect = 'student-login.html') {
    const token = getAuthToken();
    if (token) return true;
    // No token: attempt to determine role from stored user (may be stale)
    try {
        const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (stored && stored.role === 'teacher') {
            console.debug('[auth] ensureAuthenticated: no token, role=teacher, redirecting to teacher-login.html');
            window.location.href = 'teacher-login.html';
            return false;
        }
    } catch (_) {}
    console.debug('[auth] ensureAuthenticated: no token, redirecting to', defaultRedirect);
    window.location.href = defaultRedirect;
    return false;
}

// Throw if not authenticated (useful for modules that should abort execution when unauthenticated)
export function requireAuthOrRedirect(defaultRedirect = 'student-login.html') {
    const ok = ensureAuthenticated(defaultRedirect);
    if (!ok) throw new Error('Redirecting to login');
    return true;
}

// API client with token management
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api';

let accessToken = null;
let refreshToken = null;

// Token management
export const setTokens = (access, refresh) => {
    accessToken = access;
    refreshToken = refresh;
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
};

//  Fetch wrapper with automatic token refresh
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add access token if available
    if (accessToken && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        let response = await fetch(url, {
            ...options,
            headers,
        });

        // If unauthorized, try to refresh token
        if (response.status === 403 && refreshToken && !options.skipAuth) {
            const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                accessToken = data.accessToken;

                // Retry original request with new token
                headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            } else {
                // Refresh failed, clear tokens
                clearTokens();
                window.location.href = '/login';
                throw new Error('Session expired');
            }
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Multipart upload (bypasses the JSON apiRequest wrapper)
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const headers = {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Upload failed');
    }
    return response.json();
};

// API methods
export const api = {
    // Generic methods
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),

    // Auth
    signup: (username, email, password) =>
        apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
            skipAuth: true,
        }),

    login: (email, password) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        }),

    // Users
    getCurrentUser: () => apiRequest('/users/me'),

    getUsers: () => apiRequest('/users'),

    updateProfile: (avatar_url, bio) =>
        apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify({ avatar_url, bio }),
        }),

    getUserById: (id) => apiRequest(`/users/${id}`),

    getUserByUsername: (username) => apiRequest(`/users/by-username/${username}`),

    followUser: (id) =>
        apiRequest(`/users/${id}/follow`, { method: 'POST' }),

    unfollowUser: (id) =>
        apiRequest(`/users/${id}/follow`, { method: 'DELETE' }),

    // Communities
    getCommunity: (name) => apiRequest(`/communities/${name}`),

    joinCommunity: (name) =>
        apiRequest(`/communities/${name}/join`, { method: 'POST' }),

    leaveCommunity: (name) =>
        apiRequest(`/communities/${name}/join`, { method: 'DELETE' }),

    // Posts
    getPosts: () => apiRequest('/posts'),

    getPostById: (id) => apiRequest(`/posts/${id}`),

    createPost: (title, content, image_url) =>
        apiRequest('/posts', {
            method: 'POST',
            body: JSON.stringify({ title, content, image_url }),
        }),

    deletePost: (id) =>
        apiRequest(`/posts/${id}`, { method: 'DELETE' }),

    likePost: (id) =>
        apiRequest(`/posts/${id}/like`, { method: 'POST' }),

    unlikePost: (id) =>
        apiRequest(`/posts/${id}/like`, { method: 'DELETE' }),

    getFavorites: () => apiRequest('/posts/favorites/all'),

    // Bookmarks (Saved posts)
    bookmarkPost: (id) =>
        apiRequest(`/posts/${id}/bookmark`, { method: 'POST' }),

    unbookmarkPost: (id) =>
        apiRequest(`/posts/${id}/bookmark`, { method: 'DELETE' }),

    getBookmarks: () => apiRequest('/posts/bookmarks/all'),

    // Following feed
    getFollowingFeed: () => apiRequest('/posts/feed/following'),

    // Emoji reactions
    getReactions: (id) => apiRequest(`/posts/${id}/reactions`),

    reactToPost: (id, emoji) =>
        apiRequest(`/posts/${id}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),

    // Notifications
    getNotifications: () => apiRequest('/notifications'),

    getUnreadCount: () => apiRequest('/notifications/unread-count'),

    markAllNotificationsRead: () =>
        apiRequest('/notifications/read-all', { method: 'PUT' }),

    // Comments
    createComment: (postId, content) =>
        apiRequest(`/comments/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        }),

    deleteComment: (id) =>
        apiRequest(`/comments/${id}`, { method: 'DELETE' }),
};

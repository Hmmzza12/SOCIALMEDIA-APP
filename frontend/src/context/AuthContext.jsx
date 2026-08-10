import { createContext, useState, useContext, useEffect } from 'react';
import { api, setTokens, clearTokens as clearApiTokens } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const savedAccessToken = localStorage.getItem('accessToken');
                const savedRefreshToken = localStorage.getItem('refreshToken');

                if (savedAccessToken && savedRefreshToken) {
                    setTokens(savedAccessToken, savedRefreshToken);
                    const data = await api.getCurrentUser();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const data = await api.login(email, password);
        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        return data.user;
    };

    const signup = async (username, email, password) => {
        const data = await api.signup(username, email, password);
        setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        clearApiTokens();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const updateUser = async (data) => {
        // data contains { bio, avatar_url }
        const updatedUser = await api.updateProfile(data.avatar_url, data.bio);
        // Backend returns message, we might need to fetch user again or just optimistically update
        // The backend `updateProfile` returns { message: '...' }
        // We should fetch current user to get updated details
        const currentUserData = await api.getCurrentUser();
        setUser(currentUserData.user);
        return currentUserData.user;
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

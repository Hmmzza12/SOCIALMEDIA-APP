import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import './GlobalHeader.css';

import pulseLogo from '../assets/pulse_logo.svg';

export default function GlobalHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState({ users: [], posts: [], communities: [] });
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim().length > 0) {
            setShowSearchDropdown(true);

            // Debounce search
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            setShowSearchDropdown(false);
        }
    };

    const performSearch = async (query) => {
        try {
            // In a real app, this would be a dedicated search endpoint
            // For now, we'll fetch users and filter client-side as a mock
            const usersRes = await api.get('/users');
            const postsRes = await api.get('/posts');

            const filteredUsers = (usersRes.users || []).filter(u =>
                u.username.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3);

            const filteredPosts = (postsRes.posts || []).filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3);

            // Mock communities based on users for now
            const filteredCommunities = (usersRes.users || []).filter(u =>
                u.username.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3);

            setSearchResults({
                users: filteredUsers,
                posts: filteredPosts,
                communities: filteredCommunities
            });
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleResultClick = (path) => {
        setShowSearchDropdown(false);
        setSearchQuery('');
        navigate(path);
    };

    return (
        <header className="global-header">
            <div className="header-left">
                <Link to="/" className="header-logo">
                    <img src={pulseLogo} alt="Pulse" width="32" height="32" className="logo-icon" />
                    <span className="logo-text">Pulse</span>
                </Link>
            </div>

            <div className="header-center" ref={searchRef}>
                <div className="search-input-wrapper">
                    <div className="search-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--text-secondary)">
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search Reddit"
                        className="global-search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
                    />
                </div>

                {showSearchDropdown && (
                    <div className="search-dropdown">
                        {searchResults.communities.length > 0 && (
                            <div className="search-section">
                                <h4>Communities</h4>
                                {searchResults.communities.map(comm => (
                                    <div
                                        key={`comm-${comm.id}`}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(`/r/${comm.username}`)}
                                    >
                                        <div className="result-icon community-icon">r/</div>
                                        <div className="result-info">
                                            <span className="result-name">r/{comm.username}</span>
                                            <span className="result-sub">Community</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchResults.users.length > 0 && (
                            <div className="search-section">
                                <h4>People</h4>
                                {searchResults.users.map(u => (
                                    <div
                                        key={`user-${u.id}`}
                                        className="search-result-item"
                                        onClick={() => handleResultClick(`/user/${u.id}`)}
                                    >
                                        <div className="result-icon user-avatar">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.username} />
                                            ) : (
                                                u.username[0].toUpperCase()
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <span className="result-name">u/{u.username}</span>
                                            <span className="result-sub">User</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchResults.posts.length === 0 && searchResults.users.length === 0 && searchResults.communities.length === 0 && (
                            <div className="no-results">No results found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="header-right">
                <div className="icon-actions">
                    <button className="icon-btn" title="Chat" onClick={() => navigate('/chat')}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5.025l-1.042 3.864c-.172.637.408 1.217 1.045 1.045l3.864-1.042C8.67 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8c-1.547 0-2.993-.443-4.226-1.204l-.196-.12-2.396.646.646-2.396-.12-.196C4.443 14.993 4 13.547 4 12c0-4.418 3.582-8 8-8z" />
                        </svg>
                    </button>
                    <button className="icon-btn" title="Create Post" onClick={() => navigate('/create')}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
                        </svg>
                    </button>
                    <button className="icon-btn" title="Notifications">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                        </svg>
                    </button>
                </div>

                <div className="header-user">
                    {user ? (
                        <div className="user-dropdown-btn">
                            <div className="header-avatar">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} />
                                ) : (
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                                )}
                            </div>
                            <div className="header-user-details">
                                <span className="header-username">{user.username}</span>
                                <span className="header-karma">1 karma</span>
                            </div>
                            <svg className="chevron-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Log In</Link>
                            <Link to="/signup" className="btn-signup">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

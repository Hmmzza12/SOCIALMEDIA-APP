import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

export default function RightSidebar() {
    const [trendingTags, setTrendingTags] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const navigate = useNavigate();
    return (
        <aside className="right-sidebar">
            {/* Search Bar Placeholder */}
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Search"
                    className="input-field"
                    style={{ borderRadius: '9999px', paddingLeft: '20px' }}
                />
            </div>

            {/* Trending Section */}
            <div className="sidebar-widget">
                <h3 className="widget-title">Trending for you</h3>

                <div className="trending-item">
                    <span className="trending-category">Technology · Trending</span>
                    <span className="trending-tag">#ReactJS</span>
                    <span className="trending-category">25.4K Posts</span>
                </div>

                <div className="trending-item">
                    <span className="trending-category">Programming · Trending</span>
                    <span className="trending-tag">#TypeScript</span>
                    <span className="trending-category">18.2K Posts</span>
                </div>

                <div className="trending-item">
                    <span className="trending-category">Design · Trending</span>
                    <span className="trending-tag">#UIUX</span>
                    <span className="trending-category">12.1K Posts</span>
                </div>

                <div className="trending-item">
                    <span className="trending-category">Open Source · Trending</span>
                    <span className="trending-tag">#MySQL</span>
                    <span className="trending-category">8.5K Posts</span>
                </div>
            </div>

            {/* Suggested Users */}
            <div className="sidebar-widget">
                <h3 className="widget-title">Who to follow</h3>

                <div className="suggested-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/user/1" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                        <div className="post-avatar" style={{ width: '40px', height: '40px' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Felix" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Felix</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>@felix_dev</span>
                        </div>
                    </Link>
                    <button className="btn-primary" style={{ padding: '0 16px', height: '32px', fontSize: '14px', width: 'auto' }}>Follow</button>
                </div>

                <div className="suggested-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/user/2" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                        <div className="post-avatar" style={{ width: '40px', height: '40px' }}>
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Sarah</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>@sarah_codes</span>
                        </div>
                    </Link>
                    <button className="btn-outline" style={{ padding: '0 16px', height: '32px', fontSize: '14px', width: 'auto', borderRadius: '9999px' }}>Follow</button>
                </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <p>© 2026 Social App, Inc.</p>
            </div>
        </aside>
    );
}

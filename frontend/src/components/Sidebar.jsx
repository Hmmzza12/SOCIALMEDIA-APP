import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
    const location = useLocation();
    // Sections state for collapsing, all open by default for now
    const [sections, setSections] = useState({
        feeds: true,
        recent: true,
        communities: true
    });

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="left-sidebar">
            <div className="sidebar-scroll-content">

                {/* Feeds Section */}
                <div className="sidebar-section">
                    <div className="section-header" onClick={() => toggleSection('feeds')}>
                        <span>FEEDS</span>
                        <span className="chevron">{sections.feeds ? '▼' : '▶'}</span>
                    </div>
                    {sections.feeds && (
                        <div className="section-items">
                            {/* Placeholder for feeds, assuming dynamic items will be added here */}
                            {/* The original </Link> was an error and has been removed. */}
                        </div>
                    )}
                </div>

                {/* Recent Section (Mock Data) */}
                <div className="sidebar-section">
                    <div className="section-header" onClick={() => toggleSection('recent')}>
                        <span>RECENT</span>
                        <span className="chevron">{sections.recent ? '▼' : '▶'}</span>
                    </div>
                    {sections.recent && (
                        <div className="section-items">
                            <Link to="/r/reactjs" className="nav-link">
                                <span className="nav-icon community-icon-sm">r/</span>
                                <span className="nav-text">r/reactjs</span>
                            </Link>
                            <Link to="/r/javascript" className="nav-link">
                                <span className="nav-icon community-icon-sm">r/</span>
                                <span className="nav-text">r/javascript</span>
                            </Link>
                            <Link to="/r/webdev" className="nav-link">
                                <span className="nav-icon community-icon-sm">r/</span>
                                <span className="nav-text">r/webdev</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Communities Section (Topics) */}
                <div className="sidebar-section">
                    <div className="section-header" onClick={() => toggleSection('communities')}>
                        <span>TOPICS</span>
                        <span className="chevron">{sections.communities ? '▼' : '▶'}</span>
                    </div>
                    {sections.communities && (
                        <div className="section-items">
                            <Link to="/r/programming" className="nav-link">
                                <span className="nav-icon">💻</span>
                                <span className="nav-text">Programming</span>
                            </Link>
                            <Link to="/r/gaming" className="nav-link">
                                <span className="nav-icon">🎮</span>
                                <span className="nav-text">Gaming</span>
                            </Link>
                            <Link to="/r/crypto" className="nav-link">
                                <span className="nav-icon">🪙</span>
                                <span className="nav-text">Crypto</span>
                            </Link>
                            <Link to="/r/television" className="nav-link">
                                <span className="nav-icon">📺</span>
                                <span className="nav-text">Television</span>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="sidebar-section">
                    <div className="section-header">
                        <span>RESOURCES</span>
                    </div>
                    <div className="section-items">
                        <Link to="/about" className="nav-link">
                            <span className="nav-icon">ℹ️</span>
                            <span className="nav-text">About</span>
                        </Link>
                        <Link to="/help" className="nav-link">
                            <span className="nav-icon">❓</span>
                            <span className="nav-text">Help</span>
                        </Link>
                    </div>
                </div>

            </div >
        </aside >
    );
}

import { useNavigate, useLocation } from 'react-router-dom';
import pulseLogo from '../assets/pulse_logo.svg';

export default function LeftNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'home', icon: '🏠', label: 'Home', path: '/' },
    ];

    const isActive = (path) => {
        // For chat, check if we're on any chat route
        if (path === '/chat') {
            return location.pathname.startsWith('/chat');
        }
        return location.pathname === path;
    };

    return (
        <div className="chat-left-nav">
            {/* Pulse Logo */}
            <div className="nav-logo" onClick={() => navigate('/')}>
                <img src={pulseLogo} alt="Pulse" width="32" height="32" />
            </div>

            {/* Navigation Items */}
            <div className="nav-items">
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <div className="nav-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

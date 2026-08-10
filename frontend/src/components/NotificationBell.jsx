import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getAccessToken } from '../utils/api';
import './NotificationBell.css';

const timeAgo = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString + 'Z').getTime()) / 1000);
    if (isNaN(diff)) return '';
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const messageFor = (n) => {
    switch (n.type) {
        case 'like': return <>upvoted your post{n.post_title ? <> <b>“{n.post_title}”</b></> : ''}</>;
        case 'comment': return <>commented on{n.post_title ? <> <b>“{n.post_title}”</b></> : ' your post'}</>;
        case 'mention': return <>mentioned you in a comment{n.post_title ? <> on <b>“{n.post_title}”</b></> : ''}</>;
        case 'follow': return <>started following you</>;
        default: return <>interacted with you</>;
    }
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pulse, setPulse] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const loadUnread = async () => {
        if (!getAccessToken()) return; // token not restored yet
        try {
            const { count } = await api.getUnreadCount();
            setUnread((prev) => {
                if (count > prev) setPulse(true);
                return count;
            });
        } catch { /* ignore */ }
    };

    useEffect(() => {
        loadUnread();
        const interval = setInterval(loadUnread, 20000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = async () => {
        const next = !open;
        setOpen(next);
        if (next) {
            setLoading(true);
            try {
                const { notifications } = await api.getNotifications();
                setNotifications(notifications);
                if (unread > 0) {
                    await api.markAllNotificationsRead();
                    setUnread(0);
                }
            } catch { /* ignore */ }
            finally { setLoading(false); }
        }
    };

    const handleClick = (n) => {
        setOpen(false);
        if (n.post_id) navigate(`/post/${n.post_id}`);
        else navigate(`/user/${n.actor_id}`);
    };

    return (
        <div className="notif-wrapper" ref={ref}>
            <button
                className={`flex items-center justify-center w-9 h-9 rounded-full text-content-secondary hover:bg-hover hover:text-content-primary transition-all duration-150 ${pulse ? 'bell-pulse' : ''}`}
                title="Notifications"
                onClick={toggleOpen}
                onAnimationEnd={() => setPulse(false)}
            >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
                {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <h4>Notifications</h4>
                    </div>
                    <div className="notif-list">
                        {loading ? (
                            <div className="notif-empty">Loading…</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <div className="notif-empty-icon">🔔</div>
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`notif-item ${n.is_read ? '' : 'unread'}`}
                                    onClick={() => handleClick(n)}
                                >
                                    <div className="notif-avatar">
                                        <img
                                            src={n.actor_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor_username}`}
                                            alt={n.actor_username}
                                        />
                                    </div>
                                    <div className="notif-text">
                                        <span><b>u/{n.actor_username}</b> {messageFor(n)}</span>
                                        <span className="notif-time">{timeAgo(n.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

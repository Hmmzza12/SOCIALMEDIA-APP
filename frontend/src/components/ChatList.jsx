import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserListModal from './UserListModal';

export default function ChatList() {
    const { conversations, activeConversationId } = useChat();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showUserModal, setShowUserModal] = useState(false);

    const getRandomColor = (username) => {
        const colors = ['#00D4AA', '#FFB800', '#FF4500', '#0079D3'];
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If today, show time
        if (diffDays === 0 || diffDays === 1) {
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
        // Otherwise show date in "Aug 21, 2025" format
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleCompose = () => {
        setShowUserModal(true);
    };

    return (
        <>
            <div className="sidebar-header">
                <div className="sidebar-title-row">
                    <div className="sidebar-title">Chats</div>
                    <div className="sidebar-actions">
                        <button className="compose-btn" title="New Message" onClick={handleCompose}>+</button>
                    </div>
                </div>
            </div>
            <div className="thread-list">
                {conversations.length === 0 ? (
                    <div style={{ padding: '24px 16px', color: 'var(--chat-text-secondary)', textAlign: 'center', fontSize: '14px' }}>
                        No conversations yet
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => navigate(`/chat/${conv.id}`)}
                            className={`thread-item ${activeConversationId === conv.id ? 'active' : ''}`}
                        >
                            <div className="thread-avatar" style={{ backgroundColor: conv.partner_avatar ? 'transparent' : getRandomColor(conv.partner_username || '?') }}>
                                {conv.partner_avatar ? (
                                    <img src={conv.partner_avatar} alt={conv.partner_username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                    conv.partner_username?.[0]?.toUpperCase()
                                )}
                            </div>
                            <div className="thread-content">
                                <div className="thread-header">
                                    <span className="thread-username">{conv.partner_username}</span>
                                    {conv.last_message_time && (
                                        <span className="thread-time">
                                            {formatDate(conv.last_message_time)}
                                        </span>
                                    )}
                                </div>
                                <div className={`thread-preview ${conv.unread_count > 0 ? 'unread' : ''}`}>
                                    {conv.sender_id === user?.id && 'You: '}
                                    {conv.last_message || 'Start chatting...'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <UserListModal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
            />
        </>
    );
}



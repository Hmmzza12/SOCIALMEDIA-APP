import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useChat } from '../context/ChatContext';
import './UserListModal.css';

export default function UserListModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { loadConversations } = useChat();

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // For now, show empty state if API fails
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const getRandomColor = (username) => {
        const colors = ['#00D4AA', '#FFB800', '#FF4500', '#0079D3'];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleStartChat = async (userId) => {
        try {
            // Create or get conversation with this user
            const response = await api.post('/chat/conversations', { partnerId: userId });

            // Refresh conversations list to show the new chat
            await loadConversations();

            // Navigate to the conversation
            navigate(`/chat/${response.conversationId}`);
            onClose();
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Failed to start conversation. Please try again.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="user-modal-overlay" onClick={onClose}>
            <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="user-modal-header">
                    <h2>Start a Conversation</h2>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="user-modal-search">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="user-search-input"
                    />
                </div>

                <div className="user-modal-list">
                    {loading ? (
                        <div className="user-modal-loading">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="user-modal-empty">No users found</div>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="user-modal-item">
                                <div
                                    className="user-modal-avatar"
                                    style={{ backgroundColor: user.avatar_url ? 'transparent' : getRandomColor(user.username) }}
                                >
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        user.username[0].toUpperCase()
                                    )}
                                </div>
                                <div className="user-modal-info">
                                    <div className="user-modal-username">{user.username}</div>
                                    {user.bio && (
                                        <div className="user-modal-bio">{user.bio}</div>
                                    )}
                                </div>
                                <button
                                    className="user-modal-message-btn"
                                    onClick={() => handleStartChat(user.id)}
                                >
                                    Message
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

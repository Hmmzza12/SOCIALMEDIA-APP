import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export default function ChatWindow({ conversationId }) {
    const { messages, sendMessage, typingUsers, startTyping, stopTyping, conversations } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const conversationMessages = messages[conversationId] || [];
    const isTyping = typingUsers[conversationId]?.some(id => id !== user?.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage(conversationId, newMessage);
            setNewMessage('');
            stopTyping(conversationId);
        } catch (err) {
            console.error('Failed to send', err);
        }
    };

    const handleChange = (e) => {
        setNewMessage(e.target.value);
        startTyping(conversationId);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(conversationId);
        }, 1000);
    };

    const activeConv = conversations.find(c => c.id === conversationId);
    const partnerName = activeConv?.partner_username || 'Chat';
    const partnerAvatar = activeConv?.partner_avatar;

    const getRandomColor = (username) => {
        const colors = ['#00D4AA', '#FFB800', '#FF4500', '#0079D3'];
        let hash = 0;
        for (let i = 0; i < (username || '').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const formatDateSeparator = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0 || diffDays === 1) {
            return 'Today';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Group messages by date for separators
    const getDateSeparator = () => {
        if (conversationMessages.length > 0) {
            return formatDateSeparator(conversationMessages[0].created_at);
        }
        return 'Today';
    };

    return (
        <div className="chat-main">
            {/* Header */}
            <div className="chat-header">
                <div className="header-avatar-large" style={{ backgroundColor: partnerAvatar ? 'transparent' : getRandomColor(partnerName) }}>
                    {partnerAvatar ? (
                        <img src={partnerAvatar} alt={partnerName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                        partnerName[0].toUpperCase()
                    )}
                </div>
                <div className="header-username">{partnerName}</div>
                <div className="header-actions">
                    <button className="header-action-btn" title="Settings">⚙</button>
                    <button className="header-action-btn" title="Expand">⤢</button>
                    <button className="header-action-btn" title="Close" onClick={() => window.history.back()}>✕</button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
                {conversationMessages.length > 0 && (
                    <div className="date-separator">{getDateSeparator()}</div>
                )}

                {conversationMessages.map((msg, index) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id || index} className={`message-row ${isOwn ? 'sent' : 'received'}`}>
                            {!isOwn && (
                                <div className="message-avatar" style={{ backgroundColor: msg.sender_avatar ? 'transparent' : getRandomColor(msg.sender_username || partnerName) }}>
                                    {msg.sender_avatar ? (
                                        <img src={msg.sender_avatar} alt={msg.sender_username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        (msg.sender_username?.[0] || partnerName[0])?.toUpperCase()
                                    )}
                                </div>
                            )}
                            <div className="message-col">
                                <div className="message-meta">
                                    <span className="message-username">{isOwn ? 'You' : (msg.sender_username || partnerName)}</span>
                                    <span className="message-timestamp">
                                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {conversationMessages.length === 0 && (
                    <div className="empty-state">
                        <h3>No messages yet</h3>
                        <p>Say hello to start the conversation!</p>
                    </div>
                )}

                {isTyping && (
                    <div className="typing-indicator">
                        {partnerName} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-wrapper">
                <form onSubmit={handleSend} className="chat-input-container">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleChange}
                        placeholder="Message"
                        className="chat-input-field"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="send-btn-icon"
                        title="Send"
                    >
                        ✈
                    </button>
                </form>
            </div>
        </div>
    );
}


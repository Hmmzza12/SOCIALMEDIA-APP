import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Send, X } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9'];
const colorFor = (username) => {
    let hash = 0;
    for (let i = 0; i < (username || '?').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
};

export default function ChatWindow({ conversationId }) {
    const { messages, sendMessage, typingUsers, startTyping, stopTyping, conversations } = useChat();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const conversationMessages = messages[conversationId] || [];
    const isTyping = typingUsers[conversationId]?.some((id) => id !== user?.id);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        typingTimeoutRef.current = setTimeout(() => stopTyping(conversationId), 1000);
    };

    const activeConv = conversations.find((c) => c.id === conversationId);
    const partnerName = activeConv?.partner_username || 'Chat';
    const partnerAvatar = activeConv?.partner_avatar;

    const dateSeparator = conversationMessages.length > 0
        ? (() => {
            const d = new Date(conversationMessages[0].created_at);
            const diffDays = Math.ceil(Math.abs(new Date() - d) / (1000 * 60 * 60 * 24));
            return diffDays <= 1 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        })()
        : 'Today';

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 h-[57px] border-b border-edge shrink-0 relative">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
                    style={{ backgroundColor: partnerAvatar ? 'transparent' : colorFor(partnerName) }}
                >
                    {partnerAvatar ? (
                        <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                    ) : (
                        partnerName[0].toUpperCase()
                    )}
                </div>
                <div className="font-semibold text-sm text-content-primary">{partnerName}</div>
                <button
                    onClick={() => window.history.back()}
                    title="Close"
                    className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-content-secondary hover:bg-hover hover:text-content-primary transition-all"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2 min-h-0">
                {conversationMessages.length > 0 && (
                    <div className="self-center text-xs font-medium text-content-muted my-3">{dateSeparator}</div>
                )}

                {conversationMessages.map((msg, index) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isOwn ? 'self-end flex-row-reverse' : 'self-start'}`}>
                            {!isOwn && (
                                <div
                                    className="w-8 h-8 rounded-full shrink-0 mt-1 flex items-center justify-center font-semibold text-white text-sm overflow-hidden"
                                    style={{ backgroundColor: msg.sender_avatar ? 'transparent' : colorFor(msg.sender_username || partnerName) }}
                                >
                                    {msg.sender_avatar ? (
                                        <img src={msg.sender_avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (msg.sender_username?.[0] || partnerName[0])?.toUpperCase()
                                    )}
                                </div>
                            )}
                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-[13px] font-bold text-content-primary">{isOwn ? 'You' : (msg.sender_username || partnerName)}</span>
                                    <span className="text-[11px] text-content-muted">
                                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`text-sm leading-relaxed break-words ${isOwn ? 'bg-accent text-white px-3 py-2 rounded-2xl rounded-tr-sm' : 'text-content-primary'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {conversationMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                        <h3 className="text-base font-semibold text-content-primary">No messages yet</h3>
                        <p className="text-sm text-content-secondary">Say hello to start the conversation!</p>
                    </div>
                )}

                {isTyping && (
                    <div className="ml-11 text-[13px] italic text-content-muted py-2">{partnerName} is typing…</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-3 bg-surface border border-edge rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-accent transition-all">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleChange}
                        placeholder="Message"
                        className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        title="Send"
                        className="text-accent disabled:text-content-muted disabled:cursor-not-allowed hover:opacity-80 transition-all"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

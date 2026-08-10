import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import UserListModal from './UserListModal';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9'];
const colorFor = (username) => {
    let hash = 0;
    for (let i = 0; i < (username || '?').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
};

export default function ChatList() {
    const { conversations, activeConversationId } = useChat();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showUserModal, setShowUserModal] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const diffDays = Math.ceil(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between px-4 h-[57px] border-b border-edge shrink-0">
                <div className="font-display text-lg font-bold text-content-primary">Chats</div>
                <button
                    onClick={() => setShowUserModal(true)}
                    title="New message"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-content-secondary hover:bg-hover hover:text-content-primary transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 min-h-0">
                {conversations.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-content-secondary">No conversations yet</div>
                ) : (
                    conversations.map((conv) => {
                        const active = activeConversationId === conv.id;
                        return (
                            <button
                                key={conv.id}
                                onClick={() => navigate(`/chat/${conv.id}`)}
                                className={`flex items-start gap-3 w-full px-4 py-3 text-left border-l-2 transition-colors ${active ? 'bg-surface border-accent' : 'border-transparent hover:bg-surface'}`}
                            >
                                <div
                                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-semibold text-white overflow-hidden"
                                    style={{ backgroundColor: conv.partner_avatar ? 'transparent' : colorFor(conv.partner_username) }}
                                >
                                    {conv.partner_avatar ? (
                                        <img src={conv.partner_avatar} alt={conv.partner_username} className="w-full h-full object-cover" />
                                    ) : (
                                        conv.partner_username?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-sm font-semibold text-content-primary truncate">{conv.partner_username}</span>
                                        {conv.last_message_time && (
                                            <span className="text-xs text-content-muted shrink-0">{formatDate(conv.last_message_time)}</span>
                                        )}
                                    </div>
                                    <div className={`text-[13px] truncate ${conv.unread_count > 0 ? 'text-content-primary font-semibold' : 'text-content-secondary'}`}>
                                        {conv.sender_id === user?.id && 'You: '}
                                        {conv.last_message || 'Start chatting...'}
                                    </div>
                                </div>
                                {conv.unread_count > 0 && (
                                    <span className="mt-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            <UserListModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
        </div>
    );
}

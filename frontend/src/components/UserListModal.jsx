import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { api } from '../utils/api';
import { useChat } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9'];
const colorFor = (username) => {
    let hash = 0;
    for (let i = 0; i < (username || '?').length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
};

export default function UserListModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { loadConversations } = useChat();
    const toast = useToast();

    useEffect(() => {
        if (isOpen) fetchUsers();
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.users || []);
        } catch (error) {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (userId) => {
        try {
            const response = await api.post('/chat/conversations', { partnerId: userId });
            await loadConversations();
            navigate(`/chat/${response.conversationId}`);
            onClose();
        } catch (error) {
            toast.error('Failed to start conversation');
        }
    };

    const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md bg-elevated border border-edge rounded-2xl overflow-hidden shadow-2xl search-dropdown"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
                    <h2 className="font-display text-lg font-bold text-content-primary">Start a conversation</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-content-secondary hover:bg-hover hover:text-content-primary transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 border-b border-edge">
                    <input
                        type="text"
                        placeholder="Search users…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-edge rounded-full px-4 py-2 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                    {loading ? (
                        <div className="px-5 py-8 text-center text-sm text-content-secondary">Loading users…</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-content-secondary">No users found</div>
                    ) : (
                        filteredUsers.map((u) => (
                            <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-hover transition-colors">
                                <div
                                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-semibold text-white overflow-hidden"
                                    style={{ backgroundColor: u.avatar_url ? 'transparent' : colorFor(u.username) }}
                                >
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                    ) : (
                                        u.username[0].toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-content-primary truncate">{u.username}</div>
                                    {u.bio && <div className="text-xs text-content-muted truncate">{u.bio}</div>}
                                </div>
                                <button
                                    onClick={() => handleStartChat(u.id)}
                                    className="text-xs font-semibold px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent-active transition-all"
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

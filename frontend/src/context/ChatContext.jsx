import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api, getAccessToken } from '../utils/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// Use the API URL base for socket, but need origin (e.g. http://localhost:3001)
// API_URL in api.js is http://localhost:3001/api, so we need to strip /api
// But cleaner to just use host:3010 if we know it.
// Let's expect ENV or derive from API_URL.
const SOCKET_URL = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : 'http://localhost:3010';

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState({}); // { conversationId: [messages] }
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState({}); // { conversationId: [userIds] }

    // Ref to track active conversation for event handlers
    const activeConvRef = useRef(null);

    useEffect(() => {
        activeConvRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const token = getAccessToken();
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                reconnection: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            newSocket.on('receive_message', (message) => {
                handleReceiveMessage(message);
            });

            newSocket.on('user_typing', ({ userId, conversationId }) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [conversationId]: [...(prev[conversationId] || []), userId]
                }));
            });

            newSocket.on('user_stopped_typing', ({ userId, conversationId }) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [conversationId]: (prev[conversationId] || []).filter(id => id !== userId)
                }));
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, user]);

    // Load initial conversations
    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
        }
    }, [isAuthenticated]);

    const loadConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.conversations);
        } catch (err) {
            console.error('Failed to load conversations', err);
        }
    };

    const joinConversation = (conversationId) => {
        if (socket) {
            socket.emit('join_conversation', conversationId);
            setActiveConversationId(conversationId);
            loadMessages(conversationId);
            markAsRead(conversationId);
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await api.post(`/chat/conversations/${conversationId}/read`);
            // Update local state
            setConversations(prev => prev.map(c => {
                if (c.id === conversationId) {
                    return { ...c, unread_count: 0 };
                }
                return c;
            }));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const loadMessages = async (conversationId) => {
        if (messages[conversationId]) return; // Already loaded? Maybe refresh?
        try {
            const res = await api.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(prev => ({
                ...prev,
                [conversationId]: res.messages
            }));
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const sendMessage = async (conversationId, content) => {
        // Optimistic update
        // But we need message ID.
        // Let's just emit to socket or call API.
        // API call first to save DB, then socket emits?
        // Or client emits to socket, server saves and emits back.
        // Implementation Plan said: Save to DB, Emit messages.
        // My server.ts handles `send_message` by just broadcasting. It DOES NOT SAVE to DB.
        // AND I added a POST /api/chat/messages endpoint in chat.routes.ts !
        // So I should call API to save, then emit, or API saves and we emit.
        // Better:
        // 1. Call API POST /messages -> saves to DB, returns Message object.
        // 2. Client receives Message object.
        // 3. Client emits 'send_message' with Message object to socket to notify others.
        // Wait, if I emit, I get it back via 'receive_message' active listener?
        // Let's try: Call API. API saves. API returns message. 
        // Then we update local state.
        // And we emit to socket so OTHERS get it.

        // Actually, cleaner if Backend API emits the socket event after saving!
        // But my chat.routes.ts does not use `io`. 
        // Wait, `server.ts` sets `app.set('io', io)`.
        // So `chat.routes.ts` CAN access `req.app.get('io')`.

        // Let's modify chat.routes.ts to emit?
        // Or for now, frontend emits.

        try {
            const res = await api.post('/chat/messages', { conversationId, content });
            const message = res.message;

            // Add to local state immediately
            handleReceiveMessage(message);

            // Emit to others
            if (socket) {
                socket.emit('send_message', message);
            }
        } catch (err) {
            console.error('Failed to send message', err);
            throw err;
        }
    };

    const handleReceiveMessage = (message) => {
        setMessages(prev => {
            const list = prev[message.conversation_id] || [];
            // Dedup
            if (list.some(m => m.id === message.id)) return prev;
            return {
                ...prev,
                [message.conversation_id]: [...list, message]
            };
        });

        // Update conversation last_message
        // Also update unread count if NOT the active conversation
        setConversations(prev => {
            const updated = prev.map(c => {
                if (c.id === message.conversation_id) {
                    const isOwnMessage = message.sender_id === user?.id;
                    return {
                        ...c,
                        last_message: message.content,
                        last_message_time: message.created_at,
                        unread_count: (c.id !== activeConvRef.current && !isOwnMessage)
                            ? (c.unread_count || 0) + 1
                            : c.unread_count
                    };
                }
                return c;
            });
            // Re-sort: put latest conversation at top
            return updated.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        });

        // If it IS active conversation, we should mark as read implicitly (debounce or immediate?)
        // Better to just call markAsRead again if it's active to sync with server
        if (activeConvRef.current === message.conversation_id && message.sender_id !== user?.id) {
            markAsRead(message.conversation_id);
        }
    };

    const startTyping = (conversationId) => {
        if (socket) socket.emit('typing_start', conversationId);
    };

    const stopTyping = (conversationId) => {
        if (socket) socket.emit('typing_stop', conversationId);
    };

    // New: Start/Get conversation by user ID
    const startConversationWithUser = async (userId) => {
        try {
            const res = await api.post('/chat/conversations', { partnerId: userId });
            const conversationId = res.conversationId;
            joinConversation(conversationId);
            return conversationId;
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <ChatContext.Provider value={{
            socket,
            conversations,
            activeConversationId,
            messages,
            typingUsers,
            sendMessage,
            joinConversation,
            startTyping,
            stopTyping,
            startConversationWithUser,
            markAsRead,
            loadConversations
        }}>
            {children}
        </ChatContext.Provider>
    );
};

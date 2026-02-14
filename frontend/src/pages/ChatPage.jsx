import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import LeftNavigation from '../components/LeftNavigation';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

import './chat.css';

export default function ChatPage() {
    const { id } = useParams();
    const { joinConversation, activeConversationId } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            joinConversation(Number(id));
        }
    }, [id]);

    return (
        <div className="chat-container">
            {/* Left Navigation Panel (72px) */}
            <LeftNavigation />

            {/* Middle Thread List Panel (320px) */}
            <div className={`chat-thread-panel ${!id ? 'active' : ''} ${id ? 'hidden-mobile' : ''}`}>
                <ChatList />
            </div>

            {/* Right Conversation Panel (flexible) */}
            <div className={`chat-conversation-panel ${id ? 'active' : ''} ${!id ? 'hidden-mobile' : ''}`}>
                {activeConversationId ? (
                    <ChatWindow conversationId={activeConversationId} />
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <h3>Select a conversation</h3>
                        <p>Choose a user from the left to start chatting.</p>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .hidden-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}


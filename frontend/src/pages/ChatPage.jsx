import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import LeftNavigation from '../components/LeftNavigation';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function ChatPage() {
    const { id } = useParams();
    const { joinConversation, activeConversationId } = useChat();

    useEffect(() => {
        if (id) joinConversation(Number(id));
    }, [id]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[72px_320px_1fr] h-screen bg-base text-content-primary overflow-hidden">
            {/* Left rail */}
            <div className="hidden md:block">
                <LeftNavigation />
            </div>

            {/* Thread list */}
            <div className={`flex-col border-r border-edge min-h-0 ${id ? 'hidden md:flex' : 'flex'}`}>
                <ChatList />
            </div>

            {/* Conversation */}
            <div className={`flex-col min-h-0 ${id ? 'flex' : 'hidden md:flex'}`}>
                {activeConversationId ? (
                    <ChatWindow conversationId={activeConversationId} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
                        <div className="text-6xl opacity-30">💬</div>
                        <h3 className="text-lg font-semibold text-content-primary">Select a conversation</h3>
                        <p className="text-content-secondary text-sm">Choose a user from the left to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

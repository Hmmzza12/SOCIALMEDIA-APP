import { Sparkles, Users, MessageSquare, Bookmark, Bell, Palette } from 'lucide-react';

const FEATURES = [
    { icon: Sparkles, title: 'Post & react', text: 'Share posts, upvote, and react with emoji.' },
    { icon: Users, title: 'Follow people', text: 'Build a personalized Following feed.' },
    { icon: MessageSquare, title: 'Comment & mention', text: 'Reply to threads and @mention others.' },
    { icon: Bookmark, title: 'Save for later', text: 'Bookmark posts to your Saved page.' },
    { icon: Bell, title: 'Stay notified', text: 'Get notified on likes, comments, mentions, follows.' },
    { icon: Palette, title: 'Light & dark', text: 'A polished theme for any time of day.' },
];

export default function About() {
    return (
        <div className="max-w-2xl mx-auto py-2">
            <div className="flex items-center gap-3 mb-2">
                <span className="inline-block w-5 h-5 rotate-45 rounded-[3px] bg-accent" />
                <h1 className="font-display text-3xl font-bold text-content-primary">About Pulse</h1>
            </div>
            <p className="text-content-secondary text-base leading-relaxed mb-8">
                Pulse is a Reddit-inspired community platform where you can share ideas, join the
                conversation, and connect with people around the topics you love.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
                {FEATURES.map((f) => (
                    <div key={f.title} className="flex gap-3 bg-surface border border-edge rounded-xl p-4">
                        <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                            <f.icon size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-content-primary text-sm mb-0.5">{f.title}</h3>
                            <p className="text-content-secondary text-sm">{f.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-content-muted text-xs mt-8">Pulse · Built with React, Express & SQLite · MIT License</p>
        </div>
    );
}

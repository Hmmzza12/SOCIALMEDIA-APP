import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { ArrowUp, MessageSquare } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#0ea5e9'];
const colorFor = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '?').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
};

export default function RecentPostsSidebar() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentPosts();
    }, []);

    const loadRecentPosts = async () => {
        try {
            const data = await api.get('/posts');
            setRecentPosts(data.posts.slice(0, 5));
        } catch (err) {
            console.error('Failed to load recent posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const diffMins = Math.floor((Date.now() - date) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    return (
        <aside className="hidden xl:flex flex-col fixed right-0 top-[52px] w-[300px] h-[calc(100vh-52px)] overflow-y-auto bg-base border-l border-edge p-4 z-40">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-content-muted">Recent Posts</h3>
                {recentPosts.length > 0 && (
                    <button
                        onClick={() => setRecentPosts([])}
                        className="text-xs text-content-muted hover:text-accent transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-1">
                {loading ? (
                    <div className="text-sm text-content-muted">Loading...</div>
                ) : recentPosts.length === 0 ? (
                    <div className="text-sm text-content-muted">No recent posts</div>
                ) : (
                    recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="flex gap-3 p-3 rounded-lg border border-transparent hover:bg-[rgb(var(--c-elevated))] hover:border-edge cursor-pointer transition-all duration-150"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                {post.image_url ? (
                                    <img src={post.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                                ) : (
                                    <span
                                        className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm rounded-lg"
                                        style={{ background: colorFor(post.username) }}
                                    >
                                        {(post.username || '?')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-content-muted mb-0.5">
                                    <span className="truncate">r/{post.community_name || post.username}</span>
                                    <span>·</span>
                                    <span className="shrink-0">{formatTime(post.created_at)}</span>
                                </div>
                                <div className="text-sm font-medium text-content-primary leading-snug line-clamp-2">{post.title}</div>
                                <div className="flex items-center gap-3 text-[11px] text-content-muted mt-1">
                                    <span className="flex items-center gap-1"><ArrowUp size={11} /> {post.like_count || 0}</span>
                                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {post.comments_count || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </aside>
    );
}

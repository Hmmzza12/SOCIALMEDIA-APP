import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import './RecentPostsSidebar.css';

export default function RecentPostsSidebar() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentPosts();
    }, []);

    const loadRecentPosts = async () => {
        try {
            const data = await api.get('/posts');
            // Get last 5 posts
            setRecentPosts(data.posts.slice(0, 5));
        } catch (err) {
            console.error('Failed to load recent posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setRecentPosts([]);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    const truncateTitle = (title, maxLength = 60) => {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <aside className="recent-posts-sidebar">
                <div className="recent-posts-header">
                    <h3>RECENT POSTS</h3>
                </div>
                <div className="recent-posts-loading">Loading...</div>
            </aside>
        );
    }

    return (
        <aside className="recent-posts-sidebar">
            <div className="recent-posts-header">
                <h3>RECENT POSTS</h3>
                {recentPosts.length > 0 && (
                    <button className="clear-btn" onClick={handleClear}>
                        Clear
                    </button>
                )}
            </div>

            <div className="recent-posts-list">
                {recentPosts.length === 0 ? (
                    <div className="recent-posts-empty">No recent posts</div>
                ) : (
                    recentPosts.map(post => (
                        <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="recent-post-item"
                        >
                            {post.image_url && (
                                <div className="recent-post-thumbnail">
                                    <img src={post.image_url} alt="" />
                                </div>
                            )}
                            <div className="recent-post-content">
                                <div className="recent-post-meta">
                                    <span className="recent-post-community">r/{post.username}</span>
                                    <span className="recent-post-time">{formatTime(post.created_at)}</span>
                                </div>
                                <div className="recent-post-title">
                                    {truncateTitle(post.title)}
                                </div>
                                <div className="recent-post-stats">
                                    <span>↑ {post.likes_count || 0}</span>
                                    <span>💬 {post.comments_count || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </aside>
    );
}

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Get current user

    const loadPosts = async () => {
        try {
            const data = await api.get('/posts');
            setPosts(data.posts);
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleLike = async (postId, isLiked) => {
        try {
            // Backend doesn't tell us if we liked it, so we try to LIKE.
            await api.post(`/posts/${postId}/like`);
            loadPosts();
        } catch (err) {
            // If error is 409 (Conflict), it means we already liked it, so we UNLIKE.
            if (err.message === 'Post already liked' || (err.response && err.response.status === 409)) {
                try {
                    await api.delete(`/posts/${postId}/like`);
                    loadPosts();
                } catch (unlikeErr) {
                    console.error('Unlike error:', unlikeErr);
                }
            } else {
                console.error('Like error:', err);
            }
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="posts-feed">
                {[1, 2, 3].map(n => <div key={n} className="loading-skeleton" style={{ height: '200px', marginBottom: '16px' }}></div>)}
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div>
            {/* Feed Controls Header */}
            <div className="feed-header-controls" style={{ marginBottom: '16px' }}>
                <div className="feed-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="sort-dropdown" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-tertiary)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                    }}>
                        <span>Best</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                    </div>

                    <div className="view-toggle" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-tertiary)',
                        padding: '6px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z" /></svg>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                    </div>
                </div>
            </div>

            <div className="posts-feed">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <h3>No posts yet</h3>
                        <p>Be the first to share something!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLikeChange={handleLike}
                            onDelete={handleDelete}
                            currentUserId={user?.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

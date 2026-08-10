import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Saved() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const toast = useToast();

    const loadSaved = async () => {
        try {
            const data = await api.getBookmarks();
            setPosts(data.posts);
        } catch (err) {
            console.error('Failed to load saved posts', err);
            toast.error('Failed to load saved posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSaved();
    }, []);

    const handleDelete = async (postId) => {
        try {
            await api.deletePost(postId);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            toast.success('Post deleted');
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    return (
        <div>
            <div className="feed-header">
                <h2 className="feed-title">🔖 Saved Posts</h2>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {posts.length} saved
                </span>
            </div>

            {loading ? (
                <div className="posts-feed" style={{ padding: '16px' }}>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="loading-skeleton" style={{ height: '160px', marginBottom: '12px' }} />
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔖</div>
                    <h3 style={{ marginBottom: '6px' }}>No saved posts yet</h3>
                    <p>Tap <b>Save</b> on any post to keep it here for later.</p>
                </div>
            ) : (
                <div className="posts-feed" style={{ padding: '12px' }}>
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const loadFavorites = async () => {
        try {
            const data = await api.get('/posts/favorites/all');
            setPosts(data.posts);
        } catch (err) {
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const handleLike = async (postId) => {
        // For favorites page, unlike means remove from list
        try {
            await api.delete(`/posts/${postId}/like`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div>
            <div className="feed-header">
                <h2 className="feed-title">Favorites</h2>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{user?.username}</span>
            </div>

            <div className="posts-feed">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <h3>No favorites yet</h3>
                        <p>Like posts to save them here!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={user?.id}
                            onLikeChange={handleLike}
                        // Note: Favorites page implies all are liked. 
                        // Clicking like again (to unlike) removes it.
                        />
                    ))
                )}
            </div>
        </div>
    );
}

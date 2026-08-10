import { useState, useEffect } from 'react';
import { Flame, Users } from 'lucide-react';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('foryou'); // 'foryou' | 'following'
    const { user } = useAuth();
    const toast = useToast();

    const loadPosts = async (which) => {
        setLoading(true);
        setError('');
        try {
            const data = which === 'following'
                ? await api.getFollowingFeed()
                : await api.get('/posts');
            setPosts(data.posts);
        } catch (err) {
            setError('Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(tab);
    }, [tab]);

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            toast.success('Post deleted');
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${tab === id
                ? 'bg-accent text-white'
                : 'text-content-secondary hover:bg-hover hover:text-content-primary'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div>
            {/* Feed tabs */}
            <div className="flex items-center gap-2 mb-4">
                <TabButton id="foryou" icon={Flame} label="For You" />
                <TabButton id="following" icon={Users} label="Following" />
            </div>

            {loading ? (
                <div className="posts-feed">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="loading-skeleton mb-3" style={{ height: '180px' }} />
                    ))}
                </div>
            ) : error ? (
                <div className="error-message" style={{ padding: '16px', color: 'var(--error)' }}>{error}</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 px-6 text-content-secondary">
                    <div className="text-5xl mb-3">{tab === 'following' ? '👥' : '📝'}</div>
                    <h3 className="text-lg font-semibold text-content-primary mb-1">
                        {tab === 'following' ? 'Your Following feed is empty' : 'No posts yet'}
                    </h3>
                    <p>
                        {tab === 'following'
                            ? 'Follow people and their posts will show up here.'
                            : 'Be the first to share something!'}
                    </p>
                </div>
            ) : (
                <div className="posts-feed">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDelete={handleDelete}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

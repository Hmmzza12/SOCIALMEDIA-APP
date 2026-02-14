import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

// Icons
const DeleteIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor"><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3.001-2.79L19.94 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.138 13.54c-.043.54-.487.96-1.028.96H7.86c-.541 0-.985-.42-1.028-.96L6.08 8h11.84l-.782 11.04zM9 11v8h2v-8H9zm4 0v8h2v-8h-2z"></path></svg>
);

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadPost = async () => {
        try {
            const data = await api.getPostById(id);
            setPost(data.post);
            setComments(data.comments);
        } catch (err) {
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPost();
    }, [id]);

    const handleLike = async (postId, isLiked) => {
        try {
            await api.post(`/posts/${postId}/like`);
            loadPost();
        } catch (err) {
            if (err.message === 'Post already liked' || (err.response && err.response.status === 409)) {
                try {
                    await api.delete(`/posts/${postId}/like`);
                    loadPost();
                } catch (e) { }
            }
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.deletePost(postId);
            navigate('/');
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            await api.createComment(id, newComment);
            setNewComment('');
            loadPost(); // Reload to see new comment
        } catch (err) {
            alert('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete comment?')) return;
        try {
            await api.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert('Failed to delete comment');
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
    if (error || !post) return <div className="error-message">Post not found</div>;

    return (
        <div>
            <div className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '20px' }}>
                    ←
                </button>
                <h2 className="feed-title">Post</h2>
            </div>

            <PostCard
                post={post}
                currentUserId={user?.id}
                onLikeChange={handleLike}
                onDelete={handleDeletePost}
                isDetailedView={true}
            />

            {/* Comment Form */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
                    <div className="post-avatar" style={{ width: '40px', height: '40px' }}>
                        <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="My Avatar" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Post your reply"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '18px', padding: '8px 0' }}
                        />
                        <div style={{ display: 'flex', justifySelf: 'end', marginTop: '8px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ height: '36px', padding: '0 16px', fontSize: '14px', width: 'auto' }}
                                disabled={submitting || !newComment.trim()}
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Comments List */}
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.id} className="post-card" style={{ cursor: 'default', borderBottom: '1px solid var(--border)' }}>
                        <div className="post-header">
                            <div className="post-avatar" style={{ width: '40px', height: '40px' }}>
                                <img src={comment.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`} alt={comment.username} />
                            </div>
                            <div className="post-meta" style={{ flex: 1 }}>
                                <span className="post-author-name">{comment.username}</span>
                                <span className="post-username">@{comment.username.toLowerCase()}</span>
                                <span>·</span>
                                <span className="post-time">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            {user?.id === comment.user_id && (
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            )}
                        </div>
                        <div className="post-content" style={{ marginTop: '-20px' }}>
                            <p className="post-body">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No comments yet. Be the first to reply!
                    </div>
                )}
            </div>
        </div>
    );
}

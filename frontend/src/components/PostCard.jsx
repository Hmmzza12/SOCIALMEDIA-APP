import { Link, useNavigate } from 'react-router-dom';
import './PostCard.css';

// Simple date formatter
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Upvote/Downvote Icons
const UpvoteIcon = ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M10 4l6 6H4l6-6zm0 12V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DownvoteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 16l-6-6h12l-6 6zm0-12v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CommentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5.5C3 4.119 4.119 3 5.5 3h9C15.881 3 17 4.119 17 5.5v6c0 1.381-1.119 2.5-2.5 2.5H7l-4 3v-3h-.5C2.119 14 3 12.881 3 11.5v-6z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 10l6-6m-6 0l6 6M7 6v10m0-10H5.5C4.119 6 3 7.119 3 8.5v6C3 15.881 4.119 17 5.5 17H7" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3.001-2.79L19.94 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.138 13.54c-.043.54-.487.96-1.028.96H7.86c-.541 0-.985-.42-1.028-.96L6.08 8h11.84l-.782 11.04z" />
    </svg>
);

export default function PostCard({ post, onLikeChange, onDelete, currentUserId, isDetailedView = false }) {
    const isOwner = currentUserId === post.user_id;
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (!isDetailedView) {
            navigate(`/post/${post.id}`);
        }
    };

    const handleVote = (e) => {
        e.stopPropagation();
        // Toggle like/unlike
        onLikeChange(post.id, false);
    };

    return (
        <div
            className="reddit-post-card"
            onClick={handleCardClick}
            style={{ cursor: isDetailedView ? 'default' : 'pointer' }}
        >
            {/* Post Header - Community style */}
            <div className="reddit-post-header">
                <div className="post-community-info">
                    <div className="community-icon">
                        <Link to={`/user/${post.user_id}`} onClick={(e) => e.stopPropagation()}>
                            {post.avatar_url ? (
                                <img src={post.avatar_url} alt={post.username} />
                            ) : (
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt={post.username} />
                            )}
                        </Link>
                    </div>
                    <div className="community-meta">
                        <Link to={`/user/${post.user_id}`} className="community-name" onClick={(e) => e.stopPropagation()}>
                            r/{post.username}
                        </Link>
                        <span className="post-meta-divider">•</span>
                        <span className="post-time-ago">{formatDate(post.created_at)}</span>
                    </div>
                </div>
                <button className="join-btn">Join</button>
            </div>

            {/* Post Content */}
            <div className="reddit-post-content">
                <h2 className="reddit-post-title">{post.title}</h2>

                {post.content && (
                    <p className="reddit-post-body">
                        {post.content.length > 300 && !isDetailedView
                            ? `${post.content.substring(0, 300)}...`
                            : post.content}
                        {post.content.length > 300 && !isDetailedView && (
                            <span className="read-more"> Read more</span>
                        )}
                    </p>
                )}

                {post.image_url && (
                    <div className="reddit-post-image">
                        <img src={post.image_url} alt="Post attachment" />
                    </div>
                )}
            </div>

            {/* Post Actions - Reddit Style */}
            <div className="reddit-post-actions">
                <button className="reddit-action-btn vote-btn" onClick={handleVote}>
                    <UpvoteIcon filled={false} />
                    <span className="vote-count">{post.like_count || 0}</span>
                    <DownvoteIcon />
                </button>

                <button
                    className="reddit-action-btn comment-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDetailedView) navigate(`/post/${post.id}`);
                    }}
                >
                    <CommentIcon />
                    <span>{post.comments_count || 0} Comments</span>
                </button>

                <button className="reddit-action-btn share-btn" onClick={(e) => e.stopPropagation()}>
                    <ShareIcon />
                    <span>Share</span>
                </button>

                {isOwner && onDelete && (
                    <button
                        className="reddit-action-btn delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(post.id);
                        }}
                        title="Delete post"
                    >
                        <DeleteIcon />
                    </button>
                )}
            </div>
        </div>
    );
}

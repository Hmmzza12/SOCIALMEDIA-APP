import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, Share2, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Reactions from './Reactions';

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

export default function PostCard({ post, onDelete, currentUserId, isDetailedView = false }) {
    const isOwner = currentUserId === post.user_id;
    const navigate = useNavigate();
    const toast = useToast();

    const [liked, setLiked] = useState(!!post.liked);
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [bookmarked, setBookmarked] = useState(!!post.bookmarked);
    const [joined, setJoined] = useState(!!post.is_member);
    const [likeAnim, setLikeAnim] = useState(false);
    const [saveAnim, setSaveAnim] = useState(false);

    const handleCardClick = () => {
        if (!isDetailedView) navigate(`/post/${post.id}`);
    };

    const handleVote = async (e) => {
        e.stopPropagation();
        const next = !liked;
        setLiked(next);
        setLikeCount((c) => c + (next ? 1 : -1));
        if (next) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400); }
        try {
            if (next) await api.likePost(post.id);
            else await api.unlikePost(post.id);
        } catch (err) {
            if (err.message === 'Post already liked') return;
            setLiked(!next);
            setLikeCount((c) => c + (next ? -1 : 1));
            toast.error('Could not update vote');
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        const next = !bookmarked;
        setBookmarked(next);
        if (next) { setSaveAnim(true); setTimeout(() => setSaveAnim(false), 400); }
        try {
            if (next) { await api.bookmarkPost(post.id); toast.success('Saved to your bookmarks'); }
            else { await api.unbookmarkPost(post.id); toast.info('Removed from bookmarks'); }
        } catch (err) {
            if (err.message === 'Post already bookmarked') return;
            setBookmarked(!next);
            toast.error('Could not update bookmark');
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/post/${post.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(
                () => toast.success('Link copied to clipboard'),
                () => toast.error('Could not copy link')
            );
        } else {
            toast.info(url);
        }
    };

    const communityLabel = post.community_name ? `r/${post.community_name}` : `r/${post.username}`;
    const communityPath = post.community_name ? `/r/${post.community_name}` : `/user/${post.user_id}`;

    const actionBtn = 'flex items-center gap-1.5 px-2 py-1.5 text-xs text-content-muted hover:text-content-primary transition-colors duration-150 bg-transparent border-0 outline-0';

    return (
        <article
            onClick={handleCardClick}
            className={`group flex gap-3 bg-surface border border-edge rounded-[12px] p-4 mb-3 transition-all duration-150 ${isDetailedView ? '' : 'cursor-pointer hover:border-accent/40'}`}
        >
            {/* Vote column */}
            <div className="flex flex-col items-center gap-1 min-w-[32px] pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={handleVote}
                    title={liked ? 'Remove upvote' : 'Upvote'}
                    className={`p-1 rounded hover:bg-hover transition-all duration-150 active:scale-110 ${likeAnim ? 'pop-anim' : ''} ${liked ? 'text-upvote' : 'text-content-muted hover:text-upvote'}`}
                >
                    <ArrowBigUp size={22} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <span className={`text-sm font-bold tabular-nums ${liked ? 'text-upvote' : 'text-content-primary'}`}>{likeCount}</span>
                <button
                    onClick={(e) => e.stopPropagation()}
                    title="Downvote"
                    className="p-1 rounded text-content-muted hover:bg-hover hover:text-downvote transition-all duration-150 active:scale-110"
                >
                    <ArrowBigDown size={22} />
                </button>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 text-sm">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-hover shrink-0">
                            <img
                                src={post.community_name ? post.community_icon : (post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`)}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <Link to={communityPath} onClick={(e) => e.stopPropagation()} className="font-semibold text-content-primary hover:underline truncate">
                            {communityLabel}
                        </Link>
                        <span className="text-content-muted">·</span>
                        <span className="text-content-secondary truncate hidden sm:inline">Posted by u/{post.username}</span>
                        <span className="text-content-muted">·</span>
                        <span className="text-content-muted text-xs shrink-0">{formatDate(post.created_at)}</span>
                    </div>
                    {post.community_name && (
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                const next = !joined;
                                setJoined(next);
                                try {
                                    if (next) await api.joinCommunity(post.community_name);
                                    else await api.leaveCommunity(post.community_name);
                                } catch (err) {
                                    if (err.message !== 'Already a member') setJoined(!next);
                                }
                            }}
                            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full hover:scale-105 transition-all duration-150 ${joined ? 'bg-transparent border border-edge text-content-secondary hover:border-accent hover:text-accent' : 'bg-accent text-white hover:bg-accent-active'}`}
                        >
                            {joined ? 'Joined' : 'Join'}
                        </button>
                    )}
                </div>

                {/* Title + body */}
                <h2 className="font-display text-lg font-semibold text-content-primary mb-1 leading-snug">{post.title}</h2>
                {post.content && (
                    <p className={`text-sm text-content-secondary leading-relaxed ${isDetailedView ? '' : 'line-clamp-3'}`}>
                        {post.content}
                    </p>
                )}

                {post.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-edge bg-black flex justify-center max-h-[512px]">
                        <img src={post.image_url} alt="Post attachment" className="max-w-full max-h-[512px] object-contain" />
                    </div>
                )}

                {/* Action row — borderless */}
                <div className="flex items-center gap-1 mt-3 -ml-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); if (!isDetailedView) navigate(`/post/${post.id}`); }}
                        className={actionBtn}
                    >
                        <MessageSquare size={16} />
                        <span>{post.comments_count || 0} Comments</span>
                    </button>
                    <button
                        onClick={handleBookmark}
                        className={`${actionBtn} ${saveAnim ? 'pop-anim' : ''} ${bookmarked ? '!text-accent' : ''}`}
                    >
                        <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                        <span>{bookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                    <button onClick={handleShare} className={actionBtn}>
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>
                    {isOwner && onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                            title="Delete post"
                            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-content-muted hover:text-red-400 transition-colors duration-150 bg-transparent border-0 outline-0 ml-auto"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Emoji reactions */}
                <div className="mt-2">
                    <Reactions postId={post.id} />
                </div>
            </div>
        </article>
    );
}

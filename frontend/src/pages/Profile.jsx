import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';

export default function Profile() {
    const { user: authUser, updateUser } = useAuth();
    const { id } = useParams(); // Should be undefined if /profile
    const navigate = useNavigate();
    const { startConversationWithUser } = useChat();
    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState({ bio: '', avatar_url: '' });
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false); // State guess

    const isOwnProfile = !id || (authUser && Number(id) === authUser.id);
    const profileId = isOwnProfile ? authUser?.id : Number(id);

    useEffect(() => {
        if (profileId) {
            loadProfileData();
        }
    }, [profileId, authUser]); // Reload if authUser changes or id changes

    const loadProfileData = async () => {
        try {
            setLoading(true);
            // 1. Get user details
            // If own profile, we might use authUser, but for consistency let's fetch fresh
            const userRes = await api.getUserById(profileId);
            setProfileUser(userRes.user);
            setDetails({
                bio: userRes.user.bio || '',
                avatar_url: userRes.user.avatar_url || ''
            });
            setStats({
                followers: userRes.user.followers,
                following: userRes.user.following
            });

            // 2. Get all posts and filter (Backend limitation)
            const postsRes = await api.getPosts();
            const myPosts = postsRes.posts.filter(p => p.user_id === profileId);
            setUserPosts(myPosts);

            // Reset follow state guess (default false unless we know better)
            setIsFollowing(false);
            // We can't know for sure without an endpoint.
        } catch (err) {
            console.error('Failed to load profile data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateUser(details);
            setIsEditing(false);
            loadProfileData(); // Reload to show updates
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.unfollowUser(profileId);
                setIsFollowing(false);
                setStats(s => ({ ...s, followers: s.followers - 1 }));
            } else {
                await api.followUser(profileId);
                setIsFollowing(true);
                setStats(s => ({ ...s, followers: s.followers + 1 }));
            }
        } catch (err) {
            // If we tried to follow but already following (409)
            if (err.message === 'Already following this user' || (err.response && err.response.status === 409)) {
                setIsFollowing(true);
                // Maybe prompt to unfollow?
                // For now, just correct the state.
            } else {
                console.error(err);
            }
        }
    };

    const handleLike = async (postId, isLiked) => {
        try {
            await api.post(`/posts/${postId}/like`);
            // Optimistic or reload. Let's just reload posts.
            const postsRes = await api.getPosts();
            const myPosts = postsRes.posts.filter(p => p.user_id === profileId);
            setUserPosts(myPosts);
        } catch (err) {
            if (err.message === 'Post already liked' || (err.response && err.response.status === 409)) {
                try {
                    await api.delete(`/posts/${postId}/like`);
                    const postsRes = await api.getPosts();
                    const myPosts = postsRes.posts.filter(p => p.user_id === profileId);
                    setUserPosts(myPosts);
                } catch (e) { }
            }
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.deletePost(postId);
            setUserPosts(userPosts.filter(p => p.id !== postId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMessage = async () => {
        if (!profileUser) return;
        const convId = await startConversationWithUser(profileUser.id);
        if (convId) {
            navigate(`/chat/${convId}`);
        }
    };

    if (loading || !profileUser) return <div style={{ padding: '20px' }}>Loading profile...</div>;

    return (
        <div>
            <div className="feed-header">
                <h2 className="feed-title">{profileUser.username}</h2>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{userPosts.length} posts</span>
            </div>

            {/* Profile Header */}
            <div style={{ position: 'relative' }}>
                <div style={{ height: '200px', backgroundColor: '#333639' }}></div>

                <div style={{ padding: '0 16px', position: 'relative' }}>
                    <div style={{
                        width: '134px',
                        height: '134px',
                        borderRadius: '50%',
                        border: '4px solid black',
                        backgroundColor: 'black',
                        marginTop: '-67px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <img
                            src={profileUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <div style={{ position: 'absolute', top: '12px', right: '16px' }}>
                        {isOwnProfile ? (
                            <button
                                className="btn-outline"
                                style={{ borderRadius: '9999px', fontWeight: 'bold' }}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit profile'}
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={isFollowing ? "btn-outline" : "btn-primary"}
                                    style={{ borderRadius: '9999px', fontWeight: 'bold', padding: '0 16px', height: '36px', width: 'auto' }}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button
                                    className="btn-outline"
                                    style={{ borderRadius: '9999px', fontWeight: 'bold', padding: '0 16px', height: '36px', width: 'auto' }}
                                    onClick={handleMessage}
                                >
                                    Message
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>{profileUser.username}</h2>
                        <div style={{ color: 'var(--text-secondary)' }}>@{profileUser.username.toLowerCase()}</div>
                    </div>

                    <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                        {isEditing && isOwnProfile ? (
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                                <input
                                    className="input-field"
                                    placeholder="Avatar URL"
                                    value={details.avatar_url}
                                    onChange={e => setDetails({ ...details, avatar_url: e.target.value })}
                                />
                                <textarea
                                    className="textarea-field"
                                    placeholder="Bio"
                                    value={details.bio}
                                    onChange={e => setDetails({ ...details, bio: e.target.value })}
                                    rows="3"
                                    style={{ minHeight: 'auto' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ height: '36px', fontSize: '14px', width: 'auto' }}>Save</button>
                            </form>
                        ) : (
                            <p>{profileUser.bio || "No bio yet."}</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{stats.following}</strong> Following</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{stats.followers}</strong> Followers</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '16px', fontWeight: 'bold', borderBottom: '4px solid var(--primary)', cursor: 'pointer' }}>
                    Posts
                </div>
            </div>

            {/* User Posts */}
            <div className="posts-feed">
                {userPosts.length === 0 ? (
                    <div className="empty-state">No posts yet</div>
                ) : (
                    userPosts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={authUser?.id}
                            onDelete={handleDelete}
                            onLikeChange={handleLike}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

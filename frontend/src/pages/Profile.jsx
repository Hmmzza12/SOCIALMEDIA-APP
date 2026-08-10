import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, uploadImage } from '../utils/api';
import PostCard from '../components/PostCard';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';
import { Upload, MessageSquare } from 'lucide-react';

export default function Profile() {
    const { user: authUser, updateUser } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { startConversationWithUser } = useChat();
    const toast = useToast();
    const [profileUser, setProfileUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState({ bio: '', avatar_url: '' });
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const isOwnProfile = !id || (authUser && Number(id) === authUser.id);
    const profileId = isOwnProfile ? authUser?.id : Number(id);

    useEffect(() => {
        if (profileId) loadProfileData();
    }, [profileId, authUser]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const userRes = await api.getUserById(profileId);
            setProfileUser(userRes.user);
            setDetails({ bio: userRes.user.bio || '', avatar_url: userRes.user.avatar_url || '' });
            setStats({ followers: userRes.user.followers, following: userRes.user.following });

            const postsRes = await api.getPosts();
            setUserPosts(postsRes.posts.filter((p) => p.user_id === profileId));
            setIsFollowing(!!userRes.user.is_following);
        } catch (err) {
            console.error('Failed to load profile data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { url } = await uploadImage(file);
            setDetails((d) => ({ ...d, avatar_url: url }));
            toast.success('Avatar uploaded');
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateUser(details);
            setIsEditing(false);
            loadProfileData();
            toast.success('Profile updated');
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.unfollowUser(profileId);
                setIsFollowing(false);
                setStats((s) => ({ ...s, followers: s.followers - 1 }));
                toast.info(`Unfollowed ${profileUser.username}`);
            } else {
                await api.followUser(profileId);
                setIsFollowing(true);
                setStats((s) => ({ ...s, followers: s.followers + 1 }));
                toast.success(`Following ${profileUser.username}`);
            }
        } catch (err) {
            if (err.message === 'Already following this user') setIsFollowing(true);
            else console.error(err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.deletePost(postId);
            setUserPosts((prev) => prev.filter((p) => p.id !== postId));
            toast.success('Post deleted');
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    const handleMessage = async () => {
        if (!profileUser) return;
        const convId = await startConversationWithUser(profileUser.id);
        if (convId) navigate(`/chat/${convId}`);
    };

    if (loading || !profileUser) {
        return <div className="p-6 text-content-secondary">Loading profile…</div>;
    }

    const avatarSrc = details.avatar_url || profileUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.username}`;

    const btnBase = 'rounded-full font-semibold text-sm px-4 h-9 flex items-center gap-2 transition-all duration-150';

    return (
        <div>
            {/* Banner */}
            <div className="h-40 rounded-xl bg-gradient-to-r from-accent/70 via-accent to-accent-active" />

            <div className="px-4">
                {/* Avatar + actions */}
                <div className="flex items-end justify-between -mt-12 mb-3">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-base bg-surface">
                            <img src={avatarSrc} alt={profileUser.username} className="w-full h-full object-cover" />
                        </div>
                        {isEditing && (
                            <>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent-active transition-all"
                                    title="Upload avatar"
                                >
                                    <Upload size={15} />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isOwnProfile ? (
                            <button className={`${btnBase} border border-edge text-content-primary hover:bg-hover`} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? 'Cancel' : 'Edit profile'}
                            </button>
                        ) : (
                            <>
                                <button
                                    className={`${btnBase} ${isFollowing ? 'border border-edge text-content-primary hover:bg-hover' : 'bg-accent text-white hover:bg-accent-active hover:scale-105'}`}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button className={`${btnBase} border border-edge text-content-primary hover:bg-hover`} onClick={handleMessage}>
                                    <MessageSquare size={15} /> Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Name */}
                <h1 className="font-display text-2xl font-bold text-content-primary">{profileUser.username}</h1>
                <div className="text-content-muted text-sm mb-3">@{profileUser.username.toLowerCase()}</div>

                {/* Bio / edit form */}
                {isEditing && isOwnProfile ? (
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3 max-w-md mb-4">
                        <input
                            className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Avatar URL (or upload above)"
                            value={details.avatar_url}
                            onChange={(e) => setDetails({ ...details, avatar_url: e.target.value })}
                        />
                        <textarea
                            className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            placeholder="Bio"
                            rows="3"
                            value={details.bio}
                            onChange={(e) => setDetails({ ...details, bio: e.target.value })}
                        />
                        <button type="submit" className="self-start bg-accent text-white rounded-full font-semibold text-sm px-5 h-9 hover:bg-accent-active transition-all">
                            Save
                        </button>
                    </form>
                ) : (
                    <p className="text-content-primary mb-4">{profileUser.bio || 'No bio yet.'}</p>
                )}

                {/* Stats */}
                <div className="flex gap-5 text-sm text-content-secondary mb-6">
                    <span><strong className="text-content-primary">{stats.following}</strong> Following</span>
                    <span><strong className="text-content-primary">{stats.followers}</strong> Followers</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-edge">
                <div className="flex-1 text-center py-3 font-semibold text-sm text-content-primary border-b-2 border-accent">
                    Posts · {userPosts.length}
                </div>
            </div>

            {/* Posts */}
            <div className="posts-feed pt-4">
                {userPosts.length === 0 ? (
                    <div className="text-center py-12 text-content-secondary">No posts yet</div>
                ) : (
                    userPosts.map((post) => (
                        <PostCard key={post.id} post={post} currentUserId={authUser?.id} onDelete={handleDelete} />
                    ))
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import './CommunityPage.css';

// Mock data to enrich community pages since we don't have a Communities table yet
const COMMUNITIES_DATA = {
    'javascript': {
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=javascript',
        description: 'The standard for scripting on the web. Discuss everything JavaScript, from standards to frameworks.',
        members: '2.4m',
        online: '4.2k',
        created: 'Jan 25, 2008',
        color: '#F7DF1E'
    },
    'reactjs': {
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=reactjs',
        description: 'A community for learning and developing web applications using React.',
        members: '360k',
        online: '1.1k',
        created: 'Jul 14, 2013',
        color: '#61DAFB'
    },
    'webdev': {
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=webdev',
        description: 'A community for web developers. Getting started? Check out our resources.',
        members: '1.2m',
        online: '3.5k',
        created: 'Jan 25, 2009',
        color: '#FF4500'
    },
    'programming': {
        icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=programming',
        description: 'Computer Programming. Threads, articles, and discussions.',
        members: '5.8m',
        online: '8.9k',
        created: 'Feb 28, 2006',
        color: '#0079D3'
    }
};

export default function CommunityPage() {
    const { communityName } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);

    // Get community details or use default
    const communityData = COMMUNITIES_DATA[communityName] || {
        icon: `https://api.dicebear.com/7.x/identicon/svg?seed=${communityName}`,
        description: `Welcome to r/${communityName}! Be the first to shape this community.`,
        members: '1',
        online: '1',
        created: 'Just now',
        color: '#0079D3'
    };

    useEffect(() => {
        loadCommunityPosts();
    }, [communityName]);

    const loadCommunityPosts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/posts?community=${communityName}`);
            setPosts(data.posts);
        } catch (error) {
            console.error('Failed to load community posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = () => {
        // Ideally pass community name to CreatePost page to pre-select it
        navigate('/create-post', { state: { communityName } });
    };

    return (
        <div className="community-page">
            {/* Banner */}
            <div className="community-banner" style={{ backgroundColor: communityData.color }}></div>

            {/* Header */}
            <div className="community-header">
                <div className="community-header-content">
                    <img src={communityData.icon} alt="" className="community-icon-large" />
                    <div className="community-title-section">
                        <div className="community-title-row">
                            <h1 className="community-title">{communityName}</h1>
                            <button
                                className={`btn-join ${joined ? 'joined' : ''}`}
                                onClick={() => setJoined(!joined)}
                            >
                                {joined ? 'Joined' : 'Join'}
                            </button>
                        </div>
                        <div className="community-subtext">r/{communityName}</div>
                    </div>
                </div>
            </div>

            <div className="community-container">
                {/* Main Content */}
                <div className="community-main">
                    <div className="feed-controls">
                        <button className="sort-btn active">🔥 Hot</button>
                        <button className="sort-btn">✨ New</button>
                        <button className="sort-btn">🔝 Top</button>
                    </div>

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#818384' }}>Loading posts...</div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUserId={user?.id}
                                onLikeChange={() => { }} // Pass actual handler if needed
                                onDelete={() => { }} // Pass actual handler
                            />
                        ))
                    ) : (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            backgroundColor: '#1A1D1F',
                            borderRadius: '4px',
                            border: '1px solid #343536'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👻</div>
                            <h3 style={{ color: '#D7DADC' }}>There are no posts here yet</h3>
                            <p style={{ color: '#818384', marginBottom: '20px' }}>Be the first to create a post in r/{communityName}</p>
                            <button onClick={handleCreatePost} className="btn-join">Create Post</button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="community-sidebar">
                    <div className="community-card">
                        <div className="card-header-bar">About Community</div>
                        <div className="card-content">
                            <p className="community-description">{communityData.description}</p>

                            <div className="community-stats">
                                <div className="stat-item">
                                    <span className="stat-count">{communityData.members}</span>
                                    <span className="stat-label">Members</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-count">{communityData.online}</span>
                                    <span className="stat-label">Online</span>
                                </div>
                            </div>

                            <div className="cake-day">
                                <span>📅</span> Created {communityData.created}
                            </div>

                            <button className="btn-create-post-sidebar" onClick={handleCreatePost}>Create Post</button>
                        </div>
                    </div>

                    <div className="community-card">
                        <div className="card-header-bar">r/{communityName} Rules</div>
                        <div className="card-content rules-list">
                            <div className="rule-item">1. Be respectful to others</div>
                            <div className="rule-item">2. No spam or self-promotion</div>
                            <div className="rule-item">3. Stay on topic</div>
                            <div className="rule-item" style={{ cursor: 'pointer', color: '#0079D3' }}>See more</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

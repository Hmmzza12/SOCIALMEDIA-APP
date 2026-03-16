import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './CreatePost.css';

export default function CreatePost() {
    const navigate = useNavigate();

    // Form Selection State
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('post'); // 'post', 'image', 'link'

    // Input State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    // Flags & Feedback
    const [tags, setTags] = useState({ oc: false, spoiler: false, nsfw: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dropdownRef = useRef(null);
    const titleRef = useRef(null);

    // Mock Community Data
    const communities = [
        { id: 1, name: 'javascript', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=javascript', members: '2.4m' },
        { id: 2, name: 'reactjs', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=reactjs', members: '360k' },
        { id: 3, name: 'webdev', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=webdev', members: '1.2m' },
        { id: 4, name: 'programming', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=programming', members: '5.8m' },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-focus title on mount
    useEffect(() => {
        if (titleRef.current) titleRef.current.focus();
    }, []);

    const toggleTag = (tag) => {
        setTags(prev => ({ ...prev, [tag]: !prev[tag] }));
    };

    const handleCommunitySelect = (comm) => {
        setSelectedCommunity(comm);
        setShowDropdown(false);
    };

    const insertMarkdown = (syntax) => {
        setContent(prev => prev + syntax);
    };

    const isFormValid = () => {
        if (!title.trim()) return false;
        if (!selectedCommunity) return false;
        if (activeTab === 'post' && !content.trim()) return true; // Body optional
        if (activeTab === 'image' && !imageUrl.trim()) return false;
        if (activeTab === 'link' && !linkUrl.trim()) return false;
        return true;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        setLoading(true);
        setError('');

        try {
            // Include community tag in title or as a separate field if backend supported it
            // For now, we'll prefix the title with [r/Name] if user wants, 
            // or just rely on the existing backend schema.

            // NOTE: Backend currently expects title, content, image_url.
            // We'll adapt the data to match that schema.

            const postData = {
                title: title,
                content: content, // For 'link' tab, we might want to append linkUrl to content
                image_url: activeTab === 'image' ? imageUrl : undefined
            };

            if (activeTab === 'link') {
                postData.content = `${content}\n\n[Link](${linkUrl})`;
            }

            // Mock backend call - passing username as community for now in this demo since we don't have separate community DB tables yet
            await api.post('/posts', {
                ...postData,
                community_name: selectedCommunity.name,
                community_icon: selectedCommunity.icon,
                // In a real app, we'd pass community_id: selectedCommunity.id
            });

            navigate('/');
        } catch (err) {
            setError('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-page">
            <div className="create-post-container">

                {/* LEFT SIDE: MAIN FORM */}
                <div className="cp-main">
                    <div className="cp-header">
                        <h2>Create a post</h2>
                        <button className="cp-drafts-btn">Drafts 0</button>
                    </div>

                    {error && <div className="error-toast">{error}</div>}

                    <div className="community-selector-wrapper" ref={dropdownRef}>
                        <button
                            className="community-selector-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {selectedCommunity ? (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={selectedCommunity.icon} alt="" className="selected-community-icon" />
                                    <span>r/{selectedCommunity.name}</span>
                                </div>
                            ) : (
                                <span><span className="circle-indicator"></span> Choose a community</span>
                            )}
                            <span>▼</span>
                        </button>

                        {showDropdown && (
                            <div className="community-dropdown">
                                <div className="dropdown-header">Your Communities</div>
                                {communities.map(comm => (
                                    <div
                                        key={comm.id}
                                        className="dropdown-item"
                                        onClick={() => handleCommunitySelect(comm)}
                                    >
                                        <img src={comm.icon} alt="" className="selected-community-icon" />
                                        <span>r/{comm.name}</span>
                                        <span style={{ marginLeft: 'auto', color: '#818384', fontSize: '12px' }}>{comm.members}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="post-form-card">
                        <div className="post-type-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`}
                                onClick={() => setActiveTab('post')}
                            >
                                <span>📄</span> Post
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
                                onClick={() => setActiveTab('image')}
                            >
                                <span>🖼️</span> Images & Video
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                                onClick={() => setActiveTab('link')}
                            >
                                <span>🔗</span> Link
                            </button>
                            <button className="tab-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                <span>📊</span> Poll
                            </button>
                        </div>

                        <div className="form-content">
                            <div className="input-wrapper">
                                <input
                                    ref={titleRef}
                                    type="text"
                                    className="post-title-input"
                                    placeholder="Title"
                                    maxLength={300}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <span className="char-counter">{title.length}/300</span>
                            </div>

                            {activeTab === 'post' && (
                                <div className="rich-text-editor">
                                    <div className="rte-toolbar">
                                        <button className="rte-btn" onClick={() => insertMarkdown('**bold** ')}><b>B</b></button>
                                        <button className="rte-btn" onClick={() => insertMarkdown('*italic* ')}><i>i</i></button>
                                        <button className="rte-btn" onClick={() => insertMarkdown('~~strike~~ ')}><strike>S</strike></button>
                                        <button className="rte-btn" onClick={() => insertMarkdown('`code` ')}><code>&lt;&gt;</code></button>
                                        <button className="rte-btn" onClick={() => insertMarkdown('# Heading ')}><b>T</b></button>
                                        <button className="rte-btn" onClick={() => insertMarkdown('> Quote ')}>❝</button>
                                    </div>
                                    <textarea
                                        className="post-body-textarea"
                                        placeholder="Body text (optional)"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {activeTab === 'image' && (
                                <div className="image-upload-area">
                                    <div className="input-wrapper">
                                        <input
                                            type="url"
                                            className="post-url-input"
                                            placeholder="Paste image URL here..."
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                    </div>
                                    {imageUrl && <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '4px' }} />}
                                </div>
                            )}

                            {activeTab === 'link' && (
                                <div className="input-wrapper">
                                    <input
                                        type="url"
                                        className="post-url-input"
                                        placeholder="Url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                    <textarea
                                        className="post-body-textarea"
                                        placeholder="Body text (optional)"
                                        style={{ marginTop: '10px', border: '1px solid var(--cp-border)', borderRadius: '4px', minHeight: '100px' }}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="form-footer">
                                <div className="tags-group">
                                    <button
                                        className={`tag-btn ${tags.oc ? 'active' : ''}`}
                                        onClick={() => toggleTag('oc')}
                                    >
                                        + OC
                                    </button>
                                    <button
                                        className={`tag-btn ${tags.spoiler ? 'active' : ''}`}
                                        onClick={() => toggleTag('spoiler')}
                                    >
                                        + Spoiler
                                    </button>
                                    <button
                                        className={`tag-btn ${tags.nsfw ? 'active' : ''}`}
                                        onClick={() => toggleTag('nsfw')}
                                    >
                                        + NSFW
                                    </button>
                                </div>

                                <div className="action-buttons">
                                    <button className="btn-draft">Save Draft</button>
                                    <button
                                        className="btn-post"
                                        disabled={!isFormValid() || loading}
                                        onClick={handleSubmit}
                                    >
                                        {loading ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: RULES SIDEBAR */}
                <div className="cp-sidebar">
                    {selectedCommunity ? (
                        <div className="sidebar-card">
                            <div className="sidebar-header">
                                <img src={selectedCommunity.icon} alt="" className="sidebar-icon" />
                                <div>
                                    <div style={{ fontWeight: '700' }}>Posting to r/{selectedCommunity.name}</div>
                                </div>
                            </div>
                            <div className="sidebar-rules">
                                <div className="rule-item">
                                    <span className="rule-number">1</span>
                                    <span className="rule-text">Remember the human</span>
                                </div>
                                <div className="rule-item">
                                    <span className="rule-number">2</span>
                                    <span className="rule-text">Behave like you would in real life</span>
                                </div>
                                <div className="rule-item">
                                    <span className="rule-number">3</span>
                                    <span className="rule-text">Look for the original source of content</span>
                                </div>
                                <div className="rule-item">
                                    <span className="rule-number">4</span>
                                    <span className="rule-text">Search for duplicates before posting</span>
                                </div>
                                <div className="rule-item" style={{ borderBottom: 'none' }}>
                                    <span className="rule-number">5</span>
                                    <span className="rule-text">Read the community's rules</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sidebar-card">
                            <div className="sidebar-header">
                                <div style={{ fontSize: '16px', fontWeight: '700' }}>Posting to Pulse</div>
                            </div>
                            <div className="rule-item" style={{ borderBottom: 'none' }}>
                                <span className="rule-text">1. Remember the human</span>
                            </div>
                            <div className="rule-item" style={{ borderBottom: 'none' }}>
                                <span className="rule-text">2. Behave like you would in real life</span>
                            </div>
                            <div className="rule-item" style={{ borderBottom: 'none' }}>
                                <span className="rule-text">3. Look for the original source of content</span>
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '12px', color: '#818384', marginTop: '10px' }}>
                        Please be mindful of reddit's <a href="#" style={{ color: '#0079D3' }}>content policy</a> and practice good <a href="#" style={{ color: '#0079D3' }}>reddiquette</a>.
                    </div>
                </div>

            </div>
        </div>
    );
}

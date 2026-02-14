import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            if (!title.trim() || !content.trim()) {
                throw new Error('Title and content are required');
            }

            await api.post('/posts', {
                title,
                content,
                image_url: imageUrl || undefined
            });

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '20px' }}>
                    ←
                </button>
                <h2 className="feed-title">Create Post</h2>
            </div>

            <div style={{ padding: '24px' }}>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's on your mind? (Title)"
                            className="input-field"
                            style={{ fontSize: '20px', fontWeight: 'bold', border: 'none', background: 'transparent', paddingLeft: 0 }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="textarea-field"
                            style={{ border: 'none', background: 'transparent', paddingLeft: 0, minHeight: '150px', fontSize: '18px' }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image" style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🖼️ Add Image URL
                        </label>
                        <input
                            type="url"
                            id="image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="input-field"
                            style={{ marginTop: '8px' }}
                        />
                    </div>

                    {imageUrl && (
                        <div style={{ marginTop: '16px', borderRadius: '16px', overflow: 'hidden' }}>
                            <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                        </div>
                    )}

                    <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: 'auto', padding: '0 32px' }}
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, Link2, BarChart3, ChevronDown, Upload, X } from 'lucide-react';
import { api, uploadImage } from '../utils/api';
import { useToast } from '../context/ToastContext';

const COMMUNITIES = [
    { id: 1, name: 'javascript', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=javascript', members: '2.4m' },
    { id: 2, name: 'reactjs', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=reactjs', members: '360k' },
    { id: 3, name: 'webdev', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=webdev', members: '1.2m' },
    { id: 4, name: 'programming', icon: 'https://api.dicebear.com/7.x/identicon/svg?seed=programming', members: '5.8m' },
];

export default function CreatePost() {
    const navigate = useNavigate();
    const toast = useToast();

    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('post');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [tags, setTags] = useState({ oc: false, spoiler: false, nsfw: false });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const dropdownRef = useRef(null);
    const titleRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => { titleRef.current?.focus(); }, []);

    const toggleTag = (tag) => setTags((prev) => ({ ...prev, [tag]: !prev[tag] }));
    const insertMarkdown = (syntax) => setContent((prev) => prev + syntax);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const { url } = await uploadImage(file);
            setImageUrl(url);
            toast.success('Image uploaded');
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const isFormValid = () => {
        if (!title.trim() || !selectedCommunity) return false;
        if (activeTab === 'post' && !content.trim()) return false;
        if (activeTab === 'image' && !imageUrl.trim()) return false;
        if (activeTab === 'link' && !linkUrl.trim()) return false;
        return true;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;
        setLoading(true);
        try {
            const postData = {
                title,
                content,
                image_url: activeTab === 'image' ? imageUrl : undefined,
            };
            if (activeTab === 'link') postData.content = `${content}\n\n[Link](${linkUrl})`;

            await api.post('/posts', {
                ...postData,
                community_name: selectedCommunity.name,
                community_icon: selectedCommunity.icon,
            });
            toast.success('Post published!');
            navigate('/');
        } catch (err) {
            toast.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const TabBtn = ({ id, icon: Icon, label, disabled }) => (
        <button
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 ${disabled ? 'opacity-40 cursor-not-allowed border-transparent text-content-muted' :
                activeTab === id ? 'border-accent text-accent' : 'border-transparent text-content-muted hover:text-content-secondary'
                }`}
        >
            <Icon size={16} /> {label}
        </button>
    );

    const inputCls = 'w-full bg-base border border-edge rounded-lg px-4 py-3 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-accent transition-colors';

    const rteBtns = [['B', '**bold** '], ['i', '*italic* '], ['S', '~~strike~~ '], ['<>', '`code` '], ['H', '# Heading '], ['"', '> Quote ']];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 mt-2">
            {/* Main form */}
            <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-edge">
                    <h1 className="font-display text-xl font-bold text-content-primary">Create a post</h1>
                    <button className="text-sm text-content-secondary bg-surface border border-edge rounded-full px-3 py-1 hover:bg-hover transition-all">Drafts 0</button>
                </div>

                {/* Community selector */}
                <div className="relative mb-4" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center justify-between w-full max-w-xs bg-surface border border-edge rounded-full px-3 py-2 text-sm font-semibold text-content-primary hover:bg-hover transition-all"
                    >
                        {selectedCommunity ? (
                            <span className="flex items-center gap-2">
                                <img src={selectedCommunity.icon} alt="" className="w-5 h-5 rounded-full" />
                                r/{selectedCommunity.name}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-content-secondary">
                                <span className="w-5 h-5 rounded-full bg-hover inline-block" /> Choose a community
                            </span>
                        )}
                        <ChevronDown size={16} className="text-content-muted" />
                    </button>

                    {showDropdown && (
                        <div className="absolute z-20 mt-1 w-full max-w-xs bg-elevated border border-edge rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-content-muted">Your Communities</div>
                            {COMMUNITIES.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCommunity(c); setShowDropdown(false); }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-content-primary hover:bg-hover transition-colors"
                                >
                                    <img src={c.icon} alt="" className="w-6 h-6 rounded-full" />
                                    <span>r/{c.name}</span>
                                    <span className="ml-auto text-xs text-content-muted">{c.members}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form card */}
                <div className="bg-surface border border-edge rounded-xl overflow-hidden">
                    <div className="flex border-b border-edge">
                        <TabBtn id="post" icon={FileText} label="Post" />
                        <TabBtn id="image" icon={ImageIcon} label="Images" />
                        <TabBtn id="link" icon={Link2} label="Link" />
                        <TabBtn id="poll" icon={BarChart3} label="Poll" disabled />
                    </div>

                    <div className="p-5">
                        {/* Title */}
                        <div className="relative mb-4">
                            <input
                                ref={titleRef}
                                type="text"
                                maxLength={300}
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`${inputCls} pr-16`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-muted">{title.length}/300</span>
                        </div>

                        {activeTab === 'post' && (
                            <div className="border border-edge rounded-lg overflow-hidden">
                                <div className="flex items-center gap-1 px-2 py-1.5 border-b border-edge bg-base">
                                    {rteBtns.map(([label, syntax]) => (
                                        <button key={label} onClick={() => insertMarkdown(syntax)} className="w-8 h-8 rounded text-content-secondary hover:bg-hover hover:text-content-primary text-sm transition-all">
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Body text (optional)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-base px-4 py-3 text-sm text-content-primary placeholder:text-content-muted focus:outline-none resize-none min-h-[160px]"
                                />
                            </div>
                        )}

                        {activeTab === 'image' && (
                            <div>
                                {imageUrl ? (
                                    <div className="relative">
                                        <img src={imageUrl} alt="Preview" className="w-full max-h-[360px] object-contain rounded-lg border border-edge bg-base" />
                                        <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-base/80 border border-edge text-content-primary flex items-center justify-center hover:bg-hover">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="flex flex-col items-center justify-center gap-2 w-full h-40 border-2 border-dashed border-edge rounded-lg text-content-secondary hover:border-accent hover:text-accent transition-all"
                                    >
                                        <Upload size={26} />
                                        <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload an image'}</span>
                                        <span className="text-xs text-content-muted">PNG, JPG, GIF, WEBP - up to 5MB</span>
                                    </button>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                <div className="flex items-center gap-2 my-3">
                                    <div className="flex-1 h-px bg-edge" />
                                    <span className="text-xs text-content-muted">or paste a URL</span>
                                    <div className="flex-1 h-px bg-edge" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://image-url.com/photo.png"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                        )}

                        {activeTab === 'link' && (
                            <div className="flex flex-col gap-3">
                                <input
                                    type="url"
                                    placeholder="URL"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className={inputCls}
                                />
                                <textarea
                                    placeholder="Body text (optional)"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className={`${inputCls} resize-none min-h-[100px]`}
                                />
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-edge">
                            <div className="flex gap-2">
                                {['oc', 'spoiler', 'nsfw'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => toggleTag(t)}
                                        className={`text-xs px-3 py-1 rounded-full border transition-all ${tags[t] ? 'bg-accent/15 border-accent text-accent' : 'border-edge text-content-secondary hover:border-accent hover:text-accent'}`}
                                    >
                                        + {t.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button className="text-sm font-semibold px-4 h-9 rounded-full text-content-secondary hover:bg-hover transition-all">Save Draft</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isFormValid() || loading}
                                    className="text-sm font-semibold px-6 py-2 rounded-full bg-accent text-white hover:bg-accent-active disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar rules */}
            <aside className="hidden lg:block">
                <div className="bg-base border border-edge rounded-xl p-4 sticky top-[68px]">
                    <div className="font-display font-bold text-content-primary mb-3">
                        {selectedCommunity ? `Posting to r/${selectedCommunity.name}` : 'Posting to Pulse'}
                    </div>
                    <ol className="flex flex-col text-sm text-content-secondary">
                        {['Remember the human', 'Behave like you would in real life', 'Look for the original source of content', 'Search for duplicates before posting', "Read the community's rules"].map((rule, i) => (
                            <li key={i} className="py-2 border-b border-edge last:border-0 list-decimal list-inside">{rule}</li>
                        ))}
                    </ol>
                </div>
            </aside>
        </div>
    );
}

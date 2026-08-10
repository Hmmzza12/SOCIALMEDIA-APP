import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Plus, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import NotificationBell from './NotificationBell';

export default function GlobalHeader() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState({ users: [], posts: [], communities: [] });
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length > 0) {
            setShowSearchDropdown(true);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => performSearch(query), 300);
        } else {
            setShowSearchDropdown(false);
        }
    };

    const performSearch = async (query) => {
        try {
            const usersRes = await api.get('/users');
            const postsRes = await api.get('/posts');
            const q = query.toLowerCase();
            const filteredUsers = (usersRes.users || []).filter(u => u.username.toLowerCase().includes(q)).slice(0, 3);
            const filteredPosts = (postsRes.posts || []).filter(p => p.title.toLowerCase().includes(q)).slice(0, 3);
            const filteredCommunities = (usersRes.users || []).filter(u => u.username.toLowerCase().includes(q)).slice(0, 3);
            setSearchResults({ users: filteredUsers, posts: filteredPosts, communities: filteredCommunities });
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleResultClick = (path) => {
        setShowSearchDropdown(false);
        setSearchQuery('');
        navigate(path);
    };

    const iconBtn = 'flex items-center justify-center w-9 h-9 rounded-full text-content-secondary hover:bg-hover hover:text-content-primary transition-all duration-150';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-[52px] bg-base border-b border-edge flex items-center justify-between px-4 gap-4">
            {/* Left: brand */}
            <div className="flex items-center w-[220px] shrink-0">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="inline-block w-3 h-3 rotate-45 rounded-[2px] bg-accent group-hover:bg-accent-hover transition-colors duration-150" />
                    <span className="font-display text-xl font-bold tracking-tight text-content-primary">Pulse</span>
                </Link>
            </div>

            {/* Center: search */}
            <div className="flex-1 max-w-[480px] relative" ref={searchRef}>
                <div className="relative flex items-center">
                    <Search size={18} className="absolute left-4 text-content-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search Pulse"
                        className="w-full h-9 rounded-full bg-surface border border-edge pl-11 pr-4 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-150"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
                    />
                </div>

                {showSearchDropdown && (
                    <div className="search-dropdown absolute top-[calc(100%+8px)] left-0 right-0 bg-elevated border border-edge rounded-xl overflow-hidden shadow-2xl z-[101] max-h-[400px] overflow-y-auto">
                        {searchResults.communities.length > 0 && (
                            <div className="py-1 border-b border-edge">
                                <h4 className="px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-content-muted">Communities</h4>
                                {searchResults.communities.map(comm => (
                                    <div key={`comm-${comm.id}`} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-hover transition-colors" onClick={() => handleResultClick(`/r/${comm.username}`)}>
                                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">r/</div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-content-primary">r/{comm.username}</span>
                                            <span className="text-xs text-content-muted">Community</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.users.length > 0 && (
                            <div className="py-1 border-b border-edge last:border-b-0">
                                <h4 className="px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-content-muted">People</h4>
                                {searchResults.users.map(u => (
                                    <div key={`user-${u.id}`} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-hover transition-colors" onClick={() => handleResultClick(`/user/${u.id}`)}>
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface">
                                            <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-content-primary">u/{u.username}</span>
                                            <span className="text-xs text-content-muted">User</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.posts.length === 0 && searchResults.users.length === 0 && searchResults.communities.length === 0 && (
                            <div className="px-4 py-6 text-center text-sm text-content-muted">No results found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 justify-end shrink-0">
                <button className={iconBtn} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className={iconBtn} title="Messages" onClick={() => navigate('/chat')}>
                    <MessageSquare size={20} />
                </button>
                <button className={`${iconBtn} hover:text-accent`} title="Create Post" onClick={() => navigate('/create')}>
                    <Plus size={22} />
                </button>
                <NotificationBell />

                <button className="flex items-center gap-2 ml-1 pl-1 pr-2 py-1 rounded-full hover:bg-hover transition-all duration-150" onClick={() => navigate('/profile')}>
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-accent ring-offset-2 ring-offset-base">
                        <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt={user?.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                        <span className="text-[13px] font-semibold text-content-primary">{user?.username}</span>
                        <span className="text-[11px] text-content-muted">1 karma</span>
                    </div>
                    <ChevronDown size={14} className="hidden lg:block text-content-muted" />
                </button>
            </div>
        </header>
    );
}

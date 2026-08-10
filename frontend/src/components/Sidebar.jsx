import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Bookmark, User, PlusCircle, ChevronDown,
    Code2, Gamepad2, Coins, Tv, Info, HelpCircle,
} from 'lucide-react';

const RECENT = [
    { name: 'reactjs', color: '#0ea5e9' },
    { name: 'javascript', color: '#eab308' },
    { name: 'webdev', color: '#8b5cf6' },
];

const TOPICS = [
    { name: 'programming', label: 'Programming', icon: Code2, color: '#6366f1' },
    { name: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#22c55e' },
    { name: 'crypto', label: 'Crypto', icon: Coins, color: '#f59e0b' },
    { name: 'television', label: 'Television', icon: Tv, color: '#ec4899' },
];

export default function Sidebar() {
    const location = useLocation();
    const [sections, setSections] = useState({ recent: true, topics: true, resources: true });
    const toggle = (s) => setSections((prev) => ({ ...prev, [s]: !prev[s] }));
    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                    ? 'bg-[rgb(var(--c-elevated))] text-accent border-l-2 border-accent'
                    : 'border-l-2 border-transparent text-content-secondary hover:bg-[rgb(var(--c-elevated))] hover:text-content-primary'
                    }`}
            >
                <Icon size={20} className={active ? 'text-accent' : ''} />
                <span>{label}</span>
            </Link>
        );
    };

    const SectionHeader = ({ id, label }) => (
        <button
            onClick={() => toggle(id)}
            className="flex items-center justify-between w-full px-4 mt-5 pb-1.5 mb-1 border-b border-edge text-[10px] font-semibold uppercase tracking-widest text-content-muted hover:text-content-secondary transition-colors"
        >
            <span>{label}</span>
            <ChevronDown size={14} className={`transition-transform duration-150 ${sections[id] ? '' : '-rotate-90'}`} />
        </button>
    );

    return (
        <aside className="hidden md:flex flex-col fixed left-0 top-[52px] w-[240px] h-[calc(100vh-52px)] overflow-y-auto bg-base border-r border-edge pt-4 z-40">
            <NavItem to="/" icon={Home} label="Home" />
            <NavItem to="/saved" icon={Bookmark} label="Saved" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/create" icon={PlusCircle} label="Create Post" />

            <div className="my-2 mx-4 h-px bg-edge" />

            <SectionHeader id="recent" label="Recent" />
            {sections.recent && (
                <div className="flex flex-col">
                    {RECENT.map((r) => (
                        <Link
                            key={r.name}
                            to={`/r/${r.name}`}
                            className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-sm text-content-secondary hover:bg-[rgb(var(--c-elevated))] hover:text-content-primary transition-all duration-150"
                        >
                            <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ background: r.color }}
                            >
                                {r.name[0].toUpperCase()}
                            </span>
                            <span>r/{r.name}</span>
                        </Link>
                    ))}
                </div>
            )}

            <div className="my-2 mx-4 h-px bg-edge" />

            <SectionHeader id="topics" label="Topics" />
            {sections.topics && (
                <div className="flex flex-col">
                    {TOPICS.map((t) => (
                        <Link
                            key={t.name}
                            to={`/r/${t.name}`}
                            className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-sm text-content-secondary hover:bg-[rgb(var(--c-elevated))] hover:text-content-primary transition-all duration-150"
                        >
                            <span
                                className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                                style={{ background: t.color }}
                            >
                                <t.icon size={13} />
                            </span>
                            <span>{t.label}</span>
                        </Link>
                    ))}
                </div>
            )}

            <div className="my-2 mx-4 h-px bg-edge" />

            <SectionHeader id="resources" label="Resources" />
            {sections.resources && (
                <div className="flex flex-col">
                    <Link to="/about" className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-sm text-content-secondary hover:bg-[rgb(var(--c-elevated))] hover:text-content-primary transition-all duration-150">
                        <Info size={18} /> <span>About</span>
                    </Link>
                    <Link to="/help" className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-sm text-content-secondary hover:bg-[rgb(var(--c-elevated))] hover:text-content-primary transition-all duration-150">
                        <HelpCircle size={18} /> <span>Help</span>
                    </Link>
                </div>
            )}
        </aside>
    );
}

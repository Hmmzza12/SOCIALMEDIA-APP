import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, PlusCircle, User } from 'lucide-react';

const tabs = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/create', icon: PlusCircle, label: 'Create' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function MobileTabBar() {
    const location = useLocation();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base border-t border-edge flex items-center justify-around h-14">
            {tabs.map(({ to, icon: Icon, label }) => {
                const active = location.pathname === to;
                return (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-medium transition-colors ${active ? 'text-accent' : 'text-content-muted'}`}
                    >
                        <Icon size={22} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

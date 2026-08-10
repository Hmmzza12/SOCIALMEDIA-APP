import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import pulseLogo from '../assets/pulse_logo.svg';

export default function LeftNavigation() {
    const navigate = useNavigate();

    return (
        <div className="w-[72px] h-full bg-base border-r border-edge flex flex-col items-center py-4 gap-6">
            <img
                src={pulseLogo}
                alt="Pulse"
                width={32}
                height={32}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
            />
            <button
                onClick={() => navigate('/')}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-hover transition-all duration-150 w-14"
                title="Back to feed"
            >
                <Home size={22} />
                <span className="text-[11px] font-medium">Home</span>
            </button>
        </div>
    );
}

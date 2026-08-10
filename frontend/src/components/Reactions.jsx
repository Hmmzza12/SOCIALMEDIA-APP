import { useState, useEffect, useRef } from 'react';
import { SmilePlus } from 'lucide-react';
import { api } from '../utils/api';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '😮'];

export default function Reactions({ postId }) {
    const [reactions, setReactions] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [busy, setBusy] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        let active = true;
        api.getReactions(postId)
            .then((data) => { if (active) setReactions(data.reactions || []); })
            .catch(() => { });
        return () => { active = false; };
    }, [postId]);

    useEffect(() => {
        const onClick = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const toggle = async (emoji, e) => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        setShowPicker(false);
        try {
            const data = await api.reactToPost(postId, emoji);
            setReactions(data.reactions || []);
        } catch (err) {
            // ignore
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
            {reactions.map((r) => (
                <button
                    key={r.emoji}
                    onClick={(e) => toggle(r.emoji, e)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-110 ${r.reacted
                        ? 'bg-accent/15 border-accent/50 text-content-primary'
                        : 'bg-hover border-edge text-content-secondary hover:border-accent/40'
                        }`}
                >
                    <span className="text-sm leading-none">{r.emoji}</span>
                    <span className="tabular-nums">{r.count}</span>
                </button>
            ))}

            <div className="relative" ref={pickerRef}>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowPicker((s) => !s); }}
                    title="Add reaction"
                    className="flex items-center justify-center w-7 h-7 rounded-full text-content-muted hover:text-accent hover:bg-hover transition-all duration-150"
                >
                    <SmilePlus size={16} />
                </button>

                {showPicker && (
                    <div className="absolute bottom-[calc(100%+6px)] left-0 z-20 flex items-center gap-1 p-1.5 rounded-full bg-elevated border border-edge shadow-2xl search-dropdown">
                        {EMOJIS.map((emoji) => {
                            const active = reactions.find((r) => r.emoji === emoji)?.reacted;
                            return (
                                <button
                                    key={emoji}
                                    onClick={(e) => toggle(emoji, e)}
                                    className={`w-8 h-8 rounded-full text-lg leading-none flex items-center justify-center transition-transform duration-150 hover:scale-125 ${active ? 'bg-accent/20' : 'hover:bg-hover'}`}
                                >
                                    {emoji}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

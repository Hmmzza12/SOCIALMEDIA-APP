import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
    { q: 'How do I create a post?', a: 'Click “Create Post” in the sidebar or the + button in the header, choose a community, add a title and body (or an image), then hit Post.' },
    { q: 'How do reactions and upvotes work?', a: 'Use the ▲ / ▼ arrows on the left of a post to vote. Below each post you can also add emoji reactions with the smiley button.' },
    { q: 'How do I save a post?', a: 'Click “Save” on any post. Saved posts appear on your Saved page in the sidebar.' },
    { q: 'What is the Following feed?', a: 'On Home, switch to the “Following” tab to see posts only from people you follow.' },
    { q: 'How do @mentions work?', a: 'Type @username in a comment. That person gets a notification linking back to the post.' },
    { q: 'How do I switch between light and dark mode?', a: 'Use the sun / moon toggle in the top-right of the header. Your choice is remembered.' },
];

export default function Help() {
    const [open, setOpen] = useState(0);

    return (
        <div className="max-w-2xl mx-auto py-2">
            <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="text-accent" size={26} />
                <h1 className="font-display text-3xl font-bold text-content-primary">Help & FAQ</h1>
            </div>
            <p className="text-content-secondary mb-8">Everything you need to get the most out of Pulse.</p>

            <div className="flex flex-col gap-2">
                {FAQS.map((f, i) => (
                    <div key={i} className="bg-surface border border-edge rounded-xl overflow-hidden">
                        <button
                            onClick={() => setOpen(open === i ? -1 : i)}
                            className="flex items-center justify-between w-full px-4 py-3 text-left text-content-primary font-semibold text-sm hover:bg-hover transition-colors"
                        >
                            {f.q}
                            <ChevronDown size={18} className={`text-content-muted transition-transform duration-150 shrink-0 ${open === i ? 'rotate-180' : ''}`} />
                        </button>
                        {open === i && (
                            <p className="px-4 pb-4 text-content-secondary text-sm leading-relaxed">{f.a}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

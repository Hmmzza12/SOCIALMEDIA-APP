import './Footer.css';

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <p>&copy; 2026 Pulse, Inc.</p>
                <div className="footer-links">
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/content-policy">Content Policy</a>
                </div>
            </div>
        </footer>
    );
}

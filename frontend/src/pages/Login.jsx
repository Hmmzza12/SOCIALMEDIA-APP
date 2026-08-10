import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pulseLogo from '../assets/pulse_logo.svg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-box">
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <img src={pulseLogo} alt="Pulse" width="56" height="56" className="auth-logo" />
                    <h1 className="auth-title" style={{ fontSize: '30px', fontWeight: '800', margin: '16px 0 8px' }}>
                        Welcome back to <span className="brand-gradient">Pulse</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to dive back into the conversation.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <div className="error-message" style={{ color: 'var(--error)', padding: '12px', background: 'rgba(244, 33, 46, 0.1)', borderRadius: '4px' }}>{error}</div>}

                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-field"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/signup" className="text-link">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

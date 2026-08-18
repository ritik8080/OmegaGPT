import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OmegaLogo from './OmegaLogo';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    
    const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/login' : '/register';
        const body = isLogin ? { email, password } : { username, email, password };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            login(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <OmegaLogo size={60} />
                    <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                    <p>OmegaGPT is ready to assist you</p>
                </div>
                
                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required={!isLogin}
                                placeholder="Enter your username"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
                    </button>
                </form>

                <div className="oauth-divider">
                    <span>or continue with</span>
                </div>

                <div className="oauth-buttons">
                    <button className="oauth-btn" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`} title="Continue with Google">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="24" height="24" />
                    </button>
                    <button className="oauth-btn" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`} title="Continue with GitHub">
                        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="24" height="24" />
                    </button>
                    <button className="oauth-btn" onClick={() => window.location.href = window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/linkedin`} title="Continue with LinkedIn">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" width="24" height="24" />
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button type="button" className="auth-toggle-btn" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;

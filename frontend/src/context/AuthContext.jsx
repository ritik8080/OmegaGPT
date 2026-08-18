import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('omegagpt_token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('omegagpt_token', token);
            // Optionally, decode token or fetch user profile here
            // For now we just check if token exists to log them in
            setUser({ token });
        } else {
            localStorage.removeItem('omegagpt_token');
            setUser(null);
        }
    }, [token]);

    const login = (userData) => {
        setToken(userData.token);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

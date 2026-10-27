import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function getStoredUser() {
    const storedUser = localStorage.getItem('pyrobet_user');

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem('pyrobet_user');
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        return localStorage.getItem('pyrobet_token');
    });

    const [user, setUser] = useState(getStoredUser);

    function setSession(session) {
        localStorage.setItem('pyrobet_token', session.token);
        localStorage.setItem('pyrobet_user', JSON.stringify(session.user));

        setToken(session.token);
        setUser(session.user);
    }

    function logout() {
        localStorage.removeItem('pyrobet_token');
        localStorage.removeItem('pyrobet_user');

        setToken(null);
        setUser(null);
    }

    const value = {
        token,
        user,
        role: user?.role ?? null,
        isAuthenticated: Boolean(token && user),
        setSession,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
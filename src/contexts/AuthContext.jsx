import { createContext, useContext, useEffect, useRef, useState } from "react";

import { login as loginRequest, register as registerRequest } from '../services/authService';

import { getCurrentUser } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    //Estado 1: guarda o objeto do usuario (id, nome...)
    const [user, setUser] = useState(null);

    // Estado 2: indica se a sessão ainda está sendo verificada
    const [loading, setLoading] = useState(Boolean(localStorage.getItem('nexo_token')));

    //Referência do controle de sessão, evita que uma resposta antiga sobrescreva um estado mais novo
    const sessionVersion = useRef(0);

    const clearSession = () => {
        sessionVersion.current += 1;
        localStorage.removeItem('nexo_token');
        localStorage.removeItem('nexo_user');
        setUser(null);
    };

    const refreshUser = async (
        token = localStorage.getItem('nexo_token'),
        version = sessionVersion.current,
    ) => {
        if (!token) throw new Error('Não há uma sessão ativa');
        const current = await getCurrentUser(token);
        if (version === sessionVersion.current) {
            setUser(current);
            localStorage.setItem('nexo_user', JSON.stringify(current));
        }
        return current;
    };

    // Ao montar, tenta restaurar a sessão a partir do token salvo
    useEffect(() => {
        const token = localStorage.getItem('nexo_token');
        if (token && localStorage.getItem('nexo_user')) {
            refreshUser(token).catch(clearSession).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }

        window.addEventListener('session-expired', clearSession);
        return () => {
            window.removeEventListener('session-expired', clearSession);
        };
    }, []);

    // Recebe o form vindo do AuthPages e o envia como credentials para o AuthService
    const signIn = async (credentials) => {
        clearSession();
        const version = sessionVersion.current;

        const token = await loginRequest(credentials);

        if (!token) throw new Error('Falha ao realizar login');

        if (version !== sessionVersion.current) throw new Error('Sessão expirada');

        const normalizedToken = token.replace('Bearer ', '');
        localStorage.setItem('nexo_token', normalizedToken);
        try {
            return await refreshUser(normalizedToken, version);
        } catch (error) {
            if (version === sessionVersion.current) {
                throw error;
            }
        }
    };

    const signUp = async (userData) => {
        return registerRequest(userData);
    };

    const logout = () => {
        clearSession();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),
                signIn,
                signUp,
                logout,
                refreshUser,
                clearSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

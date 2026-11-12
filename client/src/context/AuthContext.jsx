import { createContext, useContext, useEffect, useState } from "react";
import {
    getMe,
    loginUser,
    logoutAllDevices,
    logoutUser,
    refreshAccessToken,
    registerUser,
    verifyEmail as verifyEmailApi,
} from "../api/authApi";

const AuthContext = createContext(null);

// Shared in-flight promise prevents React StrictMode's double-mount in dev
// from sending two concurrent /refresh-token calls and tripping token rotation.
let restoreSessionPromise = null;

function restoreSessionOnce() {
    if (!restoreSessionPromise) {
        restoreSessionPromise = (async () => {
            try {
                const { accessToken } = await refreshAccessToken();
                const { user } = await getMe(accessToken);
                return { accessToken, user };
            } catch {
                return null;
            } finally {
                restoreSessionPromise = null;
            }
        })();
    }
    return restoreSessionPromise;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function initAuth() {
            const session = await restoreSessionOnce();
            if (!cancelled) {
                setAccessToken(session?.accessToken ?? null);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        }

        initAuth();
        return () => {
            cancelled = true;
        };
    }, []);

    async function register(credentials) {
        return registerUser(credentials);
    }

    async function verifyEmail(payload) {
        return verifyEmailApi(payload);
    }

    async function login(credentials) {
        const data = await loginUser(credentials);
        setAccessToken(data.accessToken);
        setUser(data.user);
        return data;
    }

    async function logout() {
        try {
            await logoutUser();
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    }

    async function logoutAll() {
        try {
            await logoutAllDevices();
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                loading,
                isAuthenticated: Boolean(user && accessToken),
                register,
                verifyEmail,
                login,
                logout,
                logoutAll,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
}
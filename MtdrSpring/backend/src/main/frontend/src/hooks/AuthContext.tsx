/**
 * provides authentication state to app
 * handles two-step Oracle sign-in flow:
 1. Email, password  →  receives 2FA challenge token from backend
 2. 2FA code          →  receives session cookie and user object
 */

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode, useEffect,
} from 'react'
import {authAPI} from '../API.ts'
import {mockAuthAPI} from '../mocks'
import type {User, UserRole} from '../types.ts'

// Use mock API if VITE_USE_MOCKS=true
const API = import.meta.env.VITE_USE_MOCKS ? mockAuthAPI : authAPI

// context shape
interface AuthContextValue {
    user: User | null
    loading: boolean
    error: string | null
    loadUser: (token: string) => Promise<void>;
    signOut: () => Promise<void>
    // RBAC helpers
    isAdmin: boolean
    isManager: boolean   // true for both ADMIN / MANAGER roles
    isDeveloper: boolean
    hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadUser = useCallback(async (token: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await authAPI.getMe(token);
            setUser(res.data);
            setLoading(false); // Success, stop loading and show app
        } catch (err: any) {
            // If the token is specifically expired or invalid
            if (err.response?.status === 401) {
                console.warn("JWT Expired. Triggering silent OCI refresh...");

                // Redirect immediately.
                // We do NOT set loading(false) so the ProtectedRoute
                // keeps showing the spinner until the browser leaves.
                handleExpiredSession();
            } else {
                // It's a different error (Server 500, Network error, etc.)
                console.error("User load failed:", err);
                setUser(null);
                setError("Session lost. Please log in again.");
                setLoading(false);
            }
        }
    }, []);

    const handleExpiredSession = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/oci";
    };

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('auth_token');

            // 1. If no token exists, we aren't logged in.
            if (!savedToken) {
                setLoading(false);
                return;
            }

            // 2. If we have a token but no user object yet, fetch it.
            // We check !user to prevent re-fetching if the data is already there.
            if (!user) {
                await loadUser(savedToken);
            } else {
                setLoading(false);
            }
        };

        initAuth();
        // Dependency array: loadUser is memoized with useCallback,
        // so this only runs once on mount.
    }, [loadUser, user]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            localStorage.removeItem('auth_token')
            setUser(null)
        } finally {
            window.location.href = "http://localhost:8080/logout";
        }
    }, [])

    const hasRole = useCallback(
        (role: UserRole): boolean => user?.role === role,
        [user],
    )

    const value: AuthContextValue = {
        user,
        loading,
        error,
        loadUser,
        signOut: logout,
        isAdmin: user?.role === 'ADMIN',
        isManager: user?.role === 'ADMIN' || user?.role === 'MANAGER',
        isDeveloper: user?.role === 'DEVELOPER',
        hasRole,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/*
* hook to throw if used outside AuthProvider
*/
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
    return ctx
}
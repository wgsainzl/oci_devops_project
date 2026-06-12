import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
    useEffect,
} from "react";
import {authAPI} from "../API.ts";
import type {User, UserRole} from "../types.ts";
import {API_URLS} from "../constants.ts";

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    error: string | null;
    loadUser: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    isManager: boolean;
    isDeveloper: boolean;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const loadUser = useCallback(async (token: string) => {
        setLoading(true);
        setError(null);

        // Max 2 attempts for handling rate limits (429)
        for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
                const res = await authAPI.getMe(token);
                setUser(res.data);
                setLoading(false);
                return;
            } catch (err: any) {
                const status = err?.response?.status;

                // 401 Unauthorized / Expired
                if (status === 401) {
                    console.warn("JWT Expired. Triggering OCI refresh...");
                    localStorage.removeItem("auth_token");
                    setUser(null);
                    window.location.href = API_URLS.AUTH_OCI;
                    return;
                }

                // 429 Too Many Requests (Retry Logic)
                if (status === 429 && attempt === 0) {
                    const retryAfterSeconds = Number(err?.response?.headers?.["retry-after"]);
                    const waitMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                        ? retryAfterSeconds * 1000
                        : 1500;
                    await sleep(waitMs);
                    continue;
                }

                // Generic fallback for 500s, 404s, Network Errors
                console.error("User load failed:", err);
                localStorage.removeItem("auth_token"); // Clean up bad token
                setUser(null);
                setError(
                    status === 429
                        ? "Too many requests right now. Please wait a moment and refresh."
                        : "Session lost or invalid. Please log in again."
                );
                setLoading(false);
                return;
            }
        }

        // Fallback if loop finishes without returning
        setUser(null);
        setError("Unable to load user session.");
        setLoading(false);
    }, []);

    // Initialize auth state on page load/refresh
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            // 1. CHECK: If there is a token in the URL, DO NOT auto-initialize.
            // Let OAuth2RedirectHandler handle saving and loading it first.
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('token')) {
                if (isMounted) setLoading(false);
                return;
            }

            const savedToken = localStorage.getItem("auth_token");

            if (!savedToken) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (!user) {
                    await loadUser(savedToken);
                }
            } catch (e) {
                console.error("Initialization auth error", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, [loadUser]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            localStorage.removeItem("auth_token");
            setUser(null);
        } finally {
            window.location.href = API_URLS.LOGOUT;
        }
    }, []);

    const hasRole = useCallback(
        (role: UserRole): boolean => user?.role === role,
        [user],
    );

    const value: AuthContextValue = {
        user,
        loading,
        error,
        loadUser,
        signOut: logout,
        isAdmin: user?.role === "ADMIN",
        isManager: user?.role === "ADMIN" || user?.role === "MANAGER",
        isDeveloper: user?.role === "DEVELOPER",
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/AuthContext.tsx";
import {useEffect, useRef} from "react";

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const {loadUser} = useAuth();
    const hasProcessed = useRef(false); // Prevents duplicate execution loops

    useEffect(() => {
        // Guard clause to prevent double-firing in React 18 Strict Mode
        if (hasProcessed.current) return;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            hasProcessed.current = true;

            // 1. Save token
            localStorage.setItem('auth_token', token);

            // 2. Load user data into context
            loadUser(token)
                .then(() => {
                    // 3. Success: Redirect to home dashboard
                    navigate('/home', {replace: true});
                })
                .catch((err) => {
                    console.error("OAuth redirect tracking failed:", err);
                    navigate('/login', {replace: true});
                });
        } else {
            // No token found in URL, kick back to login
            navigate('/login', {replace: true});
        }
    }, [location.search, navigate, loadUser]);

    return (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '100px'}}>
            <h2>Completing Login...</h2>
        </div>
    );
}
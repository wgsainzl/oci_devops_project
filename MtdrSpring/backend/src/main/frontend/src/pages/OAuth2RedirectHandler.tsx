import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/AuthContext.tsx";
import {useEffect} from "react";

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const {loadUser} = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // 1. Save token
            localStorage.setItem('auth_token', token);

            // 2. Load user data into the context
            loadUser(token).then(() => {
                // 3. Go home
                navigate('/home', {replace: true});
            });
        } else {
            navigate('/login', {replace: true});
        }
    }, [location, navigate, loadUser]);

    return (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '100px'}}>
            <h2>Completing Login...</h2>
        </div>
    );
}
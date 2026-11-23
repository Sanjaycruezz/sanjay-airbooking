
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

function ProtectedRoute({ children, adminOnly = false }) {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get('accounts/me/');

                setIsAuthenticated(true);
                setIsAdmin(response.data.role === 'admin');
            } catch (error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    if (loading) {
        return <div className="container mt-5">Checking access...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/flights" replace />;
    }

    return children;
}

export default ProtectedRoute;

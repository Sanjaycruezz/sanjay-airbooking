
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState('');

    const isLoggedIn = Boolean(localStorage.getItem('access_token'));

    useEffect(() => {
        if (!isLoggedIn) {
            setRole('');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await api.get('accounts/me/');
                setRole(response.data.role);
            } catch (error) {
                console.error('Unable to fetch user profile:', error);
            }
        };

        fetchProfile();
    }, [isLoggedIn, location.pathname]);

    // Hide navigation on login and registration pages
    if (
        !isLoggedIn ||
        location.pathname === '/login' ||
        location.pathname === '/register'
    ) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setRole('');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/flights">
                    AirBooking
                </Link>

                <div className="navbar-nav ms-auto align-items-lg-center">
                    <NavLink className="nav-link" to="/flights">
                        Flights
                    </NavLink>

                    <NavLink className="nav-link" to="/my-trips">
                        My Trips
                    </NavLink>

                    {role === 'admin' && (
                        <NavLink className="nav-link" to="/admin">
                            Admin Dashboard
                        </NavLink>
                    )}

                    <button
                        className="btn btn-outline-light btn-sm ms-lg-3 mt-2 mt-lg-0"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

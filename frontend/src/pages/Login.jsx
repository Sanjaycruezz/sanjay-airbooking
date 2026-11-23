import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('accounts/login/', formData);

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Get the logged-in user's role
            const profile = await api.get('accounts/me/');

            if (profile.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/flights');
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex justify-content-center align-items-center px-3 position-relative"
            style={{
                backgroundColor: '#0a192f',
                backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.65), rgba(10, 25, 47, 0.72)), url('https://i.insider.com/5e8f70a8c023205e4245d983?width=700&format=jpeg&auto=webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                className="card border-0 shadow-lg p-4 p-sm-5 rounded-4"
                style={{
                    width: '100%',
                    maxWidth: '410px',
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <div className="text-center mb-4">
                    <span
                        className="badge rounded-pill text-bg-primary mb-2 px-3 py-2"
                        style={{ letterSpacing: '0.06em' }}
                    >
                        FLIGHT RESERVATIONS
                    </span>
                    <h2 className="fw-bold text-dark mb-1">AirBooking</h2>
                    <p className="text-muted small mb-0">
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-medium small text-secondary">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            className="form-control form-control-lg fs-6"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-medium small text-secondary">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-control form-control-lg fs-6"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 fs-6 fw-semibold shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <hr className="my-4 opacity-25" />

                <p className="text-center small text-muted mb-0">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="fw-semibold text-decoration-none">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
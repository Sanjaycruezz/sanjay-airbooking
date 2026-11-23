import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
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
        setMessage('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('accounts/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            setMessage(
                'Registration successful! Your account is pending admin approval.'
            );

            setFormData({
                username: '',
                email: '',
                password: '',
                confirm_password: '',
            });

            setTimeout(() => navigate('/login'), 2500);

        } catch (err) {
            const data = err.response?.data;

            if (data) {
                const firstError = Object.values(data).flat()[0];
                setError(firstError || 'Registration failed.');
            } else {
                setError('Unable to connect to the server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center px-3 py-5">
            <div
                className="card border-0 shadow-sm rounded-4 p-4 p-sm-5"
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div className="text-center mb-4">
                    <span
                        className="badge rounded-pill text-bg-primary mb-2 px-3 py-2"
                        style={{ letterSpacing: '0.06em' }}
                    >
                        NEW PASSENGER
                    </span>
                    <h2 className="fw-bold text-dark mb-1">Create an Account</h2>
                    <p className="text-muted small mb-0">
                        Register for AirBooking access
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 py-2 small rounded-3" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success border-0 py-2 small rounded-3" role="alert">
                        {message}
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
                            className="form-control"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium small text-secondary">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-medium small text-secondary">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-medium small text-secondary">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirm_password"
                            className="form-control"
                            placeholder="Re-enter your password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <hr className="my-4 opacity-25" />

                <p className="text-center small text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="fw-semibold text-decoration-none">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
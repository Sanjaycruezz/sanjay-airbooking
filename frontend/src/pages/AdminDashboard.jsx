import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [flightData, setFlightData] = useState({
        flight_number: '',
        airline: '',
        departure_airport: '',
        arrival_airport: '',
        departure_city: '',
        arrival_city: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        total_seats: '',
        available_seats: '',
        status: 'scheduled',
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            const [usersResponse, flightsResponse, bookingsResponse] =
                await Promise.all([
                    api.get('accounts/admin/pending-users/'),
                    api.get('admin/flights/'),
                    api.get('admin/bookings/'),
                ]);

            setUsers(usersResponse.data);
            setFlights(flightsResponse.data);
            setBookings(bookingsResponse.data);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Unable to load admin dashboard. Check your admin account.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleApproval = async (userId, status) => {
        try {
            setError('');
            setMessage('');

            await api.patch(
                `accounts/admin/users/${userId}/approval/`,
                { approval_status: status }
            );

            setMessage(`User ${status} successfully.`);
            fetchDashboardData();
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                'Unable to update user approval.'
            );
        }
    };

    const handleFlightChange = (e) => {
        setFlightData({
            ...flightData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddFlight = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setMessage('');

            const payload = {
                ...flightData,
                price: Number(flightData.price),
                total_seats: Number(flightData.total_seats),
                available_seats: Number(flightData.available_seats),
            };

            await api.post('admin/flights/', payload);

            setMessage('Flight added successfully.');

            setFlightData({
                flight_number: '',
                airline: '',
                departure_airport: '',
                arrival_airport: '',
                departure_city: '',
                arrival_city: '',
                departure_time: '',
                arrival_time: '',
                price: '',
                total_seats: '',
                available_seats: '',
                status: 'scheduled',
            });

            fetchDashboardData();
        } catch (err) {
            setError(
                JSON.stringify(err.response?.data) ||
                'Unable to add flight.'
            );
        }
    };

    const handleFlightStatus = async (flightId, status) => {
        try {
            setError('');
            setMessage('');

            await api.put(`admin/flights/${flightId}/status/`, {
                status,
            });

            setMessage('Flight status updated.');
            fetchDashboardData();
        } catch (err) {
            setError(
                JSON.stringify(err.response?.data) ||
                'Unable to update flight status.'
            );
        }
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status" />
                    <p className="text-muted mb-0">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <span
                            className="badge rounded-pill text-bg-primary mb-2 px-3 py-2"
                            style={{ letterSpacing: '0.06em' }}
                        >
                            ADMINISTRATION
                        </span>
                        <h2 className="fw-bold text-dark mb-1">Admin Dashboard</h2>
                        <p className="text-muted mb-0">
                            Manage users, flights and bookings.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-secondary px-4 py-2 fw-semibold"
                        onClick={fetchDashboardData}
                    >
                        Refresh Dashboard
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success border-0 shadow-sm rounded-3" role="alert">
                        {message}
                    </div>
                )}

                {/* Dashboard Summary */}
                <div className="row g-3 mb-5">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                            <span className="text-muted small fw-medium">Pending Users</span>
                            <h2 className="fw-bold text-dark mt-1 mb-0">{users.length}</h2>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                            <span className="text-muted small fw-medium">Total Flights</span>
                            <h2 className="fw-bold text-primary mt-1 mb-0">{flights.length}</h2>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                            <span className="text-muted small fw-medium">Total Bookings</span>
                            <h2 className="fw-bold text-success mt-1 mb-0">{bookings.length}</h2>
                        </div>
                    </div>
                </div>

                {/* Pending Users */}
                <section className="mb-5">
                    <h4 className="fw-semibold text-dark mb-3">Pending User Approvals</h4>

                    {users.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-muted">
                            No pending users.
                        </div>
                    ) : (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="py-3 px-4">Username</th>
                                            <th className="py-3 px-4">Email</th>
                                            <th className="py-3 px-4">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-4 py-3 fw-medium">{user.username}</td>
                                                <td className="px-4 py-3 text-muted">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        className="btn btn-success btn-sm me-2 px-3 fw-semibold"
                                                        onClick={() =>
                                                            handleApproval(user.id, 'approved')
                                                        }
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        className="btn btn-danger btn-sm px-3 fw-semibold"
                                                        onClick={() =>
                                                            handleApproval(user.id, 'rejected')
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                {/* Add Flight */}
                <section className="mb-5">
                    <h4 className="fw-semibold text-dark mb-3">Add New Flight</h4>

                    <form
                        className="card border-0 shadow-sm rounded-4 p-4 p-md-5"
                        onSubmit={handleAddFlight}
                    >
                        <div className="row g-3">
                            {[
                                ['flight_number', 'Flight Number'],
                                ['airline', 'Airline'],
                                ['departure_airport', 'Departure Airport'],
                                ['arrival_airport', 'Arrival Airport'],
                                ['departure_city', 'Departure City'],
                                ['arrival_city', 'Arrival City'],
                                ['departure_time', 'Departure Time'],
                                ['arrival_time', 'Arrival Time'],
                                ['price', 'Price'],
                                ['total_seats', 'Total Seats'],
                                ['available_seats', 'Available Seats'],
                            ].map(([name, label]) => (
                                <div className="col-md-6" key={name}>
                                    <label className="form-label fw-medium small text-secondary">
                                        {label}
                                    </label>

                                    <input
                                        className="form-control"
                                        name={name}
                                        type={
                                            name.includes('_time')
                                                ? 'datetime-local'
                                                : ['price', 'total_seats', 'available_seats'].includes(name)
                                                    ? 'number'
                                                    : 'text'
                                        }
                                        step={name === 'price' ? '0.01' : undefined}
                                        min={
                                            ['price', 'total_seats', 'available_seats'].includes(name)
                                                ? '0'
                                                : undefined
                                        }
                                        value={flightData[name]}
                                        onChange={handleFlightChange}
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <button className="btn btn-primary px-4 py-2 fw-semibold shadow-sm">
                                Add Flight
                            </button>
                        </div>
                    </form>
                </section>

                {/* Manage Flights */}
                <section className="mb-5">
                    <h4 className="fw-semibold text-dark mb-3">Manage Flights</h4>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="py-3 px-4">Flight</th>
                                        <th className="py-3 px-4">Route</th>
                                        <th className="py-3 px-4">Seats</th>
                                        <th className="py-3 px-4">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {flights.map((flight) => (
                                        <tr key={flight.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-bold text-dark">
                                                    {flight.flight_number}
                                                </div>
                                                <small className="text-muted">{flight.airline}</small>
                                            </td>

                                            <td className="px-4 py-3 fw-medium">
                                                {flight.departure_airport}
                                                <span className="text-primary mx-2">→</span>
                                                {flight.arrival_airport}
                                            </td>

                                            <td className="px-4 py-3">{flight.available_seats}</td>

                                            <td className="px-4 py-3">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={flight.status}
                                                    onChange={(e) =>
                                                        handleFlightStatus(
                                                            flight.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    {[
                                                        'scheduled',
                                                        'on_time',
                                                        'delayed',
                                                        'cancelled',
                                                        'departed',
                                                        'landed',
                                                    ].map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status.replace('_', ' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Bookings */}
                <section className="mb-4">
                    <h4 className="fw-semibold text-dark mb-3">All Bookings</h4>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="py-3 px-4">Reference</th>
                                        <th className="py-3 px-4">Customer</th>
                                        <th className="py-3 px-4">Flight</th>
                                        <th className="py-3 px-4">Seats</th>
                                        <th className="py-3 px-4">Total Price</th>
                                        <th className="py-3 px-4">Booking Status</th>
                                        <th className="py-3 px-4">Payment</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-4 py-3 font-monospace small">
                                                {booking.booking_reference}
                                            </td>
                                            <td className="px-4 py-3">{booking.username || booking.user}</td>
                                            <td className="px-4 py-3 fw-medium">{booking.flight_number}</td>
                                            <td className="px-4 py-3">{booking.number_of_seats}</td>
                                            <td className="px-4 py-3 fw-semibold text-primary">
                                                ₹{booking.total_price}
                                            </td>
                                            <td className="px-4 py-3">{booking.booking_status}</td>
                                            <td className="px-4 py-3">{booking.payment_status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
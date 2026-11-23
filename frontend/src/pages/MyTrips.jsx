import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MyTrips() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('bookings/my/');
            setBookings(response.data);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Unable to load your bookings.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?'
        );

        if (!confirmed) return;

        try {
            setCancellingId(bookingId);
            setError('');
            setMessage('');

            const response = await api.post(
                `bookings/${bookingId}/cancel/`
            );

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking.id === bookingId
                        ? response.data
                        : booking
                )
            );

            setMessage('Booking cancelled successfully.');
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                'Unable to cancel booking.'
            );
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center py-5">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status" />
                    <p className="text-muted mb-0">Loading your trips...</p>
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
                            TRIP MANAGEMENT
                        </span>
                        <h2 className="fw-bold text-dark mb-1">My Trips</h2>
                        <p className="text-muted mb-0">
                            View and manage your bookings
                        </p>
                    </div>

                    <button
                        className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
                        onClick={() => navigate('/flights')}
                    >
                        Search Flights
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

                {bookings.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-4 text-center p-5">
                        <h5 className="fw-bold text-dark mb-2">No bookings found</h5>
                        <p className="text-muted mb-4">
                            You haven&apos;t booked any flights yet.
                        </p>

                        <div className="d-flex justify-content-center">
                            <button
                                className="btn btn-primary px-4 py-2 fw-semibold"
                                onClick={() => navigate('/flights')}
                            >
                                Explore Flights
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {bookings.map((booking) => (
                            <div className="col-12" key={booking.id}>
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                                            <div>
                                                <span className="badge bg-light text-secondary border mb-2">
                                                    {booking.flight_number}
                                                </span>

                                                <h4 className="fw-bold text-dark mb-2">
                                                    {booking.departure_city}
                                                    <span className="text-primary mx-2">→</span>
                                                    {booking.arrival_city}
                                                </h4>

                                                <p className="text-muted small mb-1">
                                                    <strong className="text-dark">Departure:</strong>{' '}
                                                    {formatDate(booking.departure_time)}
                                                </p>

                                                <p className="text-muted small mb-1">
                                                    <strong className="text-dark">Booking reference:</strong>{' '}
                                                    <span className="font-monospace">
                                                        {booking.booking_reference}
                                                    </span>
                                                </p>

                                                <p className="small mb-2">
                                                    <strong className="text-dark">Seats:</strong>{' '}
                                                    {booking.number_of_seats}
                                                </p>

                                                <h4 className="fw-bold text-primary mt-2 mb-0">
                                                    ₹{booking.total_price}
                                                </h4>
                                            </div>

                                            <div className="text-md-end">
                                                <p className="mb-2 small">
                                                    <span className="text-muted me-1">Booking:</span>
                                                    <span className={`badge ${
                                                        booking.booking_status === 'confirmed'
                                                            ? 'bg-success'
                                                            : booking.booking_status === 'cancelled'
                                                                ? 'bg-danger'
                                                                : 'bg-warning text-dark'
                                                    }`}>
                                                        {booking.booking_status}
                                                    </span>
                                                </p>

                                                <p className="mb-3 small">
                                                    <span className="text-muted me-1">Payment:</span>
                                                    <span className="badge bg-secondary">
                                                        {booking.payment_status}
                                                    </span>
                                                </p>

                                                {booking.booking_status !== 'cancelled' &&
                                                    booking.booking_status !== 'confirmed' && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold"
                                                            onClick={() => handleCancel(booking.id)}
                                                            disabled={cancellingId === booking.id}
                                                        >
                                                            {cancellingId === booking.id
                                                                ? 'Cancelling...'
                                                                : 'Cancel Booking'}
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTrips;
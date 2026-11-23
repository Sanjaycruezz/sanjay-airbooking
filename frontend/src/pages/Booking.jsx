import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Booking() {
    const location = useLocation();
    const navigate = useNavigate();

    const flight = location.state?.flight;

    const [seats, setSeats] = useState(1);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    if (!flight) {
        return (
            <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center py-5">
                <div className="card border-0 shadow-sm rounded-4 text-center p-5" style={{ maxWidth: '420px' }}>
                    <h4 className="fw-bold text-dark mb-2">Flight details not found.</h4>
                    <p className="text-muted small mb-4">
                        Please select a flight from the search results to continue.
                    </p>
                    <button
                        className="btn btn-primary fw-semibold"
                        onClick={() => navigate('/flights')}
                    >
                        Back to Flights
                    </button>
                </div>
            </div>
        );
    }

    const handleBooking = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await api.post('bookings/', {
                flight: flight.id,
                number_of_seats: Number(seats),
            });

            setBooking(response.data);
            setMessage('Booking created successfully. Proceed to payment.');
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                'Unable to create booking.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (paymentSuccess) => {
        setError('');
        setPaymentLoading(true);

        try {
            const response = await api.post(
                `bookings/${booking.id}/payment/`,
                { payment_success: paymentSuccess }
            );

            setBooking(response.data.booking || response.data);
            setMessage(
                response.data.message ||
                (paymentSuccess
                    ? 'Payment successful!'
                    : 'Payment failed. Booking cancelled.')
            );
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                'Payment processing failed.'
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    const paymentProcessed = booking?.payment_status !== 'pending';

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-7">
                        <div className="mb-4">
                            <span
                                className="badge rounded-pill text-bg-primary mb-2 px-3 py-2"
                                style={{ letterSpacing: '0.06em' }}
                            >
                                RESERVATION & PAYMENT
                            </span>
                            <h2 className="fw-bold text-dark mb-0">Flight Booking</h2>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">{flight.airline}</h5>
                                        <span className="badge bg-light text-secondary border">
                                            {flight.flight_number}
                                        </span>
                                    </div>
                                    <div className="text-sm-end">
                                        <span className="text-muted small d-block">Price per seat</span>
                                        <h5 className="fw-bold text-primary mb-0">₹{flight.price}</h5>
                                    </div>
                                </div>

                                <h4 className="fw-bold text-dark mt-3 mb-1">
                                    {flight.departure_airport}
                                    <span className="text-primary mx-2">→</span>
                                    {flight.arrival_airport}
                                </h4>

                                <p className="text-muted small mb-2">
                                    {flight.departure_city}
                                    {' to '}
                                    {flight.arrival_city}
                                </p>

                                <p className="text-muted small mb-0">
                                    <strong className="text-dark">Departure:</strong>{' '}
                                    {new Date(
                                        flight.departure_time
                                    ).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        {!booking && (
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4">
                                    <label className="form-label fw-medium small text-secondary">
                                        Number of seats
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        max={flight.available_seats}
                                        value={seats}
                                        onChange={(e) => setSeats(e.target.value)}
                                    />

                                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                        <span className="text-muted fw-medium">Total Amount</span>
                                        <h4 className="fw-bold text-primary mb-0">
                                            ₹{(
                                                Number(flight.price) * Number(seats)
                                            ).toFixed(2)}
                                        </h4>
                                    </div>

                                    <button
                                        className="btn btn-primary w-100 py-2 fw-semibold shadow-sm mt-3"
                                        onClick={handleBooking}
                                        disabled={
                                            loading ||
                                            Number(seats) < 1 ||
                                            Number(seats) > flight.available_seats
                                        }
                                    >
                                        {loading ? 'Creating booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {booking && (
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold text-dark mb-3">Booking Details</h5>

                                    <p className="small mb-2">
                                        <span className="text-muted">Reference:</span>{' '}
                                        <span className="font-monospace fw-medium">
                                            {booking.booking_reference}
                                        </span>
                                    </p>

                                    <p className="small mb-2">
                                        <span className="text-muted">Seats:</span>{' '}
                                        <strong className="text-dark">{booking.number_of_seats}</strong>
                                    </p>

                                    <h4 className="fw-bold text-primary my-3">
                                        Total: ₹{booking.total_price}
                                    </h4>

                                    <p className="small mb-2">
                                        <span className="text-muted">Booking status:</span>{' '}
                                        <strong>{booking.booking_status}</strong>
                                    </p>

                                    <p className="small mb-0">
                                        <span className="text-muted">Payment status:</span>{' '}
                                        <strong>{booking.payment_status}</strong>
                                    </p>

                                    {!paymentProcessed && (
                                        <>
                                            <hr className="my-4" />
                                            <h6 className="fw-bold text-dark mb-1">Simulated Payment</h6>
                                            <p className="text-muted small mb-3">
                                                Choose an outcome to test the payment workflow.
                                                No real money will be charged.
                                            </p>

                                            <button
                                                className="btn btn-success w-100 py-2 fw-semibold mb-2"
                                                onClick={() => handlePayment(true)}
                                                disabled={paymentLoading}
                                            >
                                                {paymentLoading
                                                    ? 'Processing...'
                                                    : 'Simulate Successful Payment'}
                                            </button>

                                            <button
                                                className="btn btn-outline-danger w-100 py-2 fw-semibold"
                                                onClick={() => handlePayment(false)}
                                                disabled={paymentLoading}
                                            >
                                                Simulate Failed Payment
                                            </button>
                                        </>
                                    )}

                                    {paymentProcessed && (
                                        <button
                                            className="btn btn-primary w-100 py-2 fw-semibold shadow-sm mt-4"
                                            onClick={() => navigate('/my-trips')}
                                        >
                                            View My Trips
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {message && (
                            <div className="alert alert-success border-0 shadow-sm rounded-3 mt-3" role="alert">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger border-0 shadow-sm rounded-3 mt-3" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            className="btn btn-link text-decoration-none px-0 mt-3"
                            onClick={() => navigate('/flights')}
                        >
                            ← Back to Flights
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;
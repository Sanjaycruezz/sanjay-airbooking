import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function FlightSearch() {
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState({
        departure_airport: '',
        arrival_airport: '',
        date: '',
    });

    const [flights, setFlights] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleChange = (e) => {
        setSearchData({
            ...searchData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);
        setSearched(true);

        try {
            const response = await api.get('flights/search/', {
                params: {
                    departure_airport: searchData.departure_airport,
                    arrival_airport: searchData.arrival_airport,
                    date: searchData.date,
                    available: 'true',
                },
            });

            setFlights(response.data);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'Unable to search flights. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                <div className="text-center mb-4">
                    <span
                        className="badge rounded-pill text-bg-primary mb-2 px-3 py-2"
                        style={{ letterSpacing: '0.06em' }}
                    >
                        FLIGHT SEARCH
                    </span>
                    <h1 className="fw-bold text-dark mb-1">AirBooking</h1>
                    <p className="text-muted mb-0">
                        Find your next flight
                    </p>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
                    <h4 className="fw-semibold text-dark mb-3">Search Flights</h4>

                    <form onSubmit={handleSearch}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-medium small text-secondary">
                                    From (Airport Code)
                                </label>
                                <input
                                    type="text"
                                    name="departure_airport"
                                    className="form-control text-uppercase"
                                    placeholder="e.g. CCJ"
                                    maxLength="3"
                                    value={searchData.departure_airport}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-medium small text-secondary">
                                    To (Airport Code)
                                </label>
                                <input
                                    type="text"
                                    name="arrival_airport"
                                    className="form-control text-uppercase"
                                    placeholder="e.g. BLR"
                                    maxLength="3"
                                    value={searchData.arrival_airport}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-medium small text-secondary">
                                    Travel Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-control"
                                    value={searchData.date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-grid d-md-flex justify-content-md-end mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search Flights'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
                        {error}
                    </div>
                )}

                {searched && !loading && !error && (
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                        <h4 className="fw-semibold text-dark mb-0">Available Flights</h4>

                        {flights.length === 0 ? (
                            <span className="text-muted small">
                                No available flights found for your search.
                            </span>
                        ) : (
                            <span className="badge rounded-pill text-bg-secondary px-3 py-2">
                                {flights.length} flight(s) found
                            </span>
                        )}
                    </div>
                )}

                <div className="row g-3">
                    {flights.map((flight) => (
                        <div className="col-12" key={flight.id}>
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-3 mb-3 mb-md-0">
                                            <h5 className="fw-bold text-dark mb-1">
                                                {flight.airline}
                                            </h5>
                                            <span className="badge bg-light text-secondary border">
                                                {flight.flight_number}
                                            </span>
                                        </div>

                                        <div className="col-md-4 mb-3 mb-md-0">
                                            <div className="fs-5 fw-bold text-dark">
                                                {flight.departure_airport}
                                                <span className="text-primary mx-2">→</span>
                                                {flight.arrival_airport}
                                            </div>
                                            <small className="text-muted">
                                                {flight.departure_city}
                                                {' to '}
                                                {flight.arrival_city}
                                            </small>
                                        </div>

                                        <div className="col-md-3 mb-3 mb-md-0">
                                            <div className="fw-medium text-dark">
                                                {formatDateTime(flight.departure_time)}
                                            </div>
                                            <small className="text-muted d-block">
                                                Departure
                                            </small>
                                            <span className="badge bg-info-subtle text-info-emphasis mt-2">
                                                {flight.available_seats} seats left
                                            </span>
                                        </div>

                                        <div className="col-md-2 text-md-end">
                                            <h4 className="fw-bold text-primary mb-1">
                                                ₹{flight.price}
                                            </h4>

                                            <span
                                                className={`badge ${
                                                    flight.status?.toLowerCase() === 'delayed'
                                                        ? 'bg-warning text-dark'
                                                        : 'bg-success'
                                                }`}
                                            >
                                                {flight.status}
                                            </span>

                                            <div className="mt-2">
                                                <button
                                                    className="btn btn-primary btn-sm w-100 fw-semibold"
                                                    onClick={() => navigate(`/book/${flight.id}`, {
                                                        state: { flight }
                                                    })}
                                                >
                                                    Book Flight
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FlightSearch;
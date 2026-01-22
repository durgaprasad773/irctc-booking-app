import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      const local = localStorage.getItem('bookings');
      if (local) setBookings(JSON.parse(local));
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadBookings();
      }
    } catch (error) {
      const updated = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'Cancelled' } : b
      );
      setBookings(updated);
      localStorage.setItem('bookings', JSON.stringify(updated));
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found</p>
          <button onClick={() => navigate('/')} className="search-btn">Search Trains</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3>{booking.train?.name || 'Train'}</h3>
                  <span className="pnr">PNR: {booking.pnr}</span>
                </div>
                <span className={`status ${booking.status?.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <label>Route</label>
                  <span>{booking.train?.source} → {booking.train?.destination}</span>
                </div>
                <div className="detail-item">
                  <label>Journey Date</label>
                  <span>{new Date(booking.date || booking.journey_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Class</label>
                  <span>{booking.class}</span>
                </div>
                <div className="detail-item">
                  <label>Passengers</label>
                  <span>{booking.passengers?.length || 0}</span>
                </div>
                <div className="detail-item">
                  <label>Total Fare</label>
                  <span>₹{booking.total || booking.total_fare}</span>
                </div>
              </div>

              <div className="passengers-list">
                <h4>Passengers</h4>
                {booking.passengers?.map((p, index) => (
                  <div key={index} className="passenger-item">
                    {p.name} ({p.age} yrs, {p.gender}) - {p.berth}
                  </div>
                ))}
              </div>

              {booking.status === 'Confirmed' && (
                <button 
                  onClick={() => cancelBooking(booking.id)} 
                  className="cancel-btn"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;

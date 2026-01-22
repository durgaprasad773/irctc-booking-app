import { useLocation, useNavigate } from 'react-router-dom';
import './Confirmation.css';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, pnr } = location.state || {};

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Booking Confirmed!</h1>
        <p className="success-message">Your ticket has been booked successfully</p>

        <div className="pnr-section">
          <label>PNR Number</label>
          <div className="pnr-number">{pnr}</div>
        </div>

        <div className="booking-info">
          <h3>Booking Details</h3>
          <div className="info-row">
            <span>Booking ID</span>
            <span>{booking.booking_id}</span>
          </div>
          <div className="info-row">
            <span>Status</span>
            <span className="status-confirmed">Confirmed</span>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/bookings')} className="view-bookings-btn">
            View All Bookings
          </button>
          <button onClick={() => navigate('/')} className="home-btn">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

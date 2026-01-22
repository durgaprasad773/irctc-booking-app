import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, date, passengers, selectedClass, total } = location.state || {};
  const [savedPayments, setSavedPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [newPayment, setNewPayment] = useState({ type: '', number: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!train || !passengers) {
      navigate('/');
      return;
    }
    const saved = localStorage.getItem('payments');
    if (saved) setSavedPayments(JSON.parse(saved));
  }, [train, passengers, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/bookings/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            train_id: train.id,
            journey_date: date,
            class: selectedClass,
            passengers: passengers,
            total_fare: total,
            payment_method: selectedPayment || newPayment.type
          })
        });

        const data = await response.json();

        if (response.ok) {
          const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          bookings.push({
            id: data.booking_id,
            pnr: data.pnr,
            train: train,
            date: date,
            passengers: passengers,
            class: selectedClass,
            total: total,
            status: 'Confirmed',
            bookedAt: new Date().toISOString()
          });
          localStorage.setItem('bookings', JSON.stringify(bookings));
          
          // Show success message with remaining seats
          if (data.remainingSeats !== undefined) {
            console.log(`Booking successful. ${data.seatsBooked} seat(s) booked. ${data.remainingSeats} seat(s) remaining.`);
          }
          
          navigate('/confirmation', { state: { booking: data, pnr: data.pnr } });
        } else {
          // Handle seat availability error or other errors
          if (data.availableSeats !== undefined) {
            if (data.availableSeats === 0) {
              alert(`Booking Failed: No seats available in ${selectedClass}. All seats have been booked.`);
            } else if (data.requestedSeats) {
              alert(`Booking Failed: ${data.message}\\n\\nAvailable: ${data.availableSeats} seat${data.availableSeats !== 1 ? 's' : ''}\\nRequested: ${data.requestedSeats} seat${data.requestedSeats !== 1 ? 's' : ''}`);
            } else {
              alert(data.message);
            }
            // Redirect back to search to see updated availability
            navigate('/search', { state: { source: train.source, destination: train.destination, date: date } });
          } else {
            alert(data.message || 'Payment failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Payment failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  if (!train) return <Loading />;

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Payment</h1>
        <button onClick={() => navigate(-1)} className="back-btn">Back</button>
      </div>

      <div className="payment-content">
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Train</span>
            <span>{train.name} (#{train.number})</span>
          </div>
          <div className="summary-item">
            <span>Route</span>
            <span>{train.source} → {train.destination}</span>
          </div>
          <div className="summary-item">
            <span>Date</span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="summary-item">
            <span>Class</span>
            <span>{selectedClass}</span>
          </div>
          <div className="summary-item">
            <span>Passengers</span>
            <span>{passengers.length}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <h3>Payment Details</h3>

          {savedPayments.length > 0 && (
            <div className="saved-payments">
              <label>Use Saved Payment Method</label>
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
              >
                <option value="">Select saved payment method</option>
                {savedPayments.map(p => (
                  <option key={p.id} value={p.type}>{p.type} - {p.number}</option>
                ))}
              </select>
            </div>
          )}

          {!selectedPayment && (
            <>
              <div className="payment-types">
                <label className={newPayment.type === 'Credit Card' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="Credit Card"
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    required={!selectedPayment}
                  />
                  Credit Card
                </label>
                <label className={newPayment.type === 'Debit Card' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="Debit Card"
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    required={!selectedPayment}
                  />
                  Debit Card
                </label>
                <label className={newPayment.type === 'UPI' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="UPI"
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    required={!selectedPayment}
                  />
                  UPI
                </label>
              </div>

              {newPayment.type && newPayment.type !== 'UPI' && (
                <div className="card-details">
                  <input
                    type="text"
                    value={newPayment.number}
                    onChange={(e) => setNewPayment({ ...newPayment, number: e.target.value })}
                    placeholder="Card Number"
                    required
                  />
                  <input
                    type="text"
                    value={newPayment.name}
                    onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                    placeholder="Cardholder Name"
                    required
                  />
                  <div className="card-row">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                    />
                    <input
                      type="text"
                      value={newPayment.cvv}
                      onChange={(e) => setNewPayment({ ...newPayment, cvv: e.target.value })}
                      placeholder="CVV"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
              )}

              {newPayment.type === 'UPI' && (
                <div className="upi-details">
                  <input
                    type="text"
                    value={newPayment.number}
                    onChange={(e) => setNewPayment({ ...newPayment, number: e.target.value })}
                    placeholder="UPI ID (example@upi)"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="pay-btn" disabled={processing}>
            {processing ? 'Processing...' : `Pay ₹${total}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;

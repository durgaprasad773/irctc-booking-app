import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './BookTicket.css';

const BookTicket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, date } = location.state || {};
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '', berth: '' }]);
  const [selectedClass, setSelectedClass] = useState('Sleeper');
  const [savedPassengers, setSavedPassengers] = useState([]);

  useEffect(() => {
    if (!train || !date) {
      navigate('/');
      return;
    }
    const saved = localStorage.getItem('passengers');
    if (saved) setSavedPassengers(JSON.parse(saved));
  }, [train, date, navigate]);

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: '', berth: '' }]);
  };

  const removePassenger = (index) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const loadSavedPassenger = (index, passenger) => {
    const updated = [...passengers];
    updated[index] = { ...passenger, berth: '' };
    setPassengers(updated);
  };

  const calculateTotal = () => {
    const fareMap = {
      'Sleeper': train.sleeper_fare,
      'AC 3-Tier': train.ac3_fare,
      'AC 2-Tier': train.ac2_fare
    };
    return passengers.length * fareMap[selectedClass];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/payment', { state: { train, date, passengers, selectedClass, total: calculateTotal() } });
  };

  if (!train) return <Loading />;

  return (
    <div className="book-container">
      <div className="book-header">
        <h1>Book Ticket</h1>
        <button onClick={() => navigate(-1)} className="back-btn">Back</button>
      </div>

      <div className="train-summary">
        <h3>{train.name} (#{train.number})</h3>
        <div className="summary-details">
          <span>{train.source} → {train.destination}</span>
          <span>{new Date(date).toLocaleDateString()}</span>
          <span>{train.departure_time} - {train.arrival_time}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="class-selection">
          <label>Select Class</label>
          <div className="class-options">
            <label className={selectedClass === 'Sleeper' ? 'active' : ''}>
              <input
                type="radio"
                name="class"
                value="Sleeper"
                checked={selectedClass === 'Sleeper'}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
              Sleeper - ₹{train.sleeper_fare}
            </label>
            <label className={selectedClass === 'AC 3-Tier' ? 'active' : ''}>
              <input
                type="radio"
                name="class"
                value="AC 3-Tier"
                checked={selectedClass === 'AC 3-Tier'}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
              AC 3-Tier - ₹{train.ac3_fare}
            </label>
            <label className={selectedClass === 'AC 2-Tier' ? 'active' : ''}>
              <input
                type="radio"
                name="class"
                value="AC 2-Tier"
                checked={selectedClass === 'AC 2-Tier'}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
              AC 2-Tier - ₹{train.ac2_fare}
            </label>
          </div>
        </div>

        <div className="passengers-section">
          <h3>Passenger Details</h3>
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-card">
              <div className="passenger-header">
                <h4>Passenger {index + 1}</h4>
                {passengers.length > 1 && (
                  <button type="button" onClick={() => removePassenger(index)} className="remove-btn">Remove</button>
                )}
              </div>
              {savedPassengers.length > 0 && (
                <select
                  onChange={(e) => {
                    const p = savedPassengers.find(sp => sp.id === parseInt(e.target.value));
                    if (p) loadSavedPassenger(index, p);
                  }}
                  className="saved-select"
                >
                  <option value="">Select Saved Passenger</option>
                  {savedPassengers.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              )}
              <div className="passenger-form">
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                  placeholder="Full Name"
                  required
                />
                <input
                  type="number"
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                  placeholder="Age"
                  required
                />
                <select
                  value={passenger.gender}
                  onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  required
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={passenger.berth}
                  onChange={(e) => updatePassenger(index, 'berth', e.target.value)}
                  required
                >
                  <option value="">Berth Preference</option>
                  <option value="Lower">Lower</option>
                  <option value="Middle">Middle</option>
                  <option value="Upper">Upper</option>
                  <option value="Side Lower">Side Lower</option>
                  <option value="Side Upper">Side Upper</option>
                </select>
              </div>
            </div>
          ))}
          <button type="button" onClick={addPassenger} className="add-passenger-btn">+ Add Passenger</button>
        </div>

        <div className="fare-summary">
          <div className="fare-row">
            <span>Passengers</span>
            <span>{passengers.length}</span>
          </div>
          <div className="fare-row">
            <span>Fare per passenger</span>
            <span>₹{selectedClass === 'Sleeper' ? train.sleeper_fare : selectedClass === 'AC 3-Tier' ? train.ac3_fare : train.ac2_fare}</span>
          </div>
          <div className="fare-row total">
            <span>Total Amount</span>
            <span>₹{calculateTotal()}</span>
          </div>
        </div>

        <button type="submit" className="proceed-btn">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default BookTicket;

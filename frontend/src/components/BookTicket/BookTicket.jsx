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
  const [currentTrain, setCurrentTrain] = useState(train);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!train || !date) {
      navigate('/');
      return;
    }
    const saved = localStorage.getItem('passengers');
    if (saved) setSavedPassengers(JSON.parse(saved));
    
    // Fetch latest train details to get updated seat availability
    fetchLatestTrainDetails();
  }, [train, date, navigate]);

  const fetchLatestTrainDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trains/${train.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const latestTrain = await response.json();
        setCurrentTrain(latestTrain);
      }
    } catch (error) {
      console.error('Error fetching latest train details:', error);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Fetch latest seat availability before proceeding
    setLoading(true);
    await fetchLatestTrainDetails();
    
    const availableSeats = getAvailableSeats();
    
    if (availableSeats <= 0) {
      alert(`No seats available in ${selectedClass}. Please select a different class.`);
      setLoading(false);
      return;
    }
    
    if (passengers.length > availableSeats) {
      alert(`Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available in ${selectedClass}. You are trying to book ${passengers.length} seat${passengers.length !== 1 ? 's' : ''}.`);
      setLoading(false);
      return;
    }
    
    setLoading(false);
    navigate('/payment', { state: { train: currentTrain, date, passengers, selectedClass, total: calculateTotal() } });
  };

  const calculateTotal = () => {
    const fareMap = {
      'Sleeper': currentTrain.sleeper_fare,
      'AC 3-Tier': currentTrain.ac3_fare,
      'AC 2-Tier': currentTrain.ac2_fare
    };
    return passengers.length * fareMap[selectedClass];
  };

  const getAvailableSeats = () => {
    const seatsMap = {
      'Sleeper': currentTrain.sleeper_available,
      'AC 3-Tier': currentTrain.ac3_available,
      'AC 2-Tier': currentTrain.ac2_available
    };
    return seatsMap[selectedClass];
  };

  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    const seatsMap = {
      'Sleeper': currentTrain.sleeper_available,
      'AC 3-Tier': currentTrain.ac3_available,
      'AC 2-Tier': currentTrain.ac2_available
    };
    const availableSeats = seatsMap[newClass];
    
    if (availableSeats <= 0) {
      alert(`No seats available in ${newClass}. Please select a different class.`);
      return;
    }
    
    if (passengers.length > availableSeats) {
      alert(`Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available in ${newClass}. Reducing passengers to ${availableSeats}.`);
      // Reduce passengers to available seats
      setPassengers(passengers.slice(0, Math.max(1, availableSeats)));
    }
  };

  const addPassenger = () => {
    const availableSeats = getAvailableSeats();
    if (availableSeats <= 0) {
      alert(`No seats available in ${selectedClass}. Please select a different class.`);
      return;
    }
    if (passengers.length >= availableSeats) {
      alert(`Maximum ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} available in ${selectedClass}`);
      return;
    }
    setPassengers([...passengers, { name: '', age: '', gender: '', berth: '' }]);
  };

  if (!currentTrain) return <Loading />;

  return (
    <div className="book-container">
      <div className="book-header">
        <h1>Book Ticket</h1>
        <button onClick={() => navigate(-1)} className="back-btn">Back</button>
      </div>

      <div className="train-summary">
        <h3>{currentTrain.name} (#{currentTrain.number})</h3>
        <div className="summary-details">
          <span>{currentTrain.source} → {currentTrain.destination}</span>
          <span>{new Date(date).toLocaleDateString()}</span>
          <span>{currentTrain.departure_time} - {currentTrain.arrival_time}</span>
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
                onChange={(e) => handleClassChange(e.target.value)}
              />
              <div className="class-info">
                <span>Sleeper - ₹{currentTrain.sleeper_fare}</span>
                <span className="seats-available">
                  {currentTrain.sleeper_available} seat{currentTrain.sleeper_available !== 1 ? 's' : ''} available
                </span>
              </div>
            </label>
            <label className={selectedClass === 'AC 3-Tier' ? 'active' : ''}>
              <input
                type="radio"
                name="class"
                value="AC 3-Tier"
                checked={selectedClass === 'AC 3-Tier'}
                onChange={(e) => handleClassChange(e.target.value)}
              />
              <div className="class-info">
                <span>AC 3-Tier - ₹{currentTrain.ac3_fare}</span>
                <span className="seats-available">
                  {currentTrain.ac3_available} seat{currentTrain.ac3_available !== 1 ? 's' : ''} available
                </span>
              </div>
            </label>
            <label className={selectedClass === 'AC 2-Tier' ? 'active' : ''}>
              <input
                type="radio"
                name="class"
                value="AC 2-Tier"
                checked={selectedClass === 'AC 2-Tier'}
                onChange={(e) => handleClassChange(e.target.value)}
              />
              <div className="class-info">
                <span>AC 2-Tier - ₹{currentTrain.ac2_fare}</span>
                <span className="seats-available">
                  {currentTrain.ac2_available} seat{currentTrain.ac2_available !== 1 ? 's' : ''} available
                </span>
              </div>
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
            <span>₹{selectedClass === 'Sleeper' ? currentTrain.sleeper_fare : selectedClass === 'AC 3-Tier' ? currentTrain.ac3_fare : currentTrain.ac2_fare}</span>
          </div>
          <div className="fare-row total">
            <span>Total Amount</span>
            <span>₹{calculateTotal()}</span>
          </div>
        </div>

        <button type="submit" className="proceed-btn" disabled={loading}>
          {loading ? 'Checking Availability...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
};

export default BookTicket;

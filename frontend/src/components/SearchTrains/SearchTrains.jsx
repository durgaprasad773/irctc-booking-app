import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './SearchTrains.css';

const SearchTrains = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const { source, destination, date } = location.state || {};

  useEffect(() => {
    if (!source || !destination || !date) {
      navigate('/');
      return;
    }
    fetchTrains();
  }, [source, destination, date, navigate]);

  const fetchTrains = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trains/search?source=${source}&destination=${destination}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (train) => {
    navigate('/book', { state: { train, date } });
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Available Trains</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="search-info">
        <div className="route-info">
          <span className="station">{source}</span>
          <span className="arrow">→</span>
          <span className="station">{destination}</span>
        </div>
        <div className="date-info">Journey Date: {new Date(date).toLocaleDateString()}</div>
      </div>

      {loading ? (
        <Loading message="Searching for trains..." />
      ) : trains.length === 0 ? (
        <div className="no-trains">No trains found for this route</div>
      ) : (
        <div className="trains-list">
          {trains.map(train => (
            <div key={train.id} className="train-card">
              <div className="train-header">
                <h3>{train.name}</h3>
                <span className="train-number">#{train.number}</span>
              </div>
              <div className="train-details">
                <div className="time-info">
                  <div>
                    <span className="time">{train.departure_time}</span>
                    <span className="station-name">{train.source}</span>
                  </div>
                  <div className="duration">{train.duration}</div>
                  <div>
                    <span className="time">{train.arrival_time}</span>
                    <span className="station-name">{train.destination}</span>
                  </div>
                </div>
                <div className="fare-info">
                  <div className="class-fare">
                    <span>Sleeper</span>
                    <span className="price">₹{train.sleeper_fare}</span>
                    <span className="seats">{train.sleeper_available} seats</span>
                  </div>
                  <div className="class-fare">
                    <span>AC 3-Tier</span>
                    <span className="price">₹{train.ac3_fare}</span>
                    <span className="seats">{train.ac3_available} seats</span>
                  </div>
                  <div className="class-fare">
                    <span>AC 2-Tier</span>
                    <span className="price">₹{train.ac2_fare}</span>
                    <span className="seats">{train.ac2_available} seats</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleBook(train)} className="book-btn">Book Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTrains;

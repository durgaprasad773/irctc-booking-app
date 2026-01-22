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
  const [isEditing, setIsEditing] = useState(false);
  const [editSource, setEditSource] = useState(source || '');
  const [editDestination, setEditDestination] = useState(destination || '');
  const [editDate, setEditDate] = useState(date || '');

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
    // Check if any class has available seats
    const hasAvailableSeats = train.sleeper_available > 0 || train.ac3_available > 0 || train.ac2_available > 0;
    
    if (!hasAvailableSeats) {
      alert('No seats available on this train. All classes are fully booked.');
      return;
    }
    
    navigate('/book', { state: { train, date } });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditSource(source);
    setEditDestination(editDestination);
    setEditDate(date);
  };

  const handleSearchAgain = async (e) => {
    e.preventDefault();
    if (!editSource || !editDestination || !editDate) {
      alert('Please fill all fields');
      return;
    }
    
    setIsEditing(false);
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/trains/search?source=${editSource}&destination=${editDestination}&date=${editDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTrains(data);
      
      navigate('/search', { 
        state: { source: editSource, destination: editDestination, date: editDate },
        replace: true 
      });
    } catch (error) {
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditSource(source);
    setEditDestination(destination);
    setEditDate(date);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Available Trains</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="search-info">
        {!isEditing ? (
          <>
            <div className="route-info">
              <span className="station">{source}</span>
              <span className="arrow">→</span>
              <span className="station">{destination}</span>
              <div className="date-info">Journey Date: {new Date(date).toLocaleDateString()}</div>
            </div>
            <button onClick={handleEditClick} className="edit-search-btn">Edit Search</button>
          </>
        ) : (
          <form onSubmit={handleSearchAgain} className="edit-search-form">
            <div className="form-group">
              <label>From</label>
              <input
                type="text"
                value={editSource}
                onChange={(e) => setEditSource(e.target.value)}
                placeholder="Source Station"
                required
              />
            </div>
            <div className="arrow-divider">→</div>
            <div className="form-group">
              <label>To</label>
              <input
                type="text"
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                placeholder="Destination Station"
                required
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="edit-actions">
              <button type="submit" className="search-again-btn">Search</button>
              <button type="button" onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}
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
                    <span className={`seats ${train.sleeper_available === 0 ? 'sold-out' : train.sleeper_available <= 5 ? 'low-seats' : ''}`}>
                      {train.sleeper_available > 0 ? `${train.sleeper_available} seat${train.sleeper_available !== 1 ? 's' : ''}` : 'Sold Out'}
                    </span>
                  </div>
                  <div className="class-fare">
                    <span>AC 3-Tier</span>
                    <span className="price">₹{train.ac3_fare}</span>
                    <span className={`seats ${train.ac3_available === 0 ? 'sold-out' : train.ac3_available <= 5 ? 'low-seats' : ''}`}>
                      {train.ac3_available > 0 ? `${train.ac3_available} seat${train.ac3_available !== 1 ? 's' : ''}` : 'Sold Out'}
                    </span>
                  </div>
                  <div className="class-fare">
                    <span>AC 2-Tier</span>
                    <span className="price">₹{train.ac2_fare}</span>
                    <span className={`seats ${train.ac2_available === 0 ? 'sold-out' : train.ac2_available <= 5 ? 'low-seats' : ''}`}>
                      {train.ac2_available > 0 ? `${train.ac2_available} seat${train.ac2_available !== 1 ? 's' : ''}` : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleBook(train)} 
                className="book-btn"
                disabled={train.sleeper_available === 0 && train.ac3_available === 0 && train.ac2_available === 0}
              >
                {train.sleeper_available === 0 && train.ac3_available === 0 && train.ac2_available === 0 ? 'Fully Booked' : 'Book Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTrains;

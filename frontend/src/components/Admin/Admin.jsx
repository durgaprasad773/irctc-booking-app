import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [trains, setTrains] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    source: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    duration: '',
    sleeper_fare: '',
    ac3_fare: '',
    ac2_fare: '',
    sleeper_available: '',
    ac3_available: '',
    ac2_available: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.is_admin) {
      navigate('/');
      return;
    }
    loadTrains();
  }, [navigate]);

  const loadTrains = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trains/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTrains(data);
    } catch (error) {
      console.error('Error loading trains:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert numeric fields to proper types
      const trainData = {
        ...formData,
        sleeper_fare: parseInt(formData.sleeper_fare),
        ac3_fare: parseInt(formData.ac3_fare),
        ac2_fare: parseInt(formData.ac2_fare),
        sleeper_available: parseInt(formData.sleeper_available),
        ac3_available: parseInt(formData.ac3_available),
        ac2_available: parseInt(formData.ac2_available)
      };

      const response = await fetch('http://localhost:5000/api/trains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(trainData)
      });

      if (response.ok) {
        alert('Train added successfully!');
        setFormData({
          name: '',
          number: '',
          source: '',
          destination: '',
          departure_time: '',
          arrival_time: '',
          duration: '',
          sleeper_fare: '',
          ac3_fare: '',
          ac2_fare: '',
          sleeper_available: '',
          ac3_available: '',
          ac2_available: ''
        });
        loadTrains();
      } else {
        alert('Failed to add train');
      }
    } catch (error) {
      alert('Error adding train');
    }
  };

  const deleteTrain = async (id) => {
    if (!confirm('Are you sure you want to delete this train?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/trains/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        loadTrains();
      }
    } catch (error) {
      console.error('Error deleting train:', error);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="admin-content">
        <div className="add-train-section">
          <h2>Add New Train Route</h2>
          <form onSubmit={handleSubmit} className="train-form">
            <div className="form-grid">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Train Name"
                required
              />
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Train Number"
                required
              />
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="Source Station"
                required
              />
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Destination Station"
                required
              />
              <input
                type="time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                placeholder="Departure Time"
                required
              />
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                placeholder="Arrival Time"
                required
              />
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Duration (e.g., 8h 30m)"
                required
              />
              <input
                type="number"
                name="sleeper_fare"
                value={formData.sleeper_fare}
                onChange={handleChange}
                placeholder="Sleeper Fare"
                required
              />
              <input
                type="number"
                name="ac3_fare"
                value={formData.ac3_fare}
                onChange={handleChange}
                placeholder="AC 3-Tier Fare"
                required
              />
              <input
                type="number"
                name="ac2_fare"
                value={formData.ac2_fare}
                onChange={handleChange}
                placeholder="AC 2-Tier Fare"
                required
              />
              <input
                type="number"
                name="sleeper_available"
                value={formData.sleeper_available}
                onChange={handleChange}
                placeholder="Sleeper Seats"
                required
              />
              <input
                type="number"
                name="ac3_available"
                value={formData.ac3_available}
                onChange={handleChange}
                placeholder="AC 3-Tier Seats"
                required
              />
              <input
                type="number"
                name="ac2_available"
                value={formData.ac2_available}
                onChange={handleChange}
                placeholder="AC 2-Tier Seats"
                required
              />
            </div>
            <button type="submit" className="submit-btn">Add Train</button>
          </form>
        </div>

        <div className="trains-section">
          <h2>Existing Train Routes</h2>
          <div className="trains-table">
            {trains.length === 0 ? (
              <p className="no-data">No trains available</p>
            ) : (
              trains.map(train => (
                <div key={train.id} className="train-row">
                  <div className="train-info">
                    <h3>{train.name}</h3>
                    <p>#{train.number}</p>
                    <p>{train.source} → {train.destination}</p>
                    <p>{train.departure_time} - {train.arrival_time}</p>
                  </div>
                  <button onClick={() => deleteTrain(train.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

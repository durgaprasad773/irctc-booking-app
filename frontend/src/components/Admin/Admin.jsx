import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [trains, setTrains] = useState([]);
  const [editingId, setEditingId] = useState(null);
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

  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '';
    
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    let depTotalMinutes = depHours * 60 + depMinutes;
    let arrTotalMinutes = arrHours * 60 + arrMinutes;
    
    // If arrival time is less than departure time, add 24 hours (next day)
    if (arrTotalMinutes < depTotalMinutes) {
      arrTotalMinutes += 24 * 60;
    }
    
    const diffMinutes = arrTotalMinutes - depTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    // Auto-calculate duration when departure or arrival time changes
    if (name === 'departure_time' || name === 'arrival_time') {
      const departureTime = name === 'departure_time' ? value : formData.departure_time;
      const arrivalTime = name === 'arrival_time' ? value : formData.arrival_time;
      updatedData.duration = calculateDuration(departureTime, arrivalTime);
    }
    
    setFormData(updatedData);
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

      const url = editingId 
        ? `http://localhost:5000/api/trains/update/${editingId}`
        : 'http://localhost:5000/api/trains/add';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(trainData)
      });

      if (response.ok) {
        alert(editingId ? 'Train updated successfully!' : 'Train added successfully!');
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
        setEditingId(null);
        loadTrains();
      } else {
        alert(editingId ? 'Failed to update train' : 'Failed to add train');
      }
    } catch (error) {
      alert(editingId ? 'Error updating train' : 'Error adding train');
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

  const editTrain = (train) => {
    setEditingId(train.id);
    setFormData({
      name: train.name,
      number: train.number,
      source: train.source,
      destination: train.destination,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      duration: train.duration,
      sleeper_fare: train.sleeper_fare.toString(),
      ac3_fare: train.ac3_fare.toString(),
      ac2_fare: train.ac2_fare.toString(),
      sleeper_available: train.sleeper_available.toString(),
      ac3_available: train.ac3_available.toString(),
      ac2_available: train.ac2_available.toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
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
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="admin-content">
        <div className="add-train-section">
          <h2>{editingId ? 'Edit Train Route' : 'Add New Train Route'}</h2>
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
                title="Select Departure Time"
                required
              />
              <input
                type="time"
                name="arrival_time"
                value={formData.arrival_time}
                onChange={handleChange}
                placeholder="Arrival Time"
                title="Select Arrival Time"
                required
              />
              <input
                type="text"
                name="duration"
                value={formData.duration}
                placeholder="Duration"
                readOnly
                required
              />
              <input
                type="number"
                name="sleeper_fare"
                value={formData.sleeper_fare}
                onChange={handleChange}
                placeholder="Sleeper Fare"
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                name="ac3_fare"
                value={formData.ac3_fare}
                onChange={handleChange}
                placeholder="AC 3-Tier Fare"
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                name="ac2_fare"
                value={formData.ac2_fare}
                onChange={handleChange}
                placeholder="AC 2-Tier Fare"
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                name="sleeper_available"
                value={formData.sleeper_available}
                onChange={handleChange}
                placeholder="Sleeper Seats"
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                name="ac3_available"
                value={formData.ac3_available}
                onChange={handleChange}
                placeholder="AC 3-Tier Seats"
                min="0"
                step="1"
                required
              />
              <input
                type="number"
                name="ac2_available"
                value={formData.ac2_available}
                onChange={handleChange}
                placeholder="AC 2-Tier Seats"
                min="0"
                step="1"
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingId ? 'Update Train' : 'Add Train'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel Edit
                </button>
              )}
            </div>
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
                    <div className="seat-info">
                      <span>Sleeper: {train.sleeper_available}</span>
                      <span>AC3: {train.ac3_available}</span>
                      <span>AC2: {train.ac2_available}</span>
                    </div>
                  </div>
                  <div className="train-actions">
                    <button onClick={() => editTrain(train)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => deleteTrain(train.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
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

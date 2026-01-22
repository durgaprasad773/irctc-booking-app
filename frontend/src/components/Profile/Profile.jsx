import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newPassenger, setNewPassenger] = useState({ name: '', age: '', gender: '' });
  const [newPayment, setNewPayment] = useState({ type: '', number: '', name: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadPassengers();
    loadPayments();
  }, [navigate]);

  const loadPassengers = () => {
    const saved = localStorage.getItem('passengers');
    if (saved) setPassengers(JSON.parse(saved));
  };

  const loadPayments = () => {
    const saved = localStorage.getItem('payments');
    if (saved) setPayments(JSON.parse(saved));
  };

  const addPassenger = (e) => {
    e.preventDefault();
    const updated = [...passengers, { ...newPassenger, id: Date.now() }];
    localStorage.setItem('passengers', JSON.stringify(updated));
    setPassengers(updated);
    setNewPassenger({ name: '', age: '', gender: '' });
  };

  const deletePassenger = (id) => {
    const updated = passengers.filter(p => p.id !== id);
    localStorage.setItem('passengers', JSON.stringify(updated));
    setPassengers(updated);
  };

  const addPayment = (e) => {
    e.preventDefault();
    const updated = [...payments, { ...newPayment, id: Date.now() }];
    localStorage.setItem('payments', JSON.stringify(updated));
    setPayments(updated);
    setNewPayment({ type: '', number: '', name: '' });
  };

  const deletePayment = (id) => {
    const updated = payments.filter(p => p.id !== id);
    localStorage.setItem('payments', JSON.stringify(updated));
    setPayments(updated);
  };

  if (!user) return <Loading />;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === 'profile' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('profile')}
        >
          Profile Details
        </button>
        <button
          className={activeTab === 'passengers' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('passengers')}
        >
          Passenger Master
        </button>
        <button
          className={activeTab === 'payments' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('payments')}
        >
          Payment Methods
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'passengers' && (
          <div className="profile-section">
            <h2>Saved Passengers</h2>
            <form onSubmit={addPassenger} className="add-form">
              <input
                type="text"
                value={newPassenger.name}
                onChange={(e) => setNewPassenger({ ...newPassenger, name: e.target.value })}
                placeholder="Passenger Name"
                required
              />
              <input
                type="number"
                value={newPassenger.age}
                onChange={(e) => setNewPassenger({ ...newPassenger, age: e.target.value })}
                placeholder="Age"
                required
              />
              <select
                value={newPassenger.gender}
                onChange={(e) => setNewPassenger({ ...newPassenger, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit">Add Passenger</button>
            </form>
            <div className="list-container">
              {passengers.map(p => (
                <div key={p.id} className="list-item">
                  <div>
                    <strong>{p.name}</strong> - {p.age} years, {p.gender}
                  </div>
                  <button onClick={() => deletePassenger(p.id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="profile-section">
            <h2>Payment Methods</h2>
            <form onSubmit={addPayment} className="add-form">
              <select
                value={newPayment.type}
                onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
              <input
                type="text"
                value={newPayment.number}
                onChange={(e) => setNewPayment({ ...newPayment, number: e.target.value })}
                placeholder={newPayment.type === 'UPI' ? 'UPI ID' : 'Card Number'}
                required
              />
              <input
                type="text"
                value={newPayment.name}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                placeholder="Cardholder/Account Name"
                required
              />
              <button type="submit">Add Payment Method</button>
            </form>
            <div className="list-container">
              {payments.map(p => (
                <div key={p.id} className="list-item">
                  <div>
                    <strong>{p.type}</strong> - {p.number} ({p.name})
                  </div>
                  <button onClick={() => deletePayment(p.id)} className="delete-btn">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsLoggedIn(!!token);
    setIsAdmin(user.is_admin === 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/search', { state: { source, destination, date } });
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">IRCTC</h1>
          <nav className="nav-menu">
            {!isLoggedIn ? (
              <>
                <button onClick={() => navigate('/login')} className="nav-btn">Login</button>
                <button onClick={() => navigate('/signup')} className="nav-btn signup-btn">Sign Up</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/bookings')} className="nav-btn">My Bookings</button>
                <button onClick={() => navigate('/profile')} className="nav-btn">Profile</button>
                {isAdmin && (
                  <button onClick={() => navigate('/admin')} className="nav-btn admin-btn">Add Train</button>
                )}
                <button onClick={() => {
                  localStorage.clear();
                  setIsLoggedIn(false);
                  navigate('/');
                }} className="nav-btn">Logout</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="home-main">
        <div className="search-section">
          <h2 className="search-title">Book Train Tickets</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label>From</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Source Station"
                  required
                />
              </div>
              <div className="form-group">
                <label>To</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination Station"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Journey Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <button type="submit" className="search-btn">Search Trains</button>
              </div>
            </div>
          </form>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <h3>Quick Booking</h3>
            <p>Book tickets in minutes with our easy-to-use interface</p>
          </div>
          <div className="feature-card">
            <h3>Secure Payment</h3>
            <p>Multiple payment options with secure gateway</p>
          </div>
          <div className="feature-card">
            <h3>Instant Confirmation</h3>
            <p>Get instant booking confirmation and PNR status</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/foreground-1773601924886.png" alt="City" className="nav-logo-link" />
          Urban Pulse
        </div>
      </div>
      
      <div className="navbar-menu">
        <ul className="nav-links">
          <li><Link to="/map" className="nav-link">Home</Link></li>
          <li><Link to="/submit-complaint" className="nav-link">Submit Complaint</Link></li>
          
          {user ? (
            <>
              <li><Link to="/user-dashboard" className="nav-link">My Dashboard</Link></li>
              <li><Link to="/profile" className="nav-link">Profile</Link></li>
              {user.role === 'admin' && (
                <li><Link to="/admin-dashboard" className="nav-link admin-link">Admin Panel</Link></li>
              )}
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" className="nav-link login-link">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await register(form.name, form.email, form.password, form.role);
      
      if (result.success) {
        navigate("/map");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Corner Branding */}
      <Link to="/" className="portal-branding">
        <img src="/assets/foreground-1773601924886.png" alt="Urban Pulse logo" />
        <span>Urban Pulse</span>
      </Link>

      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Join Urban Pulse</h1>
          <p className="signup-subtitle">Create your account to start reporting issues</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="signup-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Account Type</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="user">Citizen (Regular User)</option>
                <option value="admin">City Administrator</option>
              </select>
              <small className="form-help">
                {form.role === 'admin' 
                  ? 'Manage complaints & view analytics'
                  : 'Submit & track city issues'
                }
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
                minLength="6"
              />
              <small className="form-help">Min. 6 characters</small>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary signup-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p className="login-text">
            Already have an account? 
            <Link to="/login" className="auth-nav-link"> Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

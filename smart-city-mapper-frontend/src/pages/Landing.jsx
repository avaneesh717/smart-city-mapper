import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
  return (
    <div className="landing-container fade-in">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="badge">URBAN PULSE</div>
          <h1>
            <span className="glow-text">Urban Intelligence</span>
            <br />
            Redefined.
          </h1>
          <p className="hero-tagline">
            Experience the next generation of citizen engagement. 
            Real-time mapping, AI-powered vision, and seamless urban coordination 
            all within a single, unified command center.
          </p>
          
          <div className="hero-stats glass-box">
            <div className="stat-item">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Live Monitoring</span>
            </div>
            <div className="stat-item">
              <span className="stat-line"></span>
            </div>
            <div className="stat-item">
              <span className="stat-value">AI</span>
              <span className="stat-label">Deep Scan Vision</span>
            </div>
            <div className="stat-item">
              <span className="stat-line"></span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Citizen Focused</span>
            </div>
          </div>

          <div className="cta-group">
            <Link to="/login" className="cta-btn primary-cta">
              <span className="btn-glow"></span>
              <span className="btn-content">Explore Smart City</span>
            </Link>
            <Link to="/signup" className="cta-btn secondary-cta">
              <span className="btn-content">Join the Community</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="core-portal">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="city-hologram">
              <img src="/assets/foreground-1773601924886.png" alt="Urban Pulse" />
            </div>
          </div>
          <div className="data-streams">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`stream stream-${i+1}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-card glass-box">
          <span className="feature-icon">🛰️</span>
          <h3>Live HUD</h3>
          <p>Real-time telemetry and issue tracking across every ward.</p>
        </div>
        <div className="feature-card glass-box">
          <span className="feature-icon">🧠</span>
          <h3>AI Oversight</h3>
          <p>Neural networks verifying city infrastructure in seconds.</p>
        </div>
        <div className="feature-card glass-box">
          <span className="feature-icon">🛡️</span>
          <h3>Secure Sync</h3>
          <p>Encrypted data flow between citizens and command units.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;

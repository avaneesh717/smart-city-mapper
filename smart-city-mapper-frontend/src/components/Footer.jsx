import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main-row">
          <div className="footer-brand">
            <h3>
              <img src="/assets/foreground-1773601924886.png" alt="City" className="footer-logo-img" />
              Urban Pulse
            </h3>
            <p>Building better cities through citizen engagement</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="/map">Home</a></li>
                <li><a href="/submit-complaint">Report Issue</a></li>
                <li><a href="/user-dashboard">User Dashboard</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li><a href="/profile">My Profile</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <ul>
                <li><a href="/support">Support</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Use</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Urban Pulse • Built for a better tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

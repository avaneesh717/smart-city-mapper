import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/complaints/my-complaints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (response.data.success) {
          const userComplaints = response.data.data;
          setStats({
            total: userComplaints.length,
            pending: userComplaints.filter(c => c.status === "Pending").length,
            resolved: userComplaints.filter(c => c.status === "Resolved").length,
            rejected: userComplaints.filter(c => c.status === "Rejected").length
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (!user) return <div className="profile-container"><p className="error-text">No user logged in.</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
        <div className="profile-info-header">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <span className="profile-role-badge">{user.role}</span>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card total glass-box">
          <div className="stat-icon">📄</div>
          <div className="stat-details">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-label">Total Reports</span>
          </div>
        </div>
        <div className="stat-card pending glass-box">
          <div className="stat-icon">⏳</div>
          <div className="stat-details">
            <span className="stat-val">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card resolved glass-box">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <span className="stat-val">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="profile-details-section glass-box">
        <h3>Account Information</h3>
        <div className="details-list">
          <div className="detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Account Type</span>
            <span className="detail-value">{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">March 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

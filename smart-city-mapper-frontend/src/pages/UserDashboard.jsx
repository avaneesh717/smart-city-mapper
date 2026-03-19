import { useState, useEffect } from "react";
import ComplaintCard from "../components/ComplaintCard";
import "./UserDashboard.css";
import axios from "axios";

function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/complaints/my-complaints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch my complaints:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyComplaints();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === "all") return true;
    return complaint.status.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    rejected: complaints.filter(c => c.status === "Rejected").length
  };

  if (isLoading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">📋 My Complaints</h1>
        <p className="dashboard-subtitle">Track and manage your submitted complaints</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter My Complaints</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-btn ${filter === "resolved" ? "active" : ""}`}
            onClick={() => setFilter("resolved")}
          >
            Resolved ({stats.resolved})
          </button>
          <button
            className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      <div className="complaints-section">
        <h3>My Complaints ({filteredComplaints.length})</h3>
        {filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
            {filteredComplaints.map((c, i) => (
              <ComplaintCard
                key={i}
                title={c.title}
                description={c.description}
                location={
                  typeof c.location === 'string' ? c.location : 
                  (c.location?.address || c.location?.city || 'Location Unknown')
                }
                status={c.status}
                createdBy={c.reportedBy?.name || c.reportedBy}
                createdAt={c.createdAt}
                imageUrl={c.imageUrl}
                images={c.images}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No complaints found</h3>
            <p>
              {filter === "all"
                ? "You haven't submitted any complaints yet. Click 'Submit Complaint' to get started!"
                : `No ${filter} complaints found.`
              }
            </p>
            {filter === "all" && (
              <a href="/submit-complaint" className="btn btn-primary">
                Submit Your First Complaint
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

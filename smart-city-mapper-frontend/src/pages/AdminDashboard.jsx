import { useState, useEffect } from "react";
import ComplaintCard from "../components/ComplaintCard";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/complaints?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data.success) {
          setComplaints(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleResolve = async (complaintId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${apiUrl}/api/complaints/${complaintId}`, 
        { status: "Resolved" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.success) {
        setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.data : c));
      }
    } catch (error) {
      console.error("Failed to resolve complaint:", error);
    }
  };

  const handleReject = async (complaintId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.put(`${apiUrl}/api/complaints/${complaintId}`, 
        { status: "Rejected" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.success) {
        setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.data : c));
      }
    } catch (error) {
      console.error("Failed to reject complaint:", error);
    }
  };

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
      <div className="admin-dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1 className="admin-title">🛠️ Admin Dashboard</h1>
        <p className="admin-subtitle">Manage and resolve citizen complaints</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
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
        <h3>Filter Complaints</h3>
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
        <h3>Complaints ({filteredComplaints.length})</h3>
        {filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
            {filteredComplaints.map((complaint, i) => (
              <div key={i} className="complaint-wrapper">
                <ComplaintCard
                  title={complaint.title}
                  description={complaint.description}
                  location={complaint.location?.address || complaint.location}
                  status={complaint.status}
                  createdBy={complaint.reportedBy?.name || complaint.reportedBy || complaint.createdBy}
                  createdAt={complaint.createdAt}
                  imageUrl={complaint.imageUrl}
                  images={complaint.images}
                />
                {complaint.status === "Pending" && (
                  <div className="complaint-actions">
                    <button
                      className="btn btn-success action-btn"
                      onClick={() => handleResolve(complaint._id)}
                    >
                      ✅ Mark as Resolved
                    </button>
                    <button
                      className="btn btn-danger action-btn"
                      onClick={() => handleReject(complaint._id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                {complaint.status === "Resolved" && (
                  <div className="resolved-info">
                    <span className="resolved-badge">✅ Resolved</span>
                    {complaint.resolvedAt && (
                      <small>Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()}</small>
                    )}
                  </div>
                )}
                {complaint.status === "Rejected" && (
                  <div className="rejected-info">
                    <span className="rejected-badge">❌ Rejected</span>
                    {complaint.rejectedAt && (
                      <small>Rejected on {new Date(complaint.rejectedAt).toLocaleDateString()}</small>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No complaints found</h3>
            <p>
              {filter === "all" 
                ? "No complaints have been submitted yet." 
                : `No ${filter} complaints found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

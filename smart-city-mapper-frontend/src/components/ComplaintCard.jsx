import "./ComplaintCard.css";

function ComplaintCard({ title, description, imageUrl, images, status, createdBy, createdAt, location }) {
  const getStatusColor = (status) => {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'resolved':
        return 'resolved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="complaint-card">
      <div className="complaint-header">
        <h3 className="complaint-title">{title}</h3>
        <span className={`status-badge ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {imageUrl && (
        <div className="complaint-image-container">
          <img 
            src={imageUrl} 
            alt={title} 
            className="complaint-image" 
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}

      {images && images.length > 0 && (
        <div className="complaint-images-grid">
          {images.slice(0, 3).map((image, index) => (
            <div key={index} className="complaint-image-item">
              <img 
                src={image.url} 
                alt={`${title} ${index + 1}`} 
                onError={(e) => e.target.parentElement.style.display = 'none'}
              />
            </div>
          ))}
          {images.length > 3 && (
            <div className="more-images">
              +{images.length - 3} more
            </div>
          )}
        </div>
      )}

      <div className="complaint-content">
        <p className="complaint-description">{description}</p>

        {location && (
          <div className="complaint-meta">
            <span className="meta-icon">📍</span>
            <span className="meta-text">{location}</span>
          </div>
        )}

        {createdBy && (
          <div className="complaint-meta">
            <span className="meta-icon">👤</span>
            <span className="meta-text">Reported by {createdBy}</span>
          </div>
        )}

        {createdAt && (
          <div className="complaint-meta">
            <span className="meta-icon">📅</span>
            <span className="meta-text">{formatDate(createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintCard;

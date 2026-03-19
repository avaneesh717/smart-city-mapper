import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useAuth } from "../context/AuthContext";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ComplaintSubmit.css";
import axios from "axios";

// Fix for default marker icon in Leaflet + React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map when coordinates change
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

function ComplaintSubmit() {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
    category: "Road Issues",
    priority: "Medium",
    location: {
      address: "",
      city: "",
      pincode: "",
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    }
  });
  const [images, setImages] = useState([]); // Previews
  const [selectedFiles, setSelectedFiles] = useState([]); // Real File objects
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [model, setModel] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const geocodeTimeout = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("AI Vision Model Loaded");
      } catch (err) {
        console.error("AI Model Load Error:", err);
      }
    };
    loadModel();
  }, []);

  const geocodeAddress = async (addressObj) => {
    const { address, city, pincode } = addressObj;
    if (!address && !city) return null;

    setIsGeocoding(true);
    try {
      const addressParts = address.split(',').map(s => s.trim()).filter(Boolean);
      const queries = [
        `${address}, ${city}, Maharashtra, India`,
        `${addressParts[0]}, ${city}, India`,
        `${addressParts[addressParts.length - 1]}, ${city}, India`,
        `${addressParts[0]}, Mumbai, India`
      ];

      const uniqueQueries = [...new Set(queries)];

      for (const query of uniqueQueries) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const coords = {
              latitude: parseFloat(lat),
              longitude: parseFloat(lon)
            };
            setComplaint(prev => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: coords
              }
            }));
            return coords;
          }
        } catch (innerError) {
          console.warn("Geocoding failed for choice:", query);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Geocoding overall failed:", error);
    } finally {
      setIsGeocoding(false);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedComplaint;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updatedComplaint = {
        ...complaint,
        [parent]: {
          ...complaint[parent],
          [child]: value
        }
      };
    } else {
      updatedComplaint = { ...complaint, [name]: value };
    }

    setComplaint(updatedComplaint);
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith('location.')) {
      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      geocodeTimeout.current = setTimeout(() => {
        geocodeAddress(updatedComplaint.location);
      }, 1500);
    }
  };

  const analyzeImage = async (file) => {
    if (!model) return null;
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const predictions = await model.detect(img);
          const tags = predictions.map(p => ({
            label: p.class,
            score: Math.round(p.score * 100)
          }));
          resolve(tags);
        } catch (err) {
          resolve([]);
        } finally {
          setIsScanning(false);
        }
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...imageUrls]);
    setSelectedFiles(prev => [...prev, ...files]);

    if (files.length > 0 && model) {
      const results = await analyzeImage(files[0]);
      setAiAnalysis(results);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

    try {
      let finalLocation = complaint.location;

      const isDefault = complaint.location.coordinates.latitude === 19.0760 &&
        complaint.location.coordinates.longitude === 72.8777;

      if (isDefault && (complaint.location.address || complaint.location.city)) {
        const fixedCoords = await geocodeAddress(complaint.location);
        if (fixedCoords) {
          finalLocation = { ...complaint.location, coordinates: fixedCoords };
        }
      }

      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // 1. Upload images to Cloudinary via our backend
      const uploadedImages = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
          const uploadRes = await axios.post(`${apiUrl}/api/upload`, formData, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}` 
            }
          });
          
          if (uploadRes.data.success) {
            uploadedImages.push({
              url: uploadRes.data.data.url,
              publicId: uploadRes.data.data.publicId,
              uploadedAt: new Date().toISOString()
            });
          }
        } catch (uploadErr) {
          console.error("Image upload failed for a file:", uploadErr);
          // Continue with other images or fail? Let's notify but continue for now
        }
      }

      // 2. Submit the complaint with real Cloudinary URLs
      const res = await axios.post(`${apiUrl}/api/complaints`,
        {
          ...complaint,
          location: finalLocation,
          images: uploadedImages
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (res.data.success) {
        alert("Complaint synchronized with Smart City Command Center!");
        // Clear local cache if it exists to avoid confusion
        localStorage.removeItem("complaints");

        // Reset form
        setComplaint({
          title: "",
          description: "",
          category: "Road Issues",
          priority: "Medium",
          location: {
            address: "",
            city: "",
            pincode: "",
            coordinates: {
              latitude: 19.0760,
              longitude: 72.8777
            }
          }
        });
        setImages([]);
        setSelectedFiles([]);
        setAiAnalysis([]);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const errorsObj = {};
        err.response.data.errors.forEach(e => {
          errorsObj[e.path] = e.msg;
        });
        setFormErrors(errorsObj);
        alert("Neural Uplink Failure: Validation failed. Please check the marked fields.");
      } else {
        alert("Neural Uplink Failure: Could not submit to central server. " + (err.response?.data?.message || ""));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaint-submit-container">
      <div className="complaint-header">
        <h1>📝 Submit a Complaint</h1>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-section">
          <h3>Complaint Details</h3>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Brief description of the issue"
              value={complaint.title}
              onChange={handleChange}
              className={`form-input ${formErrors.title ? 'is-invalid' : ''}`}
              required
              minLength="3"
            />
            {formErrors.title && <div className="field-error">{formErrors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              placeholder="Provide detailed information about the issue"
              value={complaint.description}
              onChange={handleChange}
              className={`form-input ${formErrors.description ? 'is-invalid' : ''}`}
              rows="4"
              required
              minLength="5"
            />
            {formErrors.description && <div className="field-error">{formErrors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={complaint.category}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Road Issues">Road Issues</option>
                <option value="Water Problems">Water Problems</option>
                <option value="Electricity Issues">Electricity Issues</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Parks & Recreation">Parks & Recreation</option>
                <option value="Traffic Issues">Traffic Issues</option>
                <option value="Noise Complaints">Noise Complaints</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select
                name="priority"
                value={complaint.priority}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location Details</h3>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <input
              type="text"
              name="location.address"
              placeholder="Street address, landmark, or area"
              value={complaint.location.address}
              onChange={handleChange}
              className={`form-input ${formErrors['location.address'] ? 'is-invalid' : ''}`}
              required
              minLength="3"
            />
            {formErrors['location.address'] && <div className="field-error">{formErrors['location.address']}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="location.city"
                placeholder="City name"
                value={complaint.location.city}
                onChange={handleChange}
              className={`form-input ${formErrors['location.city'] ? 'is-invalid' : ''}`}
              required
              minLength="2"
            />
            {formErrors['location.city'] && <div className="field-error">{formErrors['location.city']}</div>}
          </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                name="location.pincode"
                placeholder="6-digit pincode"
                value={complaint.location.pincode}
                onChange={handleChange}
                className={`form-input ${formErrors['location.pincode'] ? 'is-invalid' : ''}`}
                maxLength="6"
                required
                pattern="[0-9]{6}"
              />
              {formErrors['location.pincode'] && <div className="field-error">{formErrors['location.pincode']}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location Preview</h3>
          <p className="form-help">The map will automatically update based on the address you provide above.</p>

          <div className="location-preview-container">
            <MapContainer
              center={[complaint.location.coordinates.latitude, complaint.location.coordinates.longitude]}
              zoom={16}
              scrollWheelZoom={false}
              className="preview-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeView center={[complaint.location.coordinates.latitude, complaint.location.coordinates.longitude]} />
              <Marker position={[complaint.location.coordinates.latitude, complaint.location.coordinates.longitude]} />
            </MapContainer>
            {isGeocoding && (
              <div className="geocoding-overlay">
                <div className="small-spinner"></div>
                <span>Detecting location...</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Images (Optional)</h3>
          <p className="form-help">Upload photos to help describe the issue better</p>

          <div className="image-upload-area">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
            />
            <label htmlFor="image-upload" className="image-upload-label">
              <span className="upload-icon">📷</span>
              <span>Click to upload images</span>
              <small>PNG, JPG, GIF up to 10MB each</small>
            </label>
          </div>

          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  {isScanning && index === 0 && (
                    <div className="ai-scanner-overlay">
                      <div className="laser-beam"></div>
                      <div className="scan-text">AI VISION ACTIVE...</div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {aiAnalysis && aiAnalysis.length > 0 && (
            <div className="ai-results glass-box">
              <div className="ai-header">
                <span className="brain-icon">🧠</span>
                <h4>AI Analysis Results</h4>
              </div>
              <div className="ai-tags">
                {aiAnalysis.map((tag, i) => (
                  <span key={i} className="ai-tag-pill">
                    {tag.label} <small>{tag.score}%</small>
                  </span>
                ))}
              </div>
              <p className="ai-disclaimer">Precision scanning complete. These tags help city drones categorize the issue faster.</p>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={isSubmitting || isGeocoding}
          >
            {isSubmitting || isGeocoding ? (
              <>
                <span className="loading"></span>
                {isGeocoding ? 'Detecting Location...' : 'Submitting...'}
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplaintSubmit;

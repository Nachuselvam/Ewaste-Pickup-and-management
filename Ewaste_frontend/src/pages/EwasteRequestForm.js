// src/pages/EwasteRequestForm.jsx
import React, { useState } from "react";
import { submitEwasteRequest } from "../api/api";
import "../styles/App.css";

const EwasteRequestForm = () => {
  const [formData, setFormData] = useState({
    deviceType: "",
    brand: "",
    model: "",
    deviceCondition: "Working",
    qty: 1,
    pickupAddress: "",
    remarks: "",
  });
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "User";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    for (let file of selectedFiles) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setMessage(`❌ Invalid file type: ${file.name}`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`❌ File too large (max 5MB): ${file.name}`);
        return;
      }
    }

    setImages(selectedFiles);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user || !user.id || !user.email || !user.name) {
      setMessage("❌ User info missing. Please log in again.");
      return;
    }
    if (!formData.deviceType || !formData.brand || !formData.model || !formData.pickupAddress) {
      setMessage("❌ Please fill all required fields.");
      return;
    }
    if (formData.qty < 1) {
      setMessage("❌ Quantity must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call API function with proper parameters
      const response = await submitEwasteRequest(formData, {
        id: user.id,
        email: user.email,
        name: user.name,
        images: images,
      });

      if (response.success) {
        alert("✅ Request submitted successfully!");
        setFormData({
          deviceType: "",
          brand: "",
          model: "",
          deviceCondition: "Working",
          qty: 1,
          pickupAddress: "",
          remarks: "",
        });
        setImages([]);
        setMessage("");
      } else {
        setMessage(response.message || "❌ Failed to submit request.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner">
            <img src="/spinner.gif" alt="Loading..." />
            <p>Submitting your request...</p>
          </div>
        </div>
      )}

      <div className="form-container">
        <h2 className="form-title">📦 Submit E-Waste Request</h2>
        <p style={{ textAlign: "center", marginBottom: "15px" }}>
          Logged in as <strong>{username}</strong>
        </p>

        {message && <p className="form-message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label>Device Type:</label>
          <input
            type="text"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
            placeholder="e.g., Laptop, Mobile, AC"
            required
          />

          <label>Brand:</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Dell, Samsung"
            required
          />

          <label>Model:</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., Inspiron 15"
            required
          />

          <label>Condition:</label>
          <select
            name="deviceCondition"
            value={formData.deviceCondition}
            onChange={handleChange}
          >
            <option value="Working">Working</option>
            <option value="Damaged">Damaged</option>
            <option value="Dead">Dead</option>
          </select>

          <label>Quantity:</label>
          <input
            type="number"
            name="qty"
            min="1"
            value={formData.qty}
            onChange={handleChange}
            required
          />

          <label>Pickup Address:</label>
          <textarea
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder="Enter pickup address"
            required
          />

          <label>Upload Images:</label>
          <input type="file" name="images" multiple onChange={handleFileChange} />

          {images.length > 0 && (
            <div className="image-preview">
              {images.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: "80px", margin: "5px", borderRadius: "4px" }}
                />
              ))}
            </div>
          )}

          <label>Remarks:</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Any special instructions?"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "🚀 Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EwasteRequestForm;

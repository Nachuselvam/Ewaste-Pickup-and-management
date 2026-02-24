// src/pages/PickupPersonnelList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPickupPersonnels } from "../api/api";
import API from "../api/api"; // For delete request
import "../styles/App.css";

const PickupPersonnelList = () => {
  const [loading, setLoading] = useState(true);
  const [personnels, setPersonnels] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadPersonnels = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchPickupPersonnels();
      if (!Array.isArray(data)) {
        setError("❌ Unexpected response from server.");
      } else if (data.length === 0) {
        setError("No Pickup Personnels Found");
      } else {
        setPersonnels(data);
      }
    } catch (err) {
      console.error("Error fetching pickup personnels:", err);
      setError("❌ Failed to fetch pickup personnels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonnels();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this personnel?")) return;

    try {
      await API.delete(`/users/${id}`);
      alert("✅ Personnel deleted successfully.");
      loadPersonnels(); // refresh list
    } catch (err) {
      console.error("Error deleting personnel:", err);
      alert("❌ Failed to delete personnel.");
    }
  };

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner">
          <img src="/spinner.gif" alt="Loading..." />
          <p>Loading Pickup Personnels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pickup-list-container">
      <div className="pickup-header">
        <h2>👥 Pickup Personnels</h2>
        <button
          className="add-new-btn"
          onClick={() => navigate("/add-pickup-person")}
        >
          ➕ Add New
        </button>
      </div>

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button className="retry-btn" onClick={loadPersonnels}>
            🔄 Retry
          </button>
        </div>
      )}

      <div className="personnel-cards">
        {personnels.map((user) => (
          <div className="personnel-card" key={user.id}>
            <h3>{user.name || "-"}</h3>
            <p><strong>Email:</strong> {user.email || "-"}</p>
            <p><strong>Phone:</strong> {user.phone || "-"}</p>
            <p><strong>Address:</strong> {user.address || "-"}</p>
            <div className="personnel-actions">
              <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickupPersonnelList;

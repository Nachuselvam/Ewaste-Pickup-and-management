// src/pages/AddPickupPersonnel.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPickupPersonnel } from "../api/api";
import "../styles/App.css";

const AddPickupPersonnel = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const personnelData = { name: fullName, email, phone, address, password: "pickuppass" };

    try {
      const res = await addPickupPersonnel(personnelData);
      const msg = res.message || "❌ Failed to add personnel.";
      setMessage(msg);

      if (msg.toLowerCase().includes("successful") || msg.toLowerCase().includes("updated")) {
        setTimeout(() => navigate("/pickup-personnels"), 1000);
      }
    } catch (err) {
      console.error("Add Pickup Personnel Error:", err);
      setMessage("❌ Failed to add personnel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-overlay">
        <h2>➕ Add New Pickup Personnel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Personnel"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              color: message.toLowerCase().includes("successful") ? "green" : "red",
              fontWeight: "500",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddPickupPersonnel;

import React, { useState, useEffect } from "react";
import { fetchPickupPersonnels } from "../api/api";
import API from "../api/api";

const SchedulePickupModal = ({ requestId, onClose, onScheduled }) => {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupPersonnelId, setPickupPersonnelId] = useState("");
  const [pickupPersonnelName, setPickupPersonnelName] = useState("");
  const [pickupPersonnelEmail, setPickupPersonnelEmail] = useState("");
  const [pickupPersons, setPickupPersons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all pickup personnel when modal opens
  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const personnels = await fetchPickupPersonnels();
        console.log("Fetched Pickup Personnel:", personnels);
        setPickupPersons(personnels);
      } catch (err) {
        console.error("Error fetching pickup personnel:", err);
        setPickupPersons([]);
      }
    };
    fetchPersonnel();
  }, []);

  const handlePersonnelChange = (e) => {
    const selectedId = e.target.value;
    setPickupPersonnelId(selectedId);

    const selectedPerson = pickupPersons.find((p) => String(p.id) === selectedId);
    if (selectedPerson) {
      setPickupPersonnelName(selectedPerson.name);
      setPickupPersonnelEmail(selectedPerson.email);
    } else {
      setPickupPersonnelName("");
      setPickupPersonnelEmail("");
    }
  };

  const handleSchedule = async () => {
    if (!pickupDate || !pickupTime || !pickupPersonnelId || !pickupPersonnelName || !pickupPersonnelEmail) {
      alert("⚠️ All fields are required.");
      return;
    }

    // Combine date and time without timezone (for backend LocalDateTime)
    const pickupDateTime = `${pickupDate}T${pickupTime}`;

    try {
      setLoading(true);

      const response = await API.put(`/ewaste/${requestId}/schedule`, {
        pickupDateTime,
        pickupPersonnelId,
        pickupPersonnelName,
        pickupPersonnelEmail,
      });

      alert("✅ Pickup scheduled successfully!");
      onScheduled(response.data);
      onClose();
    } catch (err) {
      console.error("Schedule pickup error:", err);
      const msg = err.response?.data || "⚠️ Failed to schedule pickup.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h3>Schedule Pickup</h3>

      <label>
        Date:
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          required
        />
      </label>

      <label>
        Time:
        <input
          type="time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        />
      </label>

      <label>
        Pickup Person:
        <select value={pickupPersonnelId} onChange={handlePersonnelChange} required>
          <option value="">-- Select Pickup Person --</option>
          {pickupPersons.length > 0 ? (
            pickupPersons.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.id}] {p.name} ({p.address})
              </option>
            ))
          ) : (
            <option value="" disabled>
              No pickup personnel available
            </option>
          )}
        </select>
      </label>

      <button onClick={handleSchedule} disabled={loading}>
        {loading ? "Scheduling..." : "Schedule"}
      </button>
      <button onClick={onClose} disabled={loading}>
        Cancel
      </button>
    </div>
  );
};

export default SchedulePickupModal;

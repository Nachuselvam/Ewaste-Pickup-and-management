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

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const personnels = await fetchPickupPersonnels();
        setPickupPersons(personnels || []);
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

    const selectedPerson = pickupPersons.find(
      (p) => String(p.id) === selectedId
    );
    if (selectedPerson) {
      setPickupPersonnelName(selectedPerson.name);
      setPickupPersonnelEmail(selectedPerson.email);
    } else {
      setPickupPersonnelName("");
      setPickupPersonnelEmail("");
    }
  };

  const handleSchedule = async () => {
    if (!pickupDate || !pickupTime || !pickupPersonnelId) {
      alert("⚠️ All fields are required.");
      return;
    }

    const pickupDateTime = `${pickupDate}T${pickupTime}`;

    try {
      setLoading(true);

      const response = await API.put(`/ewaste/${requestId}/schedule`, {
        pickupDateTime,
        pickupPersonnelId,
        pickupPersonnelName,
        pickupPersonnelEmail,
      });

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
    <>
      {/* ===== CSS INSIDE SAME FILE ===== */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content.schedule-modal {
          background: #ffffff;
          padding: 24px 28px;
          border-radius: 14px;
          width: 380px;
          max-width: 95%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          animation: popIn 0.2s ease-out;
        }

        .modal-content.schedule-modal h3 {
          text-align: center;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 6px;
          color: #333;
        }

        .form-group input,
        .form-group select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
          opacity: 0.95;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
          border: none;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }

        .btn-secondary:hover {
          background: #d5d5d5;
          transform: translateY(-1px);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        @keyframes popIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {/* ===== MODAL UI ===== */}
      <div className="modal-overlay">
        <div className="modal-content schedule-modal">
          <h3>📅 Schedule Pickup</h3>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
          <label>Pickup Person</label>
          <select
            value={pickupPersonnelId}
            onChange={handlePersonnelChange}
            required
          >
            <option value="">-- Select Pickup Person --</option>

            {pickupPersons.length > 0 ? (
              pickupPersons.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.name} - {p.address}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No pickup personnel available
              </option>
            )}
          </select>
        </div>


          <div className="modal-actions">
            <button
              className="btn-primary"
              onClick={handleSchedule}
              disabled={loading}
            >
              {loading ? "Scheduling..." : "✅ Schedule"}
            </button>
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SchedulePickupModal;

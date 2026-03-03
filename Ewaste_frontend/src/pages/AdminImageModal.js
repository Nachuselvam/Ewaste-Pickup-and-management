import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "80%",
  maxWidth: "900px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 0 20px rgba(0,0,0,0.5)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "15px",
  marginTop: "15px",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  maxHeight: "400px",
  objectFit: "contain",
  borderRadius: "8px",
  border: "1px solid #ccc",
  cursor: "zoom-in",
  transition: "transform 0.2s ease",
};

const closeBtnStyle = {
  marginTop: "15px",
  padding: "8px 16px",
  background: "#e53935",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const AdminImageModal = ({ images, onClose }) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>🖼️ Uploaded Images</h2>

        {!images || images.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            ❌ No images uploaded for this request.
          </p>
        ) : (
          <div style={gridStyle}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Uploaded ${idx}`}
                style={imageStyle}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                onClick={(e) => {
                  // simple zoom toggle
                  if (e.target.style.transform === "scale(1.8)") {
                    e.target.style.transform = "scale(1)";
                    e.target.style.cursor = "zoom-in";
                  } else {
                    e.target.style.transform = "scale(1.8)";
                    e.target.style.cursor = "zoom-out";
                  }
                }}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <button style={closeBtnStyle} onClick={onClose}>
            ✖ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminImageModal;

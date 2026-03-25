import React, { useEffect, useState } from "react";
import "../styles/App.css";

const ProfileSettings = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-bg full-page">
        <p className="no-user">⚠️ No user data found. Please log in.</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <div className="profile-bg full-page">
      <header className="profile-header">
        <div className="avatar">{initials}</div>
        <h1>{user.name}</h1>
        <p className="role">{user.role || "User"}</p>
      </header>

      <main className="profile-main">
        <div className="profile-grid">
          <div className="grid-item">📝 <strong>Name:</strong> {user.name}</div>
          <div className="grid-item">📧 <strong>Email:</strong> {user.email}</div>
          <div className="grid-item">🆔 <strong>User ID:</strong> {user.id}</div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn">✏️ Edit Profile</button>
          <button className="logout-btn">🚪 Logout</button>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettings;

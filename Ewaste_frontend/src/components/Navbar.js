// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/App.css";
import { AuthContext } from "../App";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  // ✅ Logout function
  const handleLogout = useCallback(() => {
    setAuth({ token: null, role: null });
    localStorage.clear();
    navigate("/"); // redirect to home
  }, [setAuth, navigate]);

  // ✅ Auto-logout on tab close or refresh
  useEffect(() => {
    window.addEventListener("beforeunload", handleLogout);
    return () => {
      window.removeEventListener("beforeunload", handleLogout);
    };
  }, [handleLogout]);

  return (
    <nav className="navbar">
      <img
        src="/logo.png"
        alt="Logo"
        className="logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      />

      <div className="nav-links">
        {!auth.token ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/register">Register</Link>

            <div
              className="dropdown"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button className="dropdown-toggle">Login ▾</button>
              {open && (
                <div className="dropdown-menu">
                  <Link to="/login">User Login</Link>
                  <Link to="/admin-login">Admin Login</Link>
                  <Link to="/pickup-login">Pickup Person Login</Link> {/* ✅ Added */}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* ✅ Dynamic Dashboard Link */}
            <Link
              to={
                auth.role === "ADMIN"
                  ? "/admin-dashboard"
                  : auth.role === "PICKUP"
                  ? "/pickup-personnel-dashboard"
                  : "/user-dashboard"
              }
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              style={{
                marginLeft: "15px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

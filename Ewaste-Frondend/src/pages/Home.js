import React from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";
import "../components/Navbar";

const Home = () => {
  return (
    <>
      {/* 🌱 Existing Hero Section */}
      <div className="home-container">
        <div className="home-content">
          <img src="/logo.png" alt="Logo" className="home-logo" />
          <h1>Welcome to eWaste Management</h1>
          <p>
            A smart solution to reduce, reuse, and recycle e-waste responsibly.
            Join us in creating a cleaner and greener future!
          </p>
          <Link to="/register">
            <button className="get-started-btn">Get Started</button>
          </Link>
        </div>
      </div>

      {/* 🌱 Existing Cards */}
      <div className="home-cards-container">
        <div className="home-card">
          <div className="icon">♻️</div>
          <h3>Recycle Smarter</h3>
          <p>Track and manage your e-waste disposal effectively.</p>
        </div>
        <div className="home-card">
          <div className="icon">🌍</div>
          <h3>Eco-Friendly</h3>
          <p>Contribute towards a sustainable environment.</p>
        </div>
        <div className="home-card">
          <div className="icon">📊</div>
          <h3>Easy Monitoring</h3>
          <p>Get insights into your recycling activities instantly.</p>
        </div>
      </div>

      {/* ✨ NEW: Features Section */}
      <section className="home-features">
        <h2>Why Choose Our Platform?</h2>
        <div className="feature-list">
          <div className="feature-item">
            <h4>Real-Time Tracking</h4>
            <p>Monitor your e-waste collections and pickups in real time.</p>
          </div>
          <div className="feature-item">
            <h4>User-Friendly Dashboard</h4>
            <p>Get a clear view of your recycling activities with detailed insights.</p>
          </div>
          <div className="feature-item">
            <h4>Reward System</h4>
            <p>Earn points and rewards for every successful recycling action.</p>
          </div>
        </div>
      </section>

      {/* ✨ NEW: How It Works */}
      <section className="home-how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Register & create your account.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Schedule a pickup for your e-waste.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Track disposal and earn rewards!</p>
          </div>
        </div>
      </section>

      {/* ✨ NEW: CTA Footer */}
      <section className="home-cta">
        <h2>Start Your Green Journey Today 🌿</h2>
        <p>
          Together, we can create a sustainable future. Take your first step
          towards responsible e-waste management.
        </p>
        <Link to="/register">
          <button className="cta-btn">Join Now</button>
        </Link>
      </section>
    </>
  );
};

export default Home;

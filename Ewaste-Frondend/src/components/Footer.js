import React from "react";
import "../index.css";

function Footer() {
  return (
    <footer className="footer">
      {/* About Section */}
      <div className="footer-about">
        <h3>About E-Waste Management</h3>
        <p>
          We are dedicated to helping individuals and businesses recycle their 
          electronic waste responsibly. Our mission is to reduce environmental 
          impact and promote sustainability.
        </p>
      </div>

      {/* Quick Links */}
      <div className="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/donate">Donate E-Waste</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>

      {/* Contact Info */}
      <div className="footer-contact">
        <h4>Contact Us</h4>
        <p>Email: support@ewaste.com</p>
        <p>Phone: +91 9876543210</p>
        <p>Address: 123 Green Street, Chennai, India</p>
      </div>

      {/* Social Media */}
      <div className="footer-social">
        <h4>Follow Us</h4>
        <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a> | 
        <a href="https://twitter.com" target="_blank" rel="noreferrer"> Twitter</a> | 
        <a href="https://instagram.com" target="_blank" rel="noreferrer"> Instagram</a> |
        <a href="https://linkedin.com" target="_blank" rel="noreferrer"> LinkedIn</a>
      </div>

      {/* Newsletter */}
      <div className="footer-newsletter">
        <h4>Subscribe to our Newsletter</h4>
        <form>
          <input type="email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} E-Waste Management | All Rights Reserved</p>
        <div>
          <a href="/privacy">Privacy Policy</a> | 
          <a href="/terms"> Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

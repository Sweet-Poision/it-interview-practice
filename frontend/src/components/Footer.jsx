import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="copyright">© {new Date().getFullYear()} Practice Plan. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">Privacy</Link>
          <a href="#" className="footer-link">Contact</a>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/utsavraj-dev/" target="_blank" rel="noopener noreferrer" className="social-link">
              <Linkedin size={20} />
            </a>
            <a href="https://github.com/sweet-poision" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="GitHub">
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
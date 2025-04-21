import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} React + Python 应用. 保留所有权利.</p>
      </div>
    </footer>
  );
}

export default Footer; 
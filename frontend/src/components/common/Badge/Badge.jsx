import React from 'react';
import './Badge.css';

const Badge = ({ status, children }) => {
  const badgeClass = status === 'Published' ? 'badge-published' : 'badge-draft';
  return <span className={`status-badge ${badgeClass}`}>{children || status}</span>;
};

export default Badge; 
import React from 'react';
import './Badge.css';

const Badge = ({ status, children, type }) => {
  let badgeClass = 'badge-draft';
  
  // 2024-05-25: 根据不同状态设置不同样式
  // 2024-05-09: 添加Required类型的badge支持
  if (type === 'required') {
    badgeClass = 'badge-required';
  } else if (status === 'Published') {
    badgeClass = 'badge-published';
  } else if (status === 'Completed') {
    badgeClass = 'badge-completed';
  } else if (status === 'Draft') {
    badgeClass = 'badge-draft';
  } else if (status === 'Partial') {
    badgeClass = 'badge-partial';
  }
  
  return <span className={`status-badge ${badgeClass}`}>{children || status}</span>;
};

export default Badge; 
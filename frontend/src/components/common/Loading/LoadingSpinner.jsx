import React from 'react';
import './Loading.css';

/**
 * 基础的加载动画组件
 * @param {Object} props - 组件属性
 * @param {string} [props.size='medium'] - 加载动画尺寸，可选：'small', 'medium', 'large'
 * @param {string} [props.color] - 加载动画颜色（可选，默认从CSS继承）
 * @param {string} [props.className] - 附加类名
 * 
 * 2024-08-22T16:20:00Z 创建：基础LoadingSpinner组件
 */
const LoadingSpinner = ({ size = 'medium', color, className = '', ...props }) => {
  const sizeClass = size !== 'medium' ? size : '';
  const customStyle = color ? { borderTopColor: color } : {};
  
  return (
    <div 
      className={`loading-spinner ${sizeClass} ${className}`} 
      style={customStyle}
      {...props}
    />
  );
};

export default LoadingSpinner; 
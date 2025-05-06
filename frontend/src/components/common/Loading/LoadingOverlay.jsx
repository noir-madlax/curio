import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Loading.css';

/**
 * 加载覆盖层组件，用于覆盖在内容上方显示加载状态
 * @param {Object} props - 组件属性
 * @param {boolean} [props.isVisible=true] - 是否显示覆盖层
 * @param {string} [props.message='Processing...'] - 加载提示文本
 * @param {string} [props.spinnerSize='medium'] - 加载动画尺寸
 * @param {string} [props.spinnerColor] - 加载动画颜色
 * @param {string} [props.className] - 附加类名
 * 
 * 2024-08-22T16:30:00Z 创建：加载覆盖层组件
 */
const LoadingOverlay = ({ 
  isVisible = true,
  message = 'Processing...', 
  spinnerSize = 'medium',
  spinnerColor,
  className = '',
  ...props 
}) => {
  if (!isVisible) return null;
  
  return (
    <div className={`loading-overlay ${className}`} {...props}>
      <LoadingSpinner size={spinnerSize} color={spinnerColor} />
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
};

export default LoadingOverlay; 
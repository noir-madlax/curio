import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Loading.css';

/**
 * 全页面加载组件，适用于整个页面的加载状态
 * @param {Object} props - 组件属性
 * @param {string} [props.message='Loading...'] - 加载提示文本
 * @param {string} [props.spinnerSize='medium'] - 加载动画尺寸
 * @param {string} [props.spinnerColor] - 加载动画颜色
 * @param {string} [props.className] - 附加类名
 * 
 * 2024-08-22T16:25:00Z 创建：全页面加载组件
 */
const FullPageLoading = ({ 
  message = 'Loading...', 
  spinnerSize = 'medium',
  spinnerColor,
  className = '',
  ...props 
}) => {
  return (
    <div className={`loading-container ${className}`} {...props}>
      <LoadingSpinner size={spinnerSize} color={spinnerColor} />
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
};

export default FullPageLoading; 
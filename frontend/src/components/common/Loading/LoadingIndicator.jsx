import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Loading.css';

/**
 * 局部加载指示器组件，用于显示某个元素或操作的加载状态
 * @param {Object} props - 组件属性
 * @param {boolean} [props.isLoading=true] - 是否显示加载状态
 * @param {string} [props.text='Loading...'] - 加载提示文本
 * @param {boolean} [props.showText=true] - 是否显示文本
 * @param {string} [props.className] - 附加类名
 * 
 * 2024-08-22T16:35:00Z 创建：局部加载指示器组件
 */
const LoadingIndicator = ({ 
  isLoading = true, 
  text = 'Loading...', 
  showText = true,
  className = '',
  ...props 
}) => {
  if (!isLoading) return null;
  
  return (
    <span className={`loading-indicator ${className}`} {...props}>
      <LoadingSpinner size="small" />
      {showText && <span className="loading-indicator-text">{text}</span>}
    </span>
  );
};

export default LoadingIndicator; 
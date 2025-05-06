import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './Loading.css';

/**
 * 内联加载组件，用于行内显示加载状态
 * @param {Object} props - 组件属性
 * @param {string} [props.text='Loading...'] - 加载提示文本
 * @param {boolean} [props.showText=true] - 是否显示文本
 * @param {string} [props.className] - 附加类名
 * 
 * 2024-08-22T16:40:00Z 创建：内联加载组件
 */
const InlineLoading = ({ 
  text = 'Loading...', 
  showText = true,
  className = '',
  ...props 
}) => {
  return (
    <span className={`loading-inline ${className}`} {...props}>
      <LoadingSpinner size="small" />
      {showText && <span>{text}</span>}
    </span>
  );
};

export default InlineLoading; 
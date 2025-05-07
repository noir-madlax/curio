import React from 'react';
import Button from '../Button/Button';
import publishIcon from '../../../assets/icons/publish_icon.svg';

/**
 * 通用的发布/分享按钮组件
 * @param {boolean} isPublished - 问卷是否已发布
 * @param {function} onPublish - 点击按钮时的回调函数
 * @param {boolean} disabled - 是否禁用按钮
 * @param {boolean} isLoading - 是否显示加载状态
 */
const PublishButton = ({ isPublished, onPublish, disabled = false, isLoading = false }) => {
  // 根据发布状态决定按钮文本
  const buttonText = isPublished ? 'Share Survey' : 'Publish';
  
  // 根据禁用状态决定按钮变体和图标样式
  const buttonVariant = disabled ? "disabled" : "success";
  
  return (
    <Button 
      variant={buttonVariant} 
      icon={
        <img 
          src={publishIcon} 
          alt="Publish" 
          className="button-icon" 
          style={{ 
            filter: disabled ? 'none' : 'brightness(0) invert(1)',  // 禁用时使用原始颜色，启用时转为白色
            opacity: disabled ? 0.5 : 1
          }} 
        />
      }
      onClick={onPublish}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Processing...' : buttonText}
    </Button>
  );
};

export default PublishButton; 
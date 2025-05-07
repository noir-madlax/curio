import React from 'react';
import './SurveyHeader.css';

/**
 * 统一的问卷头部组件
 * 2024-10-14: 创建公共组件，统一问卷头部样式
 * @param {string} title - 问卷标题
 * @param {React.ReactNode} rightContent - 右侧内容区域，通常是操作按钮
 * @param {React.ReactNode} leftContent - 左侧标题旁边的额外内容，如状态标签
 * @param {Object} style - 额外的样式对象
 */
const SurveyHeader = ({ 
  title = 'Untitled Survey', 
  rightContent = null, 
  leftContent = null,
  style = {}
}) => {
  return (
    <div className="survey-header" style={style}>
      <div className="header-left">
        <h1 className="survey-title">{title}</h1>
        {leftContent}
      </div>
      
      {rightContent && (
        <div className="header-actions">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default SurveyHeader; 
import React from 'react';
import './SurveyDescription.css';

/**
 * 统一的问卷描述组件
 * 2024-10-14: 创建公共组件，统一问卷描述样式
 * @param {string} description - 问卷描述文本
 * @param {boolean} showLabel - 是否显示描述标签
 * @param {string} labelText - 标签文本，默认为"Description"
 * @param {Object} style - 额外的样式对象
 */
const SurveyDescription = ({ 
  description = '', 
  showLabel = false,
  labelText = 'Description',
  style = {}
}) => {
  if (!description) return null;
  
  return (
    <div className="survey-description-container" style={style}>
      {showLabel && (
        <span className="description-label">{labelText}:</span>
      )}
      <p className="survey-description">{description}</p>
    </div>
  );
};

export default SurveyDescription; 
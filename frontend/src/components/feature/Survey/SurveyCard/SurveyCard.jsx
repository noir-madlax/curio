import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import './SurveyCard.css';

// 引入SVG图标
import responsesIcon from '../../../../assets/icons/responses_icon.svg';
import completionIcon from '../../../../assets/icons/completion_icon.svg';
import resultsIcon from '../../../../assets/icons/results_icon.svg';
import viewIcon from '../../../../assets/icons/view1_icon.svg';
import insightsIcon from '../../../../assets/icons/insights_icon.svg';
import editIcon from '../../../../assets/icons/edit_icon.svg';
import deleteIcon from '../../../../assets/icons/delete_icon.svg';

// 导入删除服务
import { deleteSurvey } from '../../../../services/surveyService';

// 创建图标组件
const ResponsesIcon = () => <img src={responsesIcon} alt="Responses" className="icon" />;
const CompletionIcon = () => <img src={completionIcon} alt="Completion" className="icon" />;
const ResultsIcon = () => <img src={resultsIcon} alt="Results" className="icon" />;
const ViewIcon = () => <img src={viewIcon} alt="View" className="icon" />;
const InsightsIcon = () => <img src={insightsIcon} alt="Insights" className="icon" />;
const EditIcon = () => <img src={editIcon} alt="Edit" className="icon" />;
const DeleteIcon = () => <img src={deleteIcon} alt="Delete" className="icon" />;

const SurveyCard = ({ survey, onDelete }) => {
  const navigate = useNavigate();
  const { title, status, updatedAt, responses, completionRate, id } = survey;
  // 2024-08-07T09:45:00Z 新增：添加loading状态
  const [isLoading, setIsLoading] = useState(false);
  // 2024-08-07T16:00:00Z 新增：添加hover状态
  const [isHovered, setIsHovered] = useState(false);
  // 2024-08-07T16:00:00Z 新增：添加删除确认状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 2024-07-30T12:30:00Z 新增：处理编辑按钮点击
  const handleEdit = () => {
    navigate(`/surveys/edit/${id}`);
  };
  
  // 2024-05-24: 更新Results按钮处理函数，导航到SurveyResult页面
  const handleResults = () => {
    navigate(`/surveys/${id}/results`);
  };
  
  const handleView = () => {
    // 2024-08-07T16:00:00Z 修改：导航到查看页面而非回答页面
    navigate(`/surveys/view/${id}`);
  };
  
  // 2024-07-25: 更新Insights按钮处理函数，导航到SurveyInsight页面
  const handleInsights = () => {
    navigate(`/surveys/${id}/insights`);
  };
  
  // 2024-08-07T16:00:00Z 新增：处理删除按钮点击
  const handleDeleteClick = async () => {
    if (showDeleteConfirm) {
      setIsLoading(true);
      try {
        await deleteSurvey(id);
        // 如果传入了onDelete回调，通知父组件更新列表
        if (onDelete) {
          onDelete(id);
        }
      } catch (error) {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey. Please try again.');
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  // 2024-08-07T16:00:00Z 新增：处理取消删除
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  return (
    <div 
      className="survey-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDeleteConfirm(false);
      }}
    >
      <div className="survey-card-header">
        <div className="survey-status">
          <Badge status={status}>{status}</Badge>
          <span className="update-time">{updatedAt}</span>
        </div>
        
        {/* 2024-08-07T16:00:00Z 新增：悬停时显示删除按钮 */}
        {isHovered && (
          <div className="hover-delete">
            {showDeleteConfirm ? (
              <div className="delete-confirm">
                <span>Sure to delete?</span>
                <button onClick={handleCancelDelete} disabled={isLoading}>Cancel</button>
                <button onClick={handleDeleteClick} disabled={isLoading}>Confirm</button>
              </div>
            ) : (
              <button 
                className="delete-button" 
                onClick={handleDeleteClick}
                disabled={isLoading}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        )}
      </div>
      
      <h3 className="survey-title">{title}</h3>
      
      <div className="survey-stats">
        <div className="stat-item">
          <ResponsesIcon />
          <span className="stat-text">{responses} responses</span>
        </div>
        
        {status === 'Published' && (
          <div className="stat-item">
            <CompletionIcon />
            <div className="completion-rate">
              <span className="rate-value">{completionRate}%</span>
              <span className="rate-label">completion</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="survey-actions">
        {status === 'Published' ? (
          <>
            <Button variant="secondary" icon={<ResultsIcon />} onClick={handleResults}>Results</Button>
            <Button 
              variant="secondary" 
              icon={<ViewIcon />} 
              onClick={handleView}
              disabled={isLoading}
            >
              {isLoading ? 'Opening...' : 'View'}
            </Button>
            <Button variant="secondary" icon={<InsightsIcon />} onClick={handleInsights}>Insights</Button>
          </>
        ) : (
          <Button variant="secondary" className="edit-btn" icon={<EditIcon />} onClick={handleEdit}>Edit</Button>
        )}
      </div>
    </div>
  );
};

export default SurveyCard; 
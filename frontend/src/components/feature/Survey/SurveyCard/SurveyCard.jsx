import React from 'react';
import Badge from '../../../common/Badge/Badge';
import Button from '../../../common/Button/Button';
import './SurveyCard.css';

// 引入SVG图标
import responsesIcon from '../../../../assets/icons/responses_icon.svg';
import completionIcon from '../../../../assets/icons/completion_icon.svg';
import resultsIcon from '../../../../assets/icons/results_icon.svg';
import viewIcon from '../../../../assets/icons/view_icon.svg';
import insightsIcon from '../../../../assets/icons/insights_icon.svg';
import editIcon from '../../../../assets/icons/edit_icon.svg';

// 创建图标组件
const ResponsesIcon = () => <img src={responsesIcon} alt="Responses" className="icon" />;
const CompletionIcon = () => <img src={completionIcon} alt="Completion" className="icon" />;
const ResultsIcon = () => <img src={resultsIcon} alt="Results" className="icon" />;
const ViewIcon = () => <img src={viewIcon} alt="View" className="icon" />;
const InsightsIcon = () => <img src={insightsIcon} alt="Insights" className="icon" />;
const EditIcon = () => <img src={editIcon} alt="Edit" className="icon" />;

const SurveyCard = ({ survey }) => {
  const { title, status, updatedAt, responses, completionRate } = survey;
  
  return (
    <div className="survey-card">
      <div className="survey-card-header">
        <div className="survey-status">
          <Badge status={status}>{status}</Badge>
          <span className="update-time">Updated {updatedAt}</span>
        </div>
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
            <Button variant="secondary" icon={<ResultsIcon />}>Results</Button>
            <Button variant="secondary" icon={<ViewIcon />}>View</Button>
            <Button variant="secondary" icon={<InsightsIcon />}>Insights</Button>
          </>
        ) : (
          <Button variant="secondary" className="edit-btn" icon={<EditIcon />}>Edit</Button>
        )}
      </div>
    </div>
  );
};

export default SurveyCard; 
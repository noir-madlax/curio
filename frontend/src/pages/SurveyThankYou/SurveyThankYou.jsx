import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import './SurveyThankYou.css';

// 2024-10-11T22:45:00Z 新增：感谢页面组件
const SurveyThankYou = () => {
  const { id } = useParams();

  return (
    <MainLayout>
      <div className="thank-you-container">
        <div className="thank-you-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#E8F5E9"/>
              <path d="M36 50.3L24.7 39L21.5 42.2L36 56.7L66 26.7L62.8 23.5L36 50.3Z" fill="#4CAF50"/>
            </svg>
          </div>
          <h1>Thank You!</h1>
          <p>Your response has been successfully submitted.</p>
          <p>We appreciate your feedback and time.</p>
          
          <div className="action-buttons">
            <Link to={`/surveys`} className="action-button primary">
              Back to Surveys
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SurveyThankYou; 
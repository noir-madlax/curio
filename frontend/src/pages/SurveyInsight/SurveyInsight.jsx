import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Badge from '../../components/common/Badge/Badge';
// 2024-10-14: 导入公共组件
import SurveyHeader from '../../components/common/SurveyHeader';
import './SurveyInsight.css';

// 2024-07-24: 模拟数据，用于静态页面展示
const mockSurveyData = {
  id: 's-001',
  title: 'Customer Satisfaction Survey',
  status: 'Published',
  summary: 'Overall, customer satisfaction is high with 65% positive sentiment across all responses. The product\'s user interface and customer support are particularly well-received, while documentation and mobile experience present opportunities for improvement.',
  sentiment: {
    positive: 65,
    neutral: 25,
    negative: 10
  },
  keyInsights: [
    {
      id: 'ki-001',
      text: 'Users in the enterprise segment report higher satisfaction than small business users'
    },
    {
      id: 'ki-002',
      text: 'Adding integration with third-party tools was the most requested feature'
    },
    {
      id: 'ki-003',
      text: 'Documentation clarity was frequently mentioned as needing improvement'
    },
    {
      id: 'ki-004',
      text: 'Mobile app performance is significantly lower rated than desktop'
    },
    {
      id: 'ki-005',
      text: 'Customer support response time received high satisfaction ratings'
    },
    {
      id: 'ki-006',
      text: 'Users consistently praise the intuitive user interface design'
    }
  ],
  recommendedActions: [
    {
      id: 'ra-001',
      text: 'Create segment-specific onboarding flows for small business users'
    },
    {
      id: 'ra-002',
      text: 'Develop additional integrations with popular third-party tools'
    },
    {
      id: 'ra-003',
      text: 'Revise documentation with more examples and clearer instructions'
    },
    {
      id: 'ra-004',
      text: 'Improve mobile app performance with focus on loading speed'
    }
  ]
};

// 2024-07-24: 占位图标组件
const PlaceholderIcon = ({ className }) => (
  <div className={`placeholder-icon ${className}`}></div>
);

const SurveyInsight = () => {
  // 获取URL参数
  const { surveyId } = useParams();
  
  // 使用模拟数据
  const survey = mockSurveyData;
  
  return (
    <MainLayout>
      <div className="survey-insight-container">
        {/* 2024-10-14: 使用SurveyHeader公共组件替换原有的header结构 */}
        <SurveyHeader
          title={survey.title}
          leftContent={<Badge status={survey.status} />}
        />
        
        {/* 概览区域 */}
        <div className="insight-overview">
          {/* 摘要部分 */}
          <div className="summary-section">
            <h2 className="section-title">Summary</h2>
            <div className="summary-content">
              <p>{survey.summary}</p>
            </div>
          </div>
          
          {/* 总体情感分析 */}
          <div className="sentiment-section">
            <h2 className="section-title">Overall Sentiment</h2>
            <div className="sentiment-content">
              <div className="sentiment-item sentiment-positive">
                <PlaceholderIcon className="sentiment-icon" />
                <span className="sentiment-text">Positive: {survey.sentiment.positive}%</span>
              </div>
              <div className="sentiment-item sentiment-neutral">
                <PlaceholderIcon className="sentiment-icon" />
                <span className="sentiment-text">Neutral: {survey.sentiment.neutral}%</span>
              </div>
              <div className="sentiment-item sentiment-negative">
                <PlaceholderIcon className="sentiment-icon" />
                <span className="sentiment-text">Negative: {survey.sentiment.negative}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 关键洞察 */}
        <div className="key-insights-section">
          <h2 className="section-title">Key Insights</h2>
          <div className="insights-grid">
            {survey.keyInsights.map(insight => (
              <div key={insight.id} className="insight-item">
                <PlaceholderIcon className="insight-icon" />
                <p className="insight-text">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 推荐行动 */}
        <div className="recommended-actions-section">
          <h2 className="section-title">Recommended Actions</h2>
          <div className="actions-list">
            {survey.recommendedActions.map(action => (
              <div key={action.id} className="action-item">
                <PlaceholderIcon className="action-icon" />
                <p className="action-text">{action.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SurveyInsight; 
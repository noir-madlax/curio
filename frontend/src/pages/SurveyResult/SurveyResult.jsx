import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Badge from '../../components/common/Badge/Badge';
import './SurveyResult.css';

// 引入图标
import timeIcon from '../../assets/icons/time_icon.svg';
// 2024-07-21: 添加view图标
import viewIcon from '../../assets/icons/view1_icon.svg';

// 2024-05-24: 使用静态占位数据，后续可替换为API调用
const mockSurveyData = {
  id: 's-001',
  title: 'Customer Satisfaction Survey',
  status: 'Published',
  statistics: {
    totalResponses: 24,
    completionRate: 87,
    avgCompletionTime: '4m 32s',
    questionCount: 8,
    respondentCount: 8
  },
  // 此处省略图表数据和其他详细信息
};

// 2024-05-24: 近期回复者的模拟数据
const mockRespondents = [
  {
    id: 'r-001',
    name: 'Michael Chen',
    email: 'michael@example.com',
    date: 'May 20, 2023 • 09:47',
    completionTime: '4m 03s',
    status: 'Completed'
  },
  {
    id: 'r-002',
    name: 'Sarah Lee',
    email: 'sarah@example.com',
    date: 'May 20, 2023 • 11:15', 
    completionTime: '5m 12s',
    status: 'Completed'
  },
  {
    id: 'r-003',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    date: 'May 20, 2023 • 14:32',
    completionTime: '3m 45s',
    status: 'Completed'
  },
  {
    id: 'r-004',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    date: 'May 19, 2023 • 16:08',
    completionTime: '6m 22s',
    status: 'Completed'
  },
  {
    id: 'r-005',
    name: 'David Kim',
    email: 'david@example.com',
    date: 'May 19, 2023 • 10:33',
    completionTime: '2m 55s',
    status: 'Partial'
  }
];

// 2024-05-24: 创建占位头像组件
const UserAvatar = ({ name }) => {
  const initial = name ? name.charAt(0) : 'U';
  return <div className="respondent-avatar">{initial}</div>;
};

// 2024-05-24: 使用占位图标，后续将替换为实际SVG
const PlaceholderIcon = ({ className }) => (
  <div className={`placeholder-icon ${className}`}></div>
);

// 2024-07-21: 添加查看图标组件
const ViewIcon = () => <img src={viewIcon} alt="View" className="view-icon" />;

const SurveyResult = () => {
  // 获取URL中的surveyId参数
  const { surveyId } = useParams();
  const navigate = useNavigate();
  
  // 此处省略实际API调用，直接使用模拟数据
  const survey = mockSurveyData;
  
  // 2024-05-26: 创建对Recent Respondents区域的引用
  const respondentsRef = useRef(null);
  
  // 2024-07-21: 添加状态来跟踪鼠标悬停的行
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // 2024-05-26: 滚动到Recent Respondents区域
  const scrollToRespondents = () => {
    respondentsRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 2024-07-21: 添加查看用户聊天回答的处理函数
  const handleViewChat = (respondentId) => {
    console.log('View chat for respondent:', respondentId);
    // 功能暂不实现
  };
  
  // 2024-07-24: 添加导航到Insight页面的处理函数
  const goToInsights = () => {
    navigate(`/surveys/${surveyId}/insights`);
  };
  
  return (
    <MainLayout>
      <div className="survey-result-container">
        {/* 标题区域 */}
        <div className="survey-result-header">
          <div className="survey-title-info">
            <div className="title-badge-container">
              <h1>Customer Satisfaction Survey</h1>
              <Badge status="Published" />
            </div>
          </div>
        </div>
        
        {/* 统计卡片区域 */}
        <div className="statistics-cards">
          <div className="stat-card">
            <div className="stat-value">{survey.statistics.totalResponses}</div>
            <div className="stat-label">Total Responses</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{survey.statistics.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{survey.statistics.avgCompletionTime}</div>
            <div className="stat-label">Avg. Completion Time</div>
          </div>
        </div>
        
        {/* 2024-05-28: 修改Overview区域结构与Figma设计一致 */}
        <div className="overview-tabs">
          <div className="overview-tab active">Overview</div>
          <div className="overview-tab" onClick={scrollToRespondents}>Respondents</div>
          {/* 2024-07-24: 添加Insights标签页 */}
          <div className="overview-tab" onClick={goToInsights}>Insights</div>
        </div>
        
        {/* 图表区域 */}
        <div className="charts-container">
          {/* 随时间推移的回复图表 */}
          <div className="chart-card">
            <h2 className="chart-title">Responses Over Time</h2>
            <div className="chart-placeholder responses-chart">
              {/* 日期标签 */}
              <div className="chart-labels">
                <span>May 17</span>
                <span>May 18</span>
                <span>May 19</span>
                <span>May 20</span>
              </div>
              
              {/* 图表提示框 */}
              <div className="chart-tooltip">
                <div className="tooltip-date">Date: May 17</div>
                <div className="tooltip-value">8 responses</div>
              </div>
            </div>
          </div>
          
          {/* 问题完成率图表 */}
          <div className="chart-card">
            <h2 className="chart-title">Question Completion Rates</h2>
            <div className="chart-placeholder completion-chart">
              {/* 问题标签 */}
              <div className="completion-labels">
                <span className="q-label q1">Q1</span>
                <span className="q-label q2">Q2</span>
                <span className="q-label q3">Q3</span>
                <span className="q-label q4">Q4</span>
                <span className="q-label q5">Q5</span>
                <span className="q-label q6">Q6</span>
                <span className="q-label q7">Q7</span>
                <span className="q-label q8">Q8</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 近期回复者表格 */}
        <div className="recent-respondents-section" ref={respondentsRef}>
          <div className="respondents-table">
            {/* 表头在容器内 */}
         {/*   <div className="respondents-header">
              <h2 className="section-title">Recent Respondents</h2>
            </div>
             */}
            {/* 表头 */}
            <div className="table-header">
              <div className="header-cell">Respondent</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">

                Completion Time
              </div>
              <div className="header-cell">Status</div>
            </div>
            
            {/* 表格内容 */}
            {mockRespondents.map((respondent, index) => (
              <div 
                key={respondent.id} 
                className="table-row"
                onMouseEnter={() => setHoveredRow(respondent.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="respondent-cell">
                  <UserAvatar name={respondent.name} />
                  <div className="respondent-info">
                    <div className="respondent-name">{respondent.name}</div>
                    <div className="respondent-email">{respondent.email}</div>
                  </div>
                </div>
                <div className="date-cell">{respondent.date}</div>
                <div className="completion-time-cell">
                  <img src={timeIcon} alt="Time" className="time-icon" />
                  {respondent.completionTime}
                </div>
                <div className="status-cell">
                  <Badge status={respondent.status} />
                  {/* 2024-07-21: 添加hover时显示的查看图标 */}
                  {hoveredRow === respondent.id && respondent.status === 'Completed' && (
                    <div 
                      className="view-icon-container" 
                      onClick={() => handleViewChat(respondent.id)}
                    >
                      <ViewIcon />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SurveyResult; 
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading } from '../../components/common/Loading';
// 2024-10-14: 导入公共组件
import SurveyHeader from '../../components/common/SurveyHeader';
import './SurveyResult.css';

// 引入服务函数
import { getSurveyById } from '../../services/surveyService';
import { 
  getSurveyResultStats, 
  getSurveyResponses, 
  getQuestionCompletionRates, 
  getResponsesOverTime 
} from '../../services/resultService';

// 引入图标
import timeIcon from '../../assets/icons/time_icon.svg';
// 2024-07-21: 添加view图标
import viewIcon from '../../assets/icons/view1_icon.svg';
// 2024-09-26: 添加默认头像
import avatarDefaultIcon from '../../assets/icons/avatar_default_icon.svg';

// 2024-05-24: 创建头像组件，使用默认图标
const UserAvatar = ({ name }) => {
  return <img src={avatarDefaultIcon} alt={name} className="respondent-avatar" />;
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
  
  // 2024-09-26: 添加状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [questionRates, setQuestionRates] = useState(null);
  const [responsesOverTime, setResponsesOverTime] = useState(null);
  
  // 2024-05-26: 创建对Recent Respondents区域的引用
  const respondentsRef = useRef(null);
  
  // 2024-07-21: 添加状态来跟踪鼠标悬停的行
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // 2024-09-26: 添加数据加载函数
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. 获取问卷基本信息
        const surveyData = await getSurveyById(surveyId);
        setSurvey(surveyData);
        
        // 2. 获取问卷统计数据
        const statsData = await getSurveyResultStats(surveyId);
        setStatistics(statsData);
        
        // 3. 获取回答记录列表
        const responseData = await getSurveyResponses(surveyId);
        setRespondents(responseData);
        
        // 4. 获取问题完成率数据
        const questionRatesData = await getQuestionCompletionRates(surveyId);
        setQuestionRates(questionRatesData);
        
        // 5. 获取回答随时间分布数据
        const timeData = await getResponsesOverTime(surveyId);
        setResponsesOverTime(timeData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching survey results:', error);
        setError(error.message || 'Failed to load survey results');
        setLoading(false);
      }
    };
    
    fetchSurveyData();
  }, [surveyId]);
  
  // 2024-05-26: 滚动到Recent Respondents区域
  const scrollToRespondents = () => {
    respondentsRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 2024-07-21: 添加查看用户聊天回答的处理函数
  const handleViewChat = (respondentId) => {
    console.log('View chat for respondent:', respondentId);
    // 功能暂不实现，仅打印响应ID
  };
  
  // 2024-07-24: 添加导航到Insight页面的处理函数
  const goToInsights = () => {
    navigate(`/surveys/${surveyId}/insights`);
  };

  // 2024-09-26: 如果正在加载，使用已有的loading样式
  if (loading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey results..." />
      </MainLayout>
    );
  }

  // 2024-09-26: 如果出现错误，显示错误信息
  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </MainLayout>
    );
  }

  // 2024-09-26: 如果没有数据，显示提示信息
  if (!survey || !statistics) {
    return (
      <MainLayout>
        <div className="empty-state">
          <p>No survey data available.</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="survey-result-container">
        {/* 2024-10-14: 使用SurveyHeader公共组件替换原有的header结构 */}
        <SurveyHeader
          title={survey.title}
          leftContent={<Badge status={survey.status} />}
        />
        
        {/* 统计卡片区域 */}
        <div className="statistics-cards">
          <div className="stat-card">
            <div className="stat-value">{statistics.totalResponses}</div>
            <div className="stat-label">Total Responses</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{statistics.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{statistics.avgCompletionTime}</div>
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
                {responsesOverTime && responsesOverTime.dates.map((date, index) => (
                  <span key={index}>{date}</span>
                ))}
              </div>
              
              {/* 图表提示框 - 保留原来的静态布局，后续可替换为动态数据 */}
              {responsesOverTime && responsesOverTime.dates.length > 0 && (
                <div className="chart-tooltip">
                  <div className="tooltip-date">Date: {responsesOverTime.dates[0]}</div>
                  <div className="tooltip-value">{responsesOverTime.counts[0]} responses</div>
                </div>
              )}
            </div>
          </div>
          
          {/* 问题完成率图表 */}
          <div className="chart-card">
            <h2 className="chart-title">Question Completion Rates</h2>
            <div className="chart-placeholder completion-chart">
              {/* 问题标签 */}
              <div className="completion-labels">
                {questionRates && questionRates.questions.length > 0 ? (
                  questionRates.questions.map((q, index) => (
                    <span key={index} className={`q-label q${index+1}`}>Q{index+1}</span>
                  ))
                ) : (
                  <>
                    <span className="q-label q1">Q1</span>
                    <span className="q-label q2">Q2</span>
                    <span className="q-label q3">Q3</span>
                    <span className="q-label q4">Q4</span>
                    <span className="q-label q5">Q5</span>
                    <span className="q-label q6">Q6</span>
                    <span className="q-label q7">Q7</span>
                    <span className="q-label q8">Q8</span>
                  </>
                )}
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
            {respondents.length > 0 ? (
              respondents.map((respondent) => (
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
                      {respondent.email && <div className="respondent-email">{respondent.email}</div>}
                    </div>
                  </div>
                  <div className="date-cell">{respondent.date}</div>
                  <div className="completion-time-cell">
                    <img src={timeIcon} alt="Time" className="time-icon" />
                    {respondent.completionTime}
                  </div>
                  <div className="status-cell">
                    <Badge status={respondent.status} />
                    {/* 2024-09-26: 修改查看图标显示逻辑，所有行都显示 */}
                    {hoveredRow === respondent.id && (
                      <div 
                        className="view-icon-container" 
                        onClick={() => handleViewChat(respondent.id)}
                        title="View response details"
                      >
                        <ViewIcon />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No respondents yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SurveyResult; 
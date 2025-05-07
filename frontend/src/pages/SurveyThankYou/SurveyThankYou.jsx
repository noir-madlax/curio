import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SimpleLayout from '../../components/layout/SimpleLayout/SimpleLayout';
import { FullPageLoading } from '../../components/common/Loading';
import { getSurveyById } from '../../services/surveyService';
import './SurveyThankYou.css';

// 2024-10-11T22:45:00Z 新增：感谢页面组件
// 2024-05-14T14:00:00Z 修改：添加从数据库获取感谢信息功能
// 2024-05-14T16:30:00Z 修改：将MainLayout替换为SimpleLayout，与问卷页面保持一致
// 2024-05-14T17:00:00Z 修改：更新底部按钮，提供关闭和重新填写选项
const SurveyThankYou = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        // 设置标记，表示此问卷已完成，防止再次创建响应记录
        sessionStorage.setItem(`survey_${id}_completed`, 'true');
        
        const surveyData = await getSurveyById(id);
        setSurvey(surveyData);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError(err.message || 'Unable to load survey data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [id]);

  if (isLoading) {
    return <FullPageLoading message="Loading survey data..." />;
  }

  // 从问卷数据中获取感谢信息，如果没有则使用默认文本
  const thanksMessage = survey?.thanksMessage || '';
  const defaultTitle = 'Thank You!';
  const surveyLink = survey?.surveyLink; // 问卷链接，可用于重新填写

  // 关闭页面函数
  const handleClose = () => {
    // 如果是从嵌入iframe打开的，尝试通知父页面
    if (window.parent !== window) {
      try {
        window.parent.postMessage('survey_completed', '*');
      } catch (e) {
        console.error('Failed to send message to parent window', e);
      }
    }
    
    // 无论如何，提供返回主页的选项
    navigate('/surveys');
  };

  return (
    <SimpleLayout>
      <div className="thank-you-container">
        <div className="thank-you-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#E8F5E9"/>
              <path d="M36 50.3L24.7 39L21.5 42.2L36 56.7L66 26.7L62.8 23.5L36 50.3Z" fill="#4CAF50"/>
            </svg>
          </div>
          <h1>{defaultTitle}</h1>
          
          {thanksMessage ? (
            <div className="custom-thank-you-message">
              {thanksMessage.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          ) : (
            <>
              <p>Your response has been successfully submitted.</p>
              <p>We appreciate your feedback and time.</p>
            </>
          )}
          
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SurveyThankYou; 
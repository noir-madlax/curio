import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Button from '../../components/common/Button/Button';
import { getSurveyById } from '../../services/surveyService';
import './SurveyPublished.css';

// --- 图标导入 --- 
// 移除旧的占位符
// import 实际 SVG 文件
import linkIconBlue from '../../assets/icons/link_icon.svg'; 
import copyIcon from '../../assets/icons/copy_icon.svg';
import responsesIcon from '../../assets/icons/responses_icon.svg';
import openSurveyIcon from '../../assets/icons/OpenSurvey_Icon.svg';

// Email, Embed, ShareLink 图标暂时保留占位符, 因为不确定文件名或是否已添加
const ShareLinkIcon = () => <span className="icon-placeholder">🔗</span>; // Placeholder
const EmailIcon = () => <span className="icon-placeholder">📧</span>; // Placeholder
const EmbedIcon = () => <span className="icon-placeholder">&lt;/&gt;</span>; // Placeholder
// --- 图标导入结束 --- 

const SurveyPublished = () => {
  const { surveyId } = useParams(); // 从URL获取surveyId
  const navigate = useNavigate();
  const [activeShareTab, setActiveShareTab] = useState('link');
  const [survey, setSurvey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 2024-08-06 新增：从数据库获取问卷数据
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setIsLoading(true);
        const surveyData = await getSurveyById(surveyId);
        setSurvey(surveyData);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError(err.message || 'Unable to load survey');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId]);
  
  // 从survey对象获取数据，如果尚未加载则使用默认值
  const surveyTitle = survey?.title || "Loading...";
  const surveyLink = survey?.surveyLink || `${window.location.origin}/survey/${surveyId}/respond`;
  const responsesCount = 0; // 初始回复数为0
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyLink)
      .then(() => {
        alert('Link copied to clipboard!'); // 可以替换为更友好的提示
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const renderShareContent = () => {
    switch (activeShareTab) {
      case 'link':
        return (
          <div className="share-content-link">
            <div className="share-link-header">
              {/* 使用导入的 SVG */}
              <img src={linkIconBlue} alt="Survey Link Icon" className="icon-img header-icon" /> 
              <h3>Survey Link</h3> 
            </div>
            <p>Share this link with your respondents to collect responses. Anyone with this link can access your survey.</p>
            <div className="share-link-actions">
              <div className="link-input-container">
                <input type="text" value={surveyLink} readOnly />
              </div>
              {/* 使用导入的 SVG */}
              <Button variant="primary" onClick={handleCopyLink} icon={<img src={copyIcon} alt="Copy" className="icon-img button-icon" />}>
                Copy
              </Button>
            </div>
          </div>
        );
      case 'email':
        return <div className="share-content-placeholder"><p>Email sharing options coming soon!</p></div>;
      case 'embed':
        return <div className="share-content-placeholder"><p>Embed options coming soon!</p></div>;
      default:
        return null;
    }
  };

  // 2024-08-06 新增：加载状态显示
  if (isLoading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-message">Loading survey data...</div>
        </div>
      </MainLayout>
    );
  }

  // 2024-08-06 新增：错误状态显示
  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/surveys')}>
            Back to Surveys
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="survey-published-container">
        <div className="published-header">
          <div className="published-title-section">
            <h1>{surveyTitle}</h1>
            <span className="published-badge">Published</span>
          </div>
          <p className="published-subtitle">Your survey is ready to be shared with respondents</p>
        </div>

        <div className="published-share-tabs">
          <div className="share-tab-container">
            <div className={`share-tab-wrapper ${activeShareTab === 'link' ? 'active' : ''}`}>
               <button
                 className={`share-tab ${activeShareTab === 'link' ? 'active' : ''}`}
                 onClick={() => setActiveShareTab('link')}
               >
                 <ShareLinkIcon/> {/* 保留占位符 */}
                 Share Link
               </button>
            </div>
            <div className={`share-tab-wrapper ${activeShareTab === 'email' ? 'active' : ''}`}>
              <button
                className={`share-tab ${activeShareTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveShareTab('email')}
              >
                 <EmailIcon/> {/* 保留占位符 */}
                 Email
              </button>
            </div>
             <div className={`share-tab-wrapper ${activeShareTab === 'embed' ? 'active' : ''}`}>
               <button
                 className={`share-tab ${activeShareTab === 'embed' ? 'active' : ''}`}
                 onClick={() => setActiveShareTab('embed')}
               >
                 <EmbedIcon/> {/* 保留占位符 */}
                 Embed
               </button>
            </div>
          </div>
        </div>


        <div className="published-share-content">
          {renderShareContent()}
        </div>

        <div className="published-responses-section">
          <div className="responses-info">
             {/* 使用导入的 SVG */}
            <img src={responsesIcon} alt="Responses" className="icon-img section-icon" />
            <div className="responses-text">
              <h4>Responses</h4>
              <p>{responsesCount} responses collected</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/surveys/${surveyId}/results`)}> 
            View Responses
          </Button>
        </div>

        <div className="published-footer-actions">
          <Button variant="secondary" onClick={() => navigate('/surveys')}> 
            Back to Surveys
          </Button>
          <a href={surveyLink} target="_blank" rel="noopener noreferrer" className="button-link"> 
             {/* 使用导入的 SVG */}
             <Button variant="primary" icon={<img src={openSurveyIcon} alt="Open Survey" className="icon-img button-icon" />}>
                Open Survey
             </Button>
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default SurveyPublished; 
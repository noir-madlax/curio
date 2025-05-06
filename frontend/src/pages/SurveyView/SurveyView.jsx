import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import SimpleLayout from '../../components/layout/SimpleLayout/SimpleLayout';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading } from '../../components/common/Loading';
import QuestionOptions, { QUESTION_TYPES, QUESTION_TYPE_NAMES } from '../../components/common/QuestionOptions/QuestionOptions';
import './SurveyView.css';

// 服务导入
import {
  getSurveyById,
  getQuestionsBySurveyId,
  updateSurvey,
  getQuestionOptions,
  createSurveyResponse,
  getSurveyResponseById,
  submitSurveyResponse
} from '../../services/surveyService';

// 图标导入
import publishIcon from '../../assets/icons/publish_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';
import backIcon from '../../assets/icons/back_icon.svg';

// 图标组件
const PublishIcon = ({ color = "#252326" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12.0002H10V19.0002H14V12.0002H19L12 5.00024L5 12.0002Z" fill={color}/>
  </svg>
);

/**
 * 统一的问卷视图组件
 * @param {string} mode - 组件模式：'preview'(默认)、'respond'、'view'
 * 2023-10-30: 修复问题展示不一致和respond模式布局问题
 * 2023-10-31: 修复问题样式和loading问题
 * 2023-11-01: 统一使用此组件处理所有view和preview场景
 * 2024-05-09: 使用新的通用QuestionOptions组件
 */
const SurveyView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, responseId } = useParams();
  
  // 从URL确定当前模式
  const pathParts = location.pathname.split('/');
  let mode = 'preview'; // 默认模式
  if (pathParts.includes('respond')) {
    mode = 'respond';
  } 
  
  // 获取URL中的查询参数
  const queryParams = new URLSearchParams(location.search);
  // 2023-11-01: 修复查询参数t的处理，添加更多调试日志
  const responseIdFromQuery = queryParams.get('t'); // 从查询参数获取t参数作为responseId
  
  // 调试输出路由信息
  console.log('=== URL和路由参数信息 ===', {
    pathname: location.pathname,
    search: location.search,
    mode,
    id,
    responseId,
    responseIdFromQuery,
    fullUrl: window.location.href
  });
  
  // 状态定义
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyStatus, setSurveyStatus] = useState('draft');
  
  // Respond模式相关状态
  const [answers, setAnswers] = useState({});
  // 2023-11-01: 优先使用查询参数中的t作为响应ID
  const [currentResponseId, setCurrentResponseId] = useState(responseIdFromQuery || responseId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // 追踪初始加载是否完成
  const [isCreatingResponse, setIsCreatingResponse] = useState(false); // 追踪是否正在创建响应ID
  
  // View模式相关状态
  const [responseData, setResponseData] = useState(null);
  
  console.log(`当前模式: ${mode}, 问卷ID: ${id}, 响应ID: ${currentResponseId}`, {
    responseIdFromQuery,
    responseIdFromURL: responseId,
  });
  
  useEffect(() => {
    // 函数：获取问卷和问题数据
    const fetchSurveyData = async () => {
      setIsLoading(true);
      try {
        // 1. 获取问卷数据
        const surveyData = await getSurveyById(id);
        
        if (!surveyData) {
          throw new Error('Survey not found');
        }
        
        setSurveyTitle(surveyData.title);
        setSurveyDescription(surveyData.description || '');
        setSurveyStatus(surveyData.status.toLowerCase());
        
        // 2. 获取问题数据
        const questionsData = await getQuestionsBySurveyId(id);
        
        // 3. 对每个问题获取选项数据
        const questionsWithOptions = await Promise.all(
          questionsData.map(async (question) => {
            // 如果是单选、多选或NPS题型，获取选项
            if (
              question.type === QUESTION_TYPES.SINGLE_CHOICE || 
              question.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
              question.type === QUESTION_TYPES.NPS ||
              question.type === QUESTION_TYPES.BOOLEAN
            ) {
              const options = await getQuestionOptions(question.id);
              return { ...question, options };
            }
            return question;
          })
        );
        
        setQuestions(questionsWithOptions);
        
        // 4. 如果是respond模式且没有responseId，创建一个新的响应ID
        if (mode === 'respond' && !currentResponseId && !isCreatingResponse) {
          setIsCreatingResponse(true);
          try {
            const newResponse = await createSurveyResponse(id);
            setCurrentResponseId(newResponse.id);
            // 更新URL，但不刷新页面
            const newUrl = `/surveys/respond/${id}?t=${newResponse.id}`;
            window.history.replaceState(null, '', newUrl);
          } catch (error) {
            console.error('创建响应ID失败', error);
            setError('Failed to create response ID. Please try again.');
          } finally {
            setIsCreatingResponse(false);
          }
        }
        
        // 5. 如果存在响应ID，获取已有的回答数据
        if (currentResponseId) {
          try {
            const responseData = await getSurveyResponseById(currentResponseId);
            if (responseData && responseData.answers) {
              setAnswers(responseData.answers);
              setResponseData(responseData);
            }
          } catch (error) {
            console.error('获取响应数据失败', error);
          }
        }
      } catch (error) {
        console.error('获取问卷数据失败', error);
        setError('Failed to load survey data. Please try again later.');
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    fetchSurveyData();
  }, [id, mode, currentResponseId]);
  
  // 返回按钮处理函数
  const handleBack = () => {
    navigate(-1); // 返回上一页
  };
  
  // 编辑按钮处理函数
  const handleEdit = () => {
    navigate(`/surveys/edit/${id}`);
  };
  
  // 发布按钮处理函数
  const handlePublish = async () => {
    try {
      setIsLoading(true);
      await updateSurvey(id, { status: 'PUBLISHED' });
      setSurveyStatus('published');
      
      // 生成预览链接
      const generateSurveyLink = (id) => {
        // 检查当前环境并构建基础URL
        const baseUrl = process.env.NODE_ENV === 'development' 
          ? window.location.origin 
          : process.env.REACT_APP_FRONTEND_URL || window.location.origin;
        
        // 构建并返回完整链接
        return `${baseUrl}/surveys/respond/${id}`;
      };
      
      // 构建并复制链接到剪贴板
      const surveyLink = generateSurveyLink(id);
      
      // 使用navigator.clipboard API复制链接
      try {
        await navigator.clipboard.writeText(surveyLink);
        alert('Survey published! Link copied to clipboard: ' + surveyLink);
      } catch (err) {
        // 如果clipboard API失败，提供链接并通知用户
        alert(`Survey published! Please copy this link manually: ${surveyLink}`);
      }
    } catch (error) {
      console.error('Publishing survey failed:', error);
      alert('Failed to publish survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 答案变更处理函数
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // 提交回答处理函数
  const handleSubmitResponses = async () => {
    // 检查必答题是否已回答
    const requiredQuestions = questions.filter(q => q.required);
    const unansweredRequired = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      if (answer === undefined || answer === null) return true;
      if (Array.isArray(answer) && answer.length === 0) return true;
      if (typeof answer === 'string' && answer.trim() === '') return true;
      return false;
    });
    
    if (unansweredRequired.length > 0) {
      alert(`Please answer all required questions before submitting.`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitSurveyResponse(currentResponseId, {
        surveyId: id,
        answers
      });
      setSubmitSuccess(true);
      
      // 提交成功后，导航到感谢页面
      navigate(`/survey-thank-you/${id}`);
    } catch (error) {
      console.error('提交问卷回答失败', error);
      alert('Failed to submit your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 问题渲染函数
  const renderQuestion = (question) => {
    const isViewMode = mode === 'preview'; // preview模式下只查看，不交互
    const isInteractive = mode === 'respond'; // 只有在respond模式下才能交互
    const currentAnswer = answers[question.id] || null;

    return (
      <div 
        id={`question-${question.id}`} 
        className="question-item"
        key={question.id}
      >
        <div className="question-title-row">
          <span className="question-number">{question.number}.</span>
          <span className="question-text">{question.text}</span>
          <div className="question-badges">
            <span className="question-type-badge">
              {QUESTION_TYPE_NAMES[question.type] || 'Unknown Type'}
            </span>
            {question.required && (
              <Badge type="required">Required</Badge>
            )}
          </div>
        </div>

        <div className="question-content">
          <QuestionOptions 
            question={question} 
            mode={mode} 
            currentAnswer={currentAnswer} 
            handleAnswerChange={handleAnswerChange} 
          />
        </div>
      </div>
    );
  };
  
  // 渲染页头
  const renderHeader = () => {
    return (
      <div className="survey-header">
        <div className="header-left">
          <h1 className="survey-title">{surveyTitle || 'Untitled Survey'}</h1>
        </div>
        
        <div className="header-actions">
          {mode === 'preview' && surveyStatus !== 'published' && (
            <>
              <Button 
                variant="secondary" 
                icon={<img src={editIcon} alt="Edit" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              
              <Button 
                variant="success" 
                icon={<PublishIcon color="#FFFFFF" />}
                onClick={handlePublish}
              >
                Publish
              </Button>
            </>
          )}
          
          {surveyStatus === 'published' ? (
                <Button 
                  variant="success" 
                  icon={<PublishIcon color="#FFFFFF" />}
                  onClick={() => navigate(`/survey-published/${id}`)}
                  className="published-button"
                >
                  Basic Information
                </Button>
              ) : (
                mode === 'respond' && (
                  <Button
                    variant="success"
                    onClick={handleSubmitResponses}
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                )
              )}
        </div>
      </div>
    );
  };
  
  // 主渲染
  if (error) {
    return (
      <MainLayout>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="secondary" onClick={handleBack}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }
  
  // 如果是加载中状态，显示加载中
  if (isLoading && !initialLoadComplete) {
    return <FullPageLoading message="Loading survey..." />;
  }
  
  const layoutComponent = mode === 'respond' ? SimpleLayout : MainLayout;
  
  return React.createElement(
    layoutComponent,
    {},
    <div className="survey-view-container">
      {renderHeader()}
      
      <div className="survey-content">
        {surveyDescription && (
          <div className="survey-description-container">
            <p className="survey-description">{surveyDescription}</p>
          </div>
        )}
        
        <div className="questions-container">
          {questions.map(question => renderQuestion(question))}
        </div>
        
        {isSubmitting && <FullPageLoading message="Submitting your responses..." />}
      </div>
      
      {mode === 'respond' && questions.length > 0 && !isSubmitting && (
        <div className="submit-container">
          <Button 
            variant="success" 
            onClick={handleSubmitResponses}
            className="submit-button"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

export default SurveyView; 
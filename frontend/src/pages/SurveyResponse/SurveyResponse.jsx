import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import { FullPageLoading, LoadingOverlay } from '../../components/common/Loading';
// 2024-10-14: 导入公共组件
import SurveyHeader from '../../components/common/SurveyHeader';
import SurveyDescription from '../../components/common/SurveyDescription';
import './SurveyResponse.css';
import { 
  getSurveyById, 
  getQuestionsBySurveyId,
  submitSurveyResponse,
  getQuestionOptions,
  createSurveyResponse
} from '../../services/surveyService';

// 导入SVG图标
import logo from '../../assets/icons/Curio_logo.svg'; // 假设有这个图标，如果没有请创建
// 这里需要导入其他图标 - 暂时使用占位符
import arrowLeftIcon from '../../assets/icons/arrow_left_icon.svg'; // 左箭头图标
import arrowRightIcon from '../../assets/icons/arrow_right_icon.svg'; // 右箭头图标

// 导入问题类型和选项组件
import QuestionOptions, { QUESTION_TYPES } from '../../components/common/QuestionOptions/QuestionOptions';

// 渐变按钮组件
const GradientButton = ({ children, onClick, disabled, className = '' }) => {
  return (
    <button 
      className={`gradient-button ${className} ${disabled ? 'disabled' : ''}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// 统一的页面头部组件
const PageHeader = () => {
  return (
    <div className="mobile-survey-header">
      <div className="header-logo-container">
        <img src={logo} alt="Curio" className="mobile-logo" />
        <span className="header-brand-text">Curio</span>
      </div>
    </div>
  );
};

const SurveyResponse = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState('Your feedback is very important to us. We will use this information to improve the work environment.');
  
  // 存储用户的回答
  const [responses, setResponses] = useState({});
  // 添加当前问题索引状态
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 添加开始状态
  const [hasStarted, setHasStarted] = useState(false);
  // 响应ID存储
  const [responseId, setResponseId] = useState(null);
  // 跟踪已回答的问题
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  
  useEffect(() => {
    if (surveyId) {
      const fetchSurveyData = async () => {
        setIsLoading(true);
        try {
          console.log('Fetching survey data for surveyId:', surveyId);
          const surveyData = await getSurveyById(surveyId);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          
          if (surveyData.thanksMessage) {
            setThankYouMessage(surveyData.thanksMessage);
          }
          
          const questionsData = await getQuestionsBySurveyId(surveyId);
          
          // 获取问题及其选项
          const questionsWithOptions = await Promise.all(
            questionsData.map(async (q, index) => {
              const questionWithIndex = {
                ...q,
                number: index + 1
              };
              
              // 如果是单选、多选或其他需要选项的题型，获取选项
              if (
                q.type === QUESTION_TYPES.SINGLE_CHOICE || 
                q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
                q.type === QUESTION_TYPES.NPS ||
                q.type === QUESTION_TYPES.BOOLEAN
              ) {
                const options = await getQuestionOptions(q.id);
                return { ...questionWithIndex, options };
              }
              
              return questionWithIndex;
            })
          );
          
          setQuestions(questionsWithOptions);
          
          // 初始化responses对象
          const initialResponses = {};
          questionsWithOptions.forEach(q => {
            initialResponses[q.id] = '';
          });
          setResponses(initialResponses);
          
        } catch (err) {
          console.error('Error fetching survey data:', err);
          setError(err.message || 'Unable to load survey data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSurveyData();
    }
  }, [surveyId]);
  
  // 计算调查需要的时间
  const estimateSurveyTime = () => {
    if (!questions || questions.length === 0) return '1 minute';
    if (questions.length <= 5) return '1 minute';
    if (questions.length <= 10) return '2 minutes';
    return `${Math.ceil(questions.length / 5)} minutes`;
  };
  
  const handleAnswerChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
    
    // 记录已回答的问题
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });
  };
  
  // 检查当前问题是否已回答
  const isCurrentQuestionAnswered = () => {
    if (!questions || questions.length === 0) return false;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    
    const answer = responses[currentQuestion.id];
    
    // 检查回答是否有效
    if (answer === undefined || answer === null) return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    
    return true;
  };
  
  // 检查特定问题是否已回答
  const isQuestionAnswered = (questionId) => {
    return answeredQuestions.has(questionId);
  };
  
  // 根据问题类型获取提示文本
  const getQuestionHintText = (questionType) => {
    switch (questionType) {
      case QUESTION_TYPES.TEXT:
        return "Type your answer here";
      case QUESTION_TYPES.SINGLE_CHOICE:
        return "Select one option";
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return "Select one or more options";
      case QUESTION_TYPES.NPS:
        return "Choose a rating";
      case QUESTION_TYPES.BOOLEAN:
        return "Select yes or no";
      default:
        return "Select an answer";
    }
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let surveyResponseId = responseId;
      
      // 如果还没有创建响应ID，先创建一个
      if (!surveyResponseId) {
        const createResponse = await createSurveyResponse(surveyId);
        surveyResponseId = createResponse.id;
        setResponseId(surveyResponseId);
      }
      
      // 直接提交responses对象，不再包装在一个对象里
      await submitSurveyResponse(surveyResponseId, responses);
      
      // 设置标记，表示此问卷已完成，防止再次创建响应记录
      sessionStorage.setItem(`survey_${surveyId}_completed`, 'true');
      
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting survey responses:', err);
      setError(err.message || 'Failed to submit survey responses');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStart = async () => {
    try {
      // 创建响应ID
      const createResponse = await createSurveyResponse(surveyId);
      setResponseId(createResponse.id);
      setHasStarted(true);
    } catch (err) {
      console.error('Error creating survey response:', err);
      setError(err.message || 'Failed to start survey');
    }
  };
  
  const handleReset = () => {
    // 重置所有回答
    const resetResponses = {};
    questions.forEach(q => {
      resetResponses[q.id] = '';
    });
    setResponses(resetResponses);
    setAnsweredQuestions(new Set());
  };
  
  // 根据问题类型渲染响应UI
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case QUESTION_TYPES.TEXT:
        return (
          <div className="mobile-text-input-container">
            <textarea
              className="mobile-text-input"
              value={responses[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer here..."
              rows={4}
            />
          </div>
        );
      case QUESTION_TYPES.SINGLE_CHOICE:
      case QUESTION_TYPES.MULTIPLE_CHOICE:
      case QUESTION_TYPES.NPS:
      case QUESTION_TYPES.BOOLEAN:
        return (
          <QuestionOptions
            question={question}
            mode="respond"
            currentAnswer={responses[question.id] || null}
            handleAnswerChange={handleAnswerChange}
          />
        );
      default:
        // 默认使用选项模式
        return (
          <div className="mobile-options-container">
            <div 
              className={`mobile-option ${responses[question.id] === 'Strongly Disagree' ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, 'Strongly Disagree')}
            >
              Strongly Disagree
            </div>
            <div 
              className={`mobile-option ${responses[question.id] === 'Disagree' ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, 'Disagree')}
            >
              Disagree
            </div>
            <div 
              className={`mobile-option ${responses[question.id] === 'Neutral' ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, 'Neutral')}
            >
              Neutral
            </div>
            <div 
              className={`mobile-option ${responses[question.id] === 'Agree' ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, 'Agree')}
            >
              Agree
            </div>
            <div 
              className={`mobile-option ${responses[question.id] === 'Strongly Agree' ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, 'Strongly Agree')}
            >
              Strongly Agree
            </div>
          </div>
        );
    }
  };
  
  if (error) {
    return (
      <div className="mobile-survey-container">
        <PageHeader />
        <div className="mobile-survey-content">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="mobile-survey-container">
        <PageHeader />
        <div className="mobile-survey-content">
          <FullPageLoading message="Loading survey..." />
        </div>
      </div>
    );
  }
  
  if (submitSuccess) {
    return (
      <div className="mobile-survey-container">
        <PageHeader />
        <div className="mobile-survey-content">
          <div className="mobile-survey-complete">
            <div className="mobile-complete-icon">
              {/* 完成图标 */}
              <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34.9997 56.5001L21 42.5004L25.6663 37.8341L34.9997 47.1674L58.3333 23.8338L62.9997 28.5001L34.9997 56.5001Z" fill="#3D39FB"/>
              </svg>
            </div>
            <h1 className="mobile-complete-title">Thank you for your participation!</h1>
            <p className="mobile-complete-message">
              {thankYouMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // 问卷开始页
  if (!hasStarted) {
    return (
      <div className="mobile-survey-container">
        <PageHeader />
        <div className="mobile-survey-content">
          <div className="mobile-survey-start">
            <div className="mobile-survey-title">
              <h1 className="title-center">{surveyTitle || 'Workplace Happiness Survey'}</h1>
            </div>
            
            <p className="mobile-description">
              {surveyDescription || 'Thank you for participating in our workplace happiness survey. This will help us understand your work experience and improve the work environment.'}
            </p>
            
            <p className="mobile-time-estimate">
              This survey will take approximately {estimateSurveyTime()} to complete
            </p>
            
            <GradientButton onClick={handleStart}>
              <span>Start Survey</span>
            </GradientButton>
          </div>
        </div>
      </div>
    );
  }
  
  // 问卷过程页
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const questionAnswered = isCurrentQuestionAnswered();
  const nextQuestionId = currentQuestionIndex < questions.length - 1 ? 
    questions[currentQuestionIndex + 1]?.id : null;
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;
  const nextQuestionAnswered = nextQuestionId ? isQuestionAnswered(nextQuestionId) : false;
  const showNextButton = currentQuestionIndex > 0 && hasNextQuestion && nextQuestionAnswered;
  
  return (
    <div className="mobile-survey-container">
      <PageHeader />
      <div className="mobile-survey-content">
        <div className="mobile-survey-progress">
          <div className="mobile-survey-header-progress">
            <div className="mobile-survey-title-progress">
              <h1 className="title-center">{surveyTitle || 'Workplace Happiness Survey'}</h1>
            </div>
          </div>
          
          {isSubmitting && (
            <LoadingOverlay message="Submitting your responses..." />
          )}
          
          {currentQuestion && (
            <div className="mobile-question-item">
              {/* 进度条 */}
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              
              {/* 导航按钮移到问题容器顶部 - 使用固定布局 */}
              <div className="mobile-question-nav">
                <div className="nav-left">
                  {currentQuestionIndex > 0 && (
                    <button className="mobile-nav-button" onClick={handleBack}>
                      <img src={arrowLeftIcon} alt="Back" className="nav-icon nav-icon-left" />
                      <span>Back</span>
                    </button>
                  )}
                </div>
                
                {/* 页码指示器放在中间 */}
                <div className="mobile-progress-indicator-center">
                  {currentQuestionIndex + 1}/{questions.length}
                </div>
                
                <div className="nav-right">
                  {showNextButton && (
                    <button className="mobile-nav-button" onClick={handleNext}>
                      <span>Next</span>
                      <img src={arrowRightIcon} alt="Next" className="nav-icon nav-icon-right" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mobile-question-text">{currentQuestion.text}</div>
              <div className="mobile-select-hint">
                {getQuestionHintText(currentQuestion.type)}
              </div>
              
              {/* 根据问题类型渲染不同的UI */}
              {renderQuestionInput(currentQuestion)}
            </div>
          )}
          
          {/* 固定在底部的提交/下一步按钮 */}
          <div className="fixed-bottom-button">
            {currentQuestionIndex === questions.length - 1 ? (
              <GradientButton 
                onClick={handleSubmit}
                disabled={!questionAnswered || isSubmitting}
              >
                <span>Submit</span>
              </GradientButton>
            ) : (
              <GradientButton 
                onClick={handleNext}
                disabled={!questionAnswered || isSubmitting}
              >
                <span>Next</span>
              </GradientButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponse; 
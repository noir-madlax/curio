import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import SimpleLayout from '../../components/layout/SimpleLayout/SimpleLayout';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading } from '../../components/common/Loading';
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
import sendIcon from '../../assets/icons/send_chat_icon.svg'; // 如果存在

// 问题类型常量
const QUESTION_TYPES = {
  TEXT: 'text',
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  NPS: 'rating_scale',
  BOOLEAN: 'yes_no',
};

// 问题类型名称
const QUESTION_TYPE_NAMES = {
  [QUESTION_TYPES.TEXT]: 'Text Question',
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Choice',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.NPS]: 'NPS Rating',
  [QUESTION_TYPES.BOOLEAN]: 'Boolean Question',
};

// 自定义Publish图标组件
const PublishIcon = ({ color = "#252326" }) => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="button-icon">
    <path d="M13.2946 3.7081L2.35237 5.54223C2.32466 5.54687 2.29868 5.55878 2.27709 5.57675C2.25549 5.59472 2.23905 5.61809 2.22945 5.64449C2.21985 5.67089 2.21743 5.69937 2.22244 5.72701C2.22745 5.75465 2.2397 5.78047 2.25795 5.80183L3.61535 7.38993C3.65802 7.43988 3.71515 7.47535 3.77884 7.49145C3.84253 7.50755 3.90965 7.50349 3.97094 7.47982L13.3364 3.86043C13.3548 3.8534 13.3699 3.83978 13.3788 3.82221C13.3878 3.80464 13.3898 3.78438 13.3846 3.76538C13.3794 3.74637 13.3673 3.72998 13.3507 3.71939C13.3341 3.7088 13.3141 3.70478 13.2947 3.7081H13.2946ZM11.2488 15.3536L15.7123 4.32646C15.724 4.29745 15.7269 4.26561 15.7206 4.23496C15.7143 4.20431 15.6991 4.17621 15.6768 4.1542C15.6546 4.13219 15.6263 4.11724 15.5956 4.11125C15.5649 4.10525 15.5331 4.10847 15.5042 4.1205L5.11047 8.45449C5.07528 8.46915 5.04413 8.49205 5.01963 8.52126C4.99514 8.55047 4.97802 8.58514 4.96971 8.62234C4.96141 8.65955 4.96216 8.69821 4.97191 8.73506C4.98166 8.77191 5.00012 8.80589 5.02573 8.83412L10.9842 15.4007C11.0023 15.4206 11.0251 15.4355 11.0505 15.4442C11.0759 15.4529 11.1031 15.455 11.1296 15.4503C11.156 15.4455 11.1808 15.4342 11.2017 15.4173C11.2225 15.4004 11.2388 15.3784 11.2488 15.3536H11.2488ZM4.68323 15.2817C4.41031 15.4349 4.06567 15.3734 4.00823 15.3663C3.5725 15.3128 3.31124 14.9155 3.3648 14.4797L3.05086 8.72717L1.43823 6.79926C0.843835 6.16948 0.87446 5.18021 1.50662 4.58962C1.74982 4.36265 2.05873 4.21865 2.38894 4.17833L15.2466 2.42497C16.1077 2.31945 16.8926 2.92852 16.9997 3.78545C17.0364 4.079 16.9886 4.37684 16.862 4.64429L12.5082 15.822C12.1385 16.6026 11.2023 16.9363 10.4173 16.5675C10.2388 16.4836 10.0776 16.3669 9.94214 16.2235L7.08741 13.0808C7.07162 13.0919 6.27023 13.8256 4.68323 15.2818V15.2817ZM4.28623 10.2378L4.47688 13.5419C4.47863 13.5724 4.48916 13.6017 4.50719 13.6264C4.52521 13.651 4.54998 13.67 4.5785 13.6809C4.60703 13.6918 4.6381 13.6943 4.668 13.688C4.69789 13.6817 4.72533 13.6669 4.74702 13.6454L6.06831 12.3342C6.12519 12.2778 6.15862 12.2019 6.16188 12.1218C6.16515 12.0418 6.13802 11.9635 6.08593 11.9026L4.56526 10.1255C4.54367 10.1002 4.51469 10.0824 4.48242 10.0745C4.45014 10.0666 4.4162 10.069 4.38537 10.0814C4.35454 10.0938 4.32839 10.1156 4.3106 10.1437C4.29282 10.1717 4.28429 10.2047 4.28623 10.2378Z" fill={color}/>
  </svg>
);

// 2024-05-09: 添加QuestionOptions组件用于统一显示问题选项
const QuestionOptions = ({ question, mode, currentAnswer, handleAnswerChange }) => {
  const isInteractive = mode === 'respond';
  
  switch (question.type) {
    case QUESTION_TYPES.SINGLE_CHOICE:
      return (
        <div className="question-options-display">
          <div className="single-choice-container">
            {question.options?.map((option) => (
              <div 
                key={option.id}
                className={`single-choice-option ${currentAnswer === option.id ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                onClick={() => {
                  if (isInteractive) handleAnswerChange(question.id, option.id);
                }}
              >
                <div className="option-radio">
                  <div className={`radio-outer ${currentAnswer === option.id ? 'selected' : ''}`}>
                    {currentAnswer === option.id && <div className="radio-inner"></div>}
                  </div>
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
      
      return (
        <div className="question-options-display">
          <div className="multiple-choice-container">
            {question.options?.map((option) => (
              <div 
                key={option.id}
                className={`multiple-choice-option ${selectedOptions.includes(option.id) ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                onClick={() => {
                  if (isInteractive) {
                    const newSelection = selectedOptions.includes(option.id)
                      ? selectedOptions.filter(id => id !== option.id)
                      : [...selectedOptions, option.id];
                    handleAnswerChange(question.id, newSelection);
                  }
                }}
              >
                <div className="option-checkbox">
                  <div className={`checkbox-outer ${selectedOptions.includes(option.id) ? 'selected' : ''}`}>
                    {selectedOptions.includes(option.id) && <div className="checkbox-inner">✓</div>}
                  </div>
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
      
    case QUESTION_TYPES.NPS:
      return (
        <div className="question-options-display">
          <div className="nps-container">
            <div className="nps-scale">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <div 
                  key={value}
                  className={`nps-option ${currentAnswer === value ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isInteractive) handleAnswerChange(question.id, value);
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
            <div className="nps-labels">
              <span>
                {question.options && question.options.length > 0 
                  ? question.options.find(o => o.order === 1)?.text 
                  : 'Not likely at all'}
              </span>
              <span>
                {question.options && question.options.length > 0 
                  ? question.options.find(o => o.order === 2)?.text 
                  : 'Extremely likely'}
              </span>
            </div>
          </div>
        </div>
      );
      
    case QUESTION_TYPES.BOOLEAN:
      return (
        <div className="question-options-display">
          <div className="boolean-container">
            <div className="boolean-options">
              <div 
                className={`boolean-option ${currentAnswer === true ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                onClick={() => {
                  if (isInteractive) handleAnswerChange(question.id, true);
                }}
              >
                {question.options && question.options.length > 0 ? question.options[0]?.text : 'Yes'}
              </div>
              <div 
                className={`boolean-option ${currentAnswer === false ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                onClick={() => {
                  if (isInteractive) handleAnswerChange(question.id, false);
                }}
              >
                {question.options && question.options.length > 1 ? question.options[1]?.text : 'No'}
              </div>
            </div>
          </div>
        </div>
      );
      
    case QUESTION_TYPES.TEXT:
      return (
        <div className="question-options-display">
          <div className="text-container">
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => isInteractive && handleAnswerChange(question.id, e.target.value)}
              className="text-input"
              placeholder="Enter your answer here..."
              disabled={!isInteractive}
            />
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

/**
 * 统一的问卷视图组件
 * @param {string} mode - 组件模式：'preview'(默认)、'respond'、'view'
 * 2023-10-30: 修复问题展示不一致和respond模式布局问题
 * 2023-10-31: 修复问题样式和loading问题
 * 2023-11-01: 统一使用此组件处理所有view和preview场景
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
    finalResponseId: currentResponseId
  });
  
  // 初始化数据加载
  useEffect(() => {
    console.log('=== useEffect 开始执行 ===', {
      id,
      mode,
      responseIdFromParams: responseId,
      responseIdFromQuery,
      currentResponseId,
      isCreatingResponse
    });
    
    if (id) {
      const fetchSurveyData = async () => {
        setIsLoading(true);
        try {
          console.log("开始加载问卷数据...", {
            surveyId: id,
            mode,
            responseIdFromParam: responseId,
            responseIdFromQuery,
            currentResponseId,
            fullUrl: window.location.href
          });
          
          // 获取问卷基础信息
          const surveyData = await getSurveyById(id);
          console.log("获取到问卷基础信息:", surveyData);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          setSurveyStatus(surveyData.status.toLowerCase());
          
          // 获取问题列表
          const questionsData = await getQuestionsBySurveyId(id);
          console.log(`获取到 ${questionsData.length} 个问题`);
          
          // 保存完整的问题信息，加载问题选项
          const questionsWithOptions = [];
          
          for (const q of questionsData) {
            const questionWithOptions = {
              id: q.id,
              number: questionsWithOptions.length + 1,
              text: q.text,
              type: q.type,
              required: q.required,
              options: []
            };
            
            // 加载选项数据
            if (q.type === QUESTION_TYPES.SINGLE_CHOICE || 
                q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
                q.type === QUESTION_TYPES.NPS ||
                q.type === QUESTION_TYPES.BOOLEAN) {
              try {
                const options = await getQuestionOptions(q.id);
                if (options && options.length > 0) {
                  questionWithOptions.options = options;
                  console.log(`问题 ${q.id} 加载了 ${options.length} 个选项`);
                }
              } catch (err) {
                console.error(`Error loading options for question ${q.id}:`, err);
              }
            }
            
            questionsWithOptions.push(questionWithOptions);
          }
          
          setQuestions(questionsWithOptions);
          
          // 初始化答案对象
          if (mode === 'respond' || mode === 'preview') {
            const initialAnswers = {};
            questionsWithOptions.forEach(q => {
              initialAnswers[q.id] = 
                q.type === QUESTION_TYPES.MULTIPLE_CHOICE ? [] : null;
            });
            setAnswers(initialAnswers);
          }
          
          // 处理响应ID逻辑
          // 2023-11-01: 修复响应ID处理逻辑
          if (mode === 'respond') {
            // 首先检查是否已有响应ID（从URL中获取）
            if (currentResponseId) {
              console.log(`使用现有响应ID: ${currentResponseId}`, {
                source: responseIdFromQuery ? '查询参数t' : (responseId ? 'URL路径参数' : '状态值')
              });
              // 如果已有响应ID，则不需要创建新的
            } else if (!isCreatingResponse) {
              console.log("需要创建问卷响应ID...");
              setIsCreatingResponse(true);
              try {
                console.log(`准备创建问卷响应，问卷ID: ${id}`);
                const newResponse = await createSurveyResponse(id);
                console.log("创建问卷响应成功:", newResponse);
                if (newResponse && newResponse.id) {
                  setCurrentResponseId(newResponse.id);
                  console.log(`已设置新响应ID: ${newResponse.id}`);
                } else {
                  console.error('创建的响应没有有效的ID:', newResponse);
                  setError('无法创建有效的问卷响应。请刷新页面重试。');
                }
              } catch (err) {
                console.error('Error creating survey response:', err);
                setError('无法创建问卷响应。请刷新页面重试。');
              } finally {
                setIsCreatingResponse(false);
              }
            }
          }
          
          setInitialLoadComplete(true);
          console.log("问卷数据加载完成", {
            mode,
            questions: questionsWithOptions.length,
            currentResponseId,
            initialLoadComplete: true
          });
        } catch (err) {
          console.error('Error fetching survey data:', err);
          setError(err.message || 'Unable to load survey data');
        } finally {
          setIsLoading(false);
          console.log("数据加载状态更新: isLoading = false");
        }
      };
      
      fetchSurveyData();
    } else {
      console.error("错误: 缺少问卷ID参数");
      setError("无法加载问卷，缺少ID参数");
      setIsLoading(false);
    }
    
    return () => {
      console.log("=== useEffect 清理函数执行 ===");
    };
  }, [id, mode]); // 2023-11-01: 移除不必要的依赖项，避免无限循环

  // 返回问卷列表
  const handleBack = () => {
    navigate('/surveys');
  };
  
  // 编辑问卷
  const handleEdit = () => {
    navigate(`/surveys/edit/${id}`);
  };
  
  // 发布问卷
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // 生成问卷链接
      const generateSurveyLink = (id) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/survey/${id}/respond`;
      };

      const surveyLink = generateSurveyLink(id);
      
      // 更新问卷状态
      console.log('Publishing survey with link:', surveyLink);
      const updateResult = await updateSurvey(id, {
        status: 'published',
        surveyLink: surveyLink
      });
      
      console.log('Survey published successfully:', updateResult);
      
      // 更新本地状态
      setSurveyStatus('published');
      
      navigate(`/survey-published/${id}`);
    } catch (err) {
      console.error('Error publishing survey:', err);
      setError(err.message || 'Publish survey failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理回答更改
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // 提交问卷回答
  const handleSubmitResponses = async () => {
    // 验证必填题是否已回答
    const unansweredRequired = questions.filter(q => 
      q.required && 
      (answers[q.id] === null || 
       (Array.isArray(answers[q.id]) && answers[q.id].length === 0) ||
       answers[q.id] === '')
    );
    
    if (unansweredRequired.length > 0) {
      const firstUnanswered = unansweredRequired[0];
      alert(`Please answer the required question: "${firstUnanswered.text}"`);
      
      // 自动滚动到第一个未回答的必填问题
      const element = document.getElementById(`question-${firstUnanswered.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("准备提交问卷回答", { 
        surveyId: id,
        responseId: currentResponseId,
        answers
      });
      
      // 准备提交数据
      const responseData = {
        respondentIdentifier: `anonymous_${Date.now()}`,
        responses: Object.keys(answers).map(questionId => ({
          questionId,
          text: Array.isArray(answers[questionId]) 
            ? answers[questionId].join(',')  // 多选题
            : answers[questionId] !== null && answers[questionId] !== undefined 
              ? answers[questionId].toString() // 将所有回答转为字符串
              : ''
        }))
      };
      
      console.log("提交数据:", responseData);
      
      // 调用提交API
      const result = await submitSurveyResponse(id, responseData);
      
      console.log("提交结果:", result);
      
      setSubmitSuccess(true);
      // 显示成功消息，可以在这里添加更多用户反馈
      setTimeout(() => {
        navigate(`/survey-thank-you/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting survey responses:', err);
      setError('Failed to submit responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 渲染单个问题
  const renderQuestion = (question) => {
    const isViewMode = mode === 'preview'; // preview模式下只查看，不交互
    const isInteractive = mode === 'respond'; // 只有在respond模式下才能交互

    return (
      <div 
        id={`question-${question.id}`} 
        className="question-item"
        key={question.id}
      >
        <div className="question-header">
          <div className="question-info">
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
          </div>
        </div>
        
        <div className="question-content">
          <QuestionOptions 
            question={question} 
            mode={mode} 
            currentAnswer={answers[question.id]} 
            handleAnswerChange={handleAnswerChange} 
          />
        </div>
      </div>
    );
  };
  
  // 渲染问题输入控件 - 现在通过QuestionOptions组件实现
  const renderQuestionInput = (question, isViewMode, isInteractive) => {
    return <QuestionOptions 
      question={question} 
      mode={mode} 
      currentAnswer={answers[question.id]} 
      handleAnswerChange={handleAnswerChange} 
    />;
  };
  
  // 渲染页面标题和操作按钮
  const renderHeader = () => {
    // 2023-11-01: 现在只有preview和respond两种模式
    return (
      <div className="survey-header">
        <div className="header-title">
          <h1 className="survey-title">{surveyTitle}</h1>
          {surveyStatus === 'published' && (
            <Badge status="Published" />
          )}
        </div>
        <div className="header-actions">
          {mode === 'preview' && (
            <>
              {/* 2023-11-01: 只在Draft状态显示Edit按钮 */}
              {surveyStatus !== 'published' && (
                <Button 
                  variant="secondary" 
                  icon={<img src={editIcon} alt="Edit" className="button-icon" />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
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
                <Button 
                  variant="success" 
                  icon={<PublishIcon color="#FFFFFF" />}
                  onClick={handlePublish}
                  className="published-button"
                  disabled={questions.length === 0}
                >
                  Publish
                </Button>
              )}
            </>
          )}
          
          {mode === 'respond' && (
            <Button 
              variant="success" 
              onClick={handleSubmitResponses}
              disabled={isSubmitting}
              className="published-button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Responses'}
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // 根据模式选择使用哪种布局组件
  const LayoutComponent = mode === 'respond' ? SimpleLayout : MainLayout;
  
  // 渲染主体内容
  if (error) {
    return (
      <LayoutComponent>
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
          <Button variant="primary" onClick={handleBack}>
            Back to Surveys
          </Button>
        </div>
      </LayoutComponent>
    );
  }
  
  if (isLoading) {
    return (
      <LayoutComponent>
        <FullPageLoading message="Loading survey data..." />
      </LayoutComponent>
    );
  }
  
  return (
    <LayoutComponent>
      <div className="survey-view-container">
        {/* 标题和操作按钮 */}
        {renderHeader()}
        
        {/* 无问题时的警告 */}
        {questions.length === 0 && mode === 'preview' && surveyStatus !== 'published' && (
          <div className="warning-container">
            <p className="warning-message">
              <strong>Note:</strong> You need to add at least one question to publish this survey. Please return to the edit page to add questions.
            </p>
          </div>
        )}
        
        {/* 提交成功消息 */}
        {mode === 'respond' && submitSuccess && (
          <div className="success-container">
            <p className="success-message">
              <strong>Success!</strong> Your responses have been submitted. Redirecting...
            </p>
          </div>
        )}
        
        {/* 问卷内容 */}
        <div className="survey-view-content">
          {/* 问卷描述 */}
          <div className="survey-description-section">
            {surveyDescription && (
              <p className="survey-description">
                {surveyDescription}
              </p>
            )}
          </div>
          
          {/* 问题列表 */}
          <div className="survey-questions-section">
            <h2 className="questions-title">QUESTIONS</h2>
            <div className={`survey-questions ${questions.length === 0 ? 'is-empty' : ''}`}>
              {questions.length === 0 ? (
                <div className="empty-questions-message">
                  <p style={{ 
                    fontSize: '16px', 
                    color: '#666', 
                    textAlign: 'center', 
                    margin: '30px 0'
                  }}>
                    No questions added yet. {mode === 'preview' ? 'Add your first question in the edit page.' : 'This survey has no questions.'}
                  </p>
                </div>
              ) : (
                <div className="question-list">
                  {questions.map(question => renderQuestion(question))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
};

export default SurveyView; 
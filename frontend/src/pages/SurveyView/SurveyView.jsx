import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import SimpleLayout from '../../components/layout/SimpleLayout/SimpleLayout';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading } from '../../components/common/Loading';
import QuestionOptions, { QUESTION_TYPES, QUESTION_TYPE_NAMES } from '../../components/common/QuestionOptions/QuestionOptions';
import SurveyHeader from '../../components/common/SurveyHeader';
import SurveyDescription from '../../components/common/SurveyDescription';
import PublishButton from '../../components/common/PublishButton/PublishButton';
import './SurveyView.css';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

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
// import publishIcon from '../../assets/icons/publish_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';
import backIcon from '../../assets/icons/back_icon.svg';


/**
 * 统一的问卷视图组件
 * @param {string} mode - 组件模式：'preview'(默认)、'respond'、'view'
 * 2023-10-30: 修复问题展示不一致和respond模式布局问题
 * 2023-10-31: 修复问题样式和loading问题
 * 2023-11-01: 统一使用此组件处理所有view和preview场景
 * 2024-05-09: 使用新的通用QuestionOptions组件
 * 2024-10-13: 修复已发布问卷预览页面的按钮文本和跳转逻辑
 * 2024-10-14: 使用新的公共组件SurveyHeader和SurveyDescription
 * 2024-10-20: 修复重复生成问卷响应记录问题
 * 2024-10-21: 修复URL重定向导致的重复响应记录问题
 */
const SurveyView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, responseId } = useParams();
  const [searchParams] = useSearchParams();
  
  // 从URL确定当前模式
  const pathParts = location.pathname.split('/');
  let mode = 'preview'; // 默认模式
  if (pathParts.includes('respond')) {
    mode = 'respond';
  } 
  // 2024-11-01: 修复：添加view模式的检测逻辑
  else if (pathParts.includes('view')) {
    mode = 'view';
  }
  
  // 获取URL中的查询参数
  const queryParams = new URLSearchParams(location.search);
  // 2023-11-01: 修复查询参数t的处理，添加更多调试日志
  // 2024-05-14: 修改：不再直接使用t参数作为responseId，避免非数字ID引起的错误
  const responseToken = queryParams.get('t'); // 从查询参数获取t参数作为令牌，不直接用作ID
  
  // 调试输出路由信息
  console.log('=== URL和路由参数信息 ===', {
    pathname: location.pathname,
    search: location.search,
    mode,
    id,
    responseId,
    responseToken,
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
  // 2024-05-14: 修改：初始状态不设置responseId，由useEffect中的逻辑处理
  const [currentResponseId, setCurrentResponseId] = useState(responseId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // 追踪初始加载是否完成
  const [isCreatingResponse, setIsCreatingResponse] = useState(false); // 追踪是否正在创建响应ID
  const [hasFixedUrl, setHasFixedUrl] = useState(false); // 追踪是否已修复URL格式
  
  // View模式相关状态
  const [responseData, setResponseData] = useState(null);
  
  console.log(`当前模式: ${mode},, 问卷ID: ${id}, 响应ID: ${currentResponseId}, 响应令牌: ${responseToken}`, {
    responseToken,
    responseIdFromURL: responseId,
  });
  
  // 组件挂载时判断并处理URL格式问题，避免重复跳转
  useEffect(() => {
    // 仅在第一次挂载时执行URL格式修复
    if (hasFixedUrl) return;
    
    // 检测到错误URL格式的情况 - 如 /survey/55/respond?t=1pdaa7
    if (location.pathname.startsWith('/survey/') && location.pathname.includes('/respond') && id) {
      console.log('检测到错误的URL格式，将重定向到正确的URL格式');
      // 创建正确格式的URL，保留查询参数
      const correctUrl = `/surveys/respond/${id}${location.search}`;
      // 使用replace而不是push，避免在历史记录中留下多余条目
      window.history.replaceState(null, '', correctUrl);
      setHasFixedUrl(true);
      return; // 不继续处理，等待URL更新后的重新渲染
    }
    
    setHasFixedUrl(true);
  }, [location.pathname, id, location.search, hasFixedUrl]);
  
  // 组件卸载时的清理函数
  useEffect(() => {
    return () => {
      console.log('SurveyView unmounting, cleaning up...');
    };
  }, []);
  
  // 主要的数据加载effect
  useEffect(() => {
    console.log(`SurveyView useEffect 被调用，id: ${id}, mode: ${mode}, responseId: ${responseId}, responseToken: ${responseToken}`);
    
    if (!id || !hasFixedUrl) return;
    
    // 如果是在响应页面，但已标记为完成，则跳转到感谢页面
    if (mode === 'respond') {
      const isCompleted = sessionStorage.getItem(`survey_${id}_completed`) === 'true';
      if (isCompleted) {
        console.log(`用户已完成问卷 ${id}，跳转到感谢页面`);
        window.location.href = `/survey-thank-you/${id}`;
        return;
      }
    }

    // 如果正在创建响应或已经完成初始加载，不需要再重复加载
    if (isCreatingResponse || initialLoadComplete) {
      return;
    }

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
        
        // 2024-11-01：修复：根据模式决定是否继续加载响应数据
        // view和preview模式不需要处理响应ID，直接返回
        if (mode === 'view' || mode === 'preview') {
          setIsLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        // 4. 处理响应ID逻辑
        if (mode === 'respond') {
          console.log('进入响应ID处理逻辑，检查URL参数和缓存');
          
          // 检查是否已有本地存储的respondent_identifier
          const storageKey = `survey_${id}_respondent`;
          let storedRespondentId = sessionStorage.getItem(storageKey);
          let existingResponseId = null;
          
          console.log(`检查是否有本地存储的respondent_identifier: ${storedRespondentId}`);
          
          // 优先使用已存储的respondent_identifier
          if (storedRespondentId && storedRespondentId.startsWith('anonymous_')) {
            console.log(`使用本地存储的respondent_identifier: ${storedRespondentId}`);
            
            // 查询数据库，检查是否已存在使用此标识符的记录
            try {
              console.log(`检查标识符 ${storedRespondentId} 是否有现有响应记录`);
              const { data, error } = await supabase
                .from('cu_survey_responses')
                .select('id, status')
                .eq('survey_id', id)
                .eq('respondent_identifier', storedRespondentId)
                .order('created_at', { ascending: false })
                .limit(1);
                
              if (error) {
                console.error('查询响应记录失败:', error);
              } else if (data && data.length > 0) {
                existingResponseId = data[0].id;
                console.log(`找到现有响应记录 ID: ${existingResponseId}, 状态: ${data[0].status}`);
                
                // 如果状态是completed，标记为已完成并重定向
                if (data[0].status === 'completed') {
                  console.log('该响应已完成，设置标记并跳转');
                  sessionStorage.setItem(`survey_${id}_completed`, 'true');
                  window.location.href = `/survey-thank-you/${id}`;
                  return;
                }
              } else {
                console.log('未找到现有响应记录');
              }
            } catch (err) {
              console.error('检查响应ID时出错:', err);
            }
          }
          
          // 确定最终使用的响应ID，按优先级: 
          // 1. URL参数中的responseId
          // 2. 从数据库查询到的已有响应ID
          // 3. 现有的currentResponseId
          // 4. 创建新ID
          if (responseId && !isNaN(Number(responseId))) {
            console.log(`使用URL中的响应ID参数: ${responseId}`);
            setCurrentResponseId(Number(responseId));
          } 
          else if (existingResponseId) {
            console.log(`使用从数据库查询到的响应ID: ${existingResponseId}`);
            setCurrentResponseId(existingResponseId);
          }
          else if (currentResponseId && !isNaN(Number(currentResponseId))) {
            console.log(`继续使用现有响应ID: ${currentResponseId}`);
            // 继续使用已有的currentResponseId
          }
          else if (!isCreatingResponse) {
            console.log('没有现有响应ID，创建新的响应记录');
            setIsCreatingResponse(true);
            
            try {
              // 创建响应记录时，传递现有的respondent_identifier（如果有）
              console.log(`创建新响应记录, 标识符: ${storedRespondentId || '将自动生成'}`);
              const newResponse = await createSurveyResponse(id, storedRespondentId);
              console.log(`成功创建新响应记录, ID: ${newResponse.id}, 标识符: ${newResponse.respondent_identifier}`);
              
              // 在会话存储中保存respondent_identifier以便后续使用
              sessionStorage.setItem(storageKey, newResponse.respondent_identifier);
              
              // 设置新创建的响应ID
              setCurrentResponseId(newResponse.id);
              
              // 保持URL中的t参数（如果有），但实际使用服务端生成的respondent_identifier
              if (!responseToken) {
                // 更新URL，但不刷新页面，使用respondent_identifier作为t参数
                // 注意：这里只是为了保持URL格式一致，实际标识符已存储在sessionStorage
                const randomParam = Math.random().toString(36).substring(2, 8);
                const newUrl = `/surveys/respond/${id}?t=${randomParam}`;
                window.history.replaceState(null, '', newUrl);
              }
            } catch (error) {
              console.error('创建响应ID失败', error);
              setError('Failed to create response ID. Please try again.');
            } finally {
              setIsCreatingResponse(false);
            }
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
  }, [id, mode, initialLoadComplete, responseId, responseToken, hasFixedUrl, currentResponseId, isCreatingResponse]);

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
      
      // 更新发布后，跳转到发布页面
      navigate(`/survey-published/${id}`);
    } catch (error) {
      console.error('Publishing survey failed:', error);
      alert('Failed to publish survey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 2024-10-13: 新增分享已发布问卷的处理函数
  const handleShareSurvey = () => {
    navigate(`/survey-published/${id}`);
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
      
      // 确保responseId是一个数字
      if (!currentResponseId || isNaN(Number(currentResponseId))) {
        throw new Error('Invalid response ID. Please refresh the page and try again.');
      }
      
      console.log('准备提交问卷回答，数据：', {
        responseId: currentResponseId,
        surveyId: id,
        answers: answers
      });

      // 2024-05-14: 确保使用数字类型的responseId
      const numericResponseId = Number(currentResponseId);
      const result = await submitSurveyResponse(numericResponseId, answers);
      
      console.log('问卷提交结果：', result);
      
      // 设置标记，表示此问卷已完成，防止再次创建响应记录
      sessionStorage.setItem(`survey_${id}_completed`, 'true');
      
      setSubmitSuccess(true);
      
      // 提交成功后，使用完全重定向代替导航，避免保留组件状态
      window.location.href = `/survey-thank-you/${id}`;
      return; // 中止执行，等待页面跳转
    } catch (error) {
      // 2024-10-14: 增强错误日志，帮助诊断提交失败问题
      // 2024-05-14: 添加更多错误详情
      console.error('提交问卷回答失败', {
        error: error,
        message: error.message,
        stack: error.stack,
        responseId: currentResponseId,
        responseIdType: typeof currentResponseId,
        numericResponseId: Number(currentResponseId),
        surveyId: id
      });
      alert(`Failed to submit your responses: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 问题渲染函数
  const renderQuestion = (question) => {
    // 2024-11-01：修复：view模式也应该是只查看不交互的
    const isViewMode = mode === 'preview' || mode === 'view'; // preview和view模式下只查看，不交互
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
    // 准备左侧标题旁边显示的内容
    const leftContent = surveyStatus === 'published' && <Badge status="Published">Published</Badge>;
    
    // 准备右侧操作区域内容
    let rightContent = null;
    
    // 2024-11-02：修改：使用PublishButton组件
    if (mode === 'view') {
      // view模式：只显示PublishButton组件
      rightContent = (
        <PublishButton 
          isPublished={surveyStatus === 'published'} 
          onPublish={handleShareSurvey}
          isLoading={isLoading}
        />
      );
    } else if (mode === 'preview') {
      if (surveyStatus !== 'published') {
        // 未发布状态: 显示Edit和Publish按钮
        rightContent = (
            <>
              <Button 
                variant="secondary" 
                icon={<img src={editIcon} alt="Edit" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              
              <PublishButton 
                isPublished={false} 
                onPublish={handlePublish}
                isLoading={isLoading}
              />
            </>
        );
      } else {
        // 已发布状态: 显示Edit和Share Survey按钮
        rightContent = (
          <>
            <Button 
              variant="secondary" 
              icon={<img src={editIcon} alt="Edit" />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          
            <PublishButton 
              isPublished={true} 
              onPublish={handleShareSurvey}
              isLoading={isLoading}
            />
          </>
        );
      }
    }
    
    return (
      <SurveyHeader 
        title={surveyTitle || 'Untitled Survey'} 
        leftContent={leftContent}
        rightContent={rightContent}
      />
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
        <SurveyDescription description={surveyDescription} />
        
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
            className="submit-button full-width"
          >
            Submit
          </Button>
                </div>
              )}
            </div>
  );
};

export default SurveyView; 
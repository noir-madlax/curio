import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading, LoadingOverlay, LoadingIndicator } from '../../components/common/Loading';
import './NewSurvey.css';
import { 
  createSurvey, 
  updateSurvey, 
  getSurveyById, 
  createQuestion, 
  getQuestionsBySurveyId, 
  updateQuestion, 
  deleteQuestion,
  reorderQuestions,
  getQuestionOptions,
  createQuestionOption,
  deleteQuestionOption,
  createMultipleQuestionOptions
} from '../../services/surveyService';

// 导入SVG图标
// Import SVG icons
import previewIcon from '../../assets/icons/preview_icon.svg';
import saveIcon from '../../assets/icons/save_icon.svg';
import publishIcon from '../../assets/icons/publish_icon.svg';
import infoIcon from '../../assets/icons/info_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';
import deleteIcon from '../../assets/icons/delete_icon.svg';
import dragIcon from '../../assets/icons/drag_icon.svg';
import plusIcon from '../../assets/icons/plus_icon.svg';

// 2024-09-27T17:00:00Z 新增：定义问题类型常量
// 2024-09-27T17:00:00Z Added: Define question type constants
const QUESTION_TYPES = {
  TEXT: 'text',
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  // 2024-10-05T14:30:00Z 修改：修正NPS和BOOLEAN类型值以匹配数据库约束
  NPS: 'rating_scale',
  BOOLEAN: 'yes_no',
  // 可以根据需要添加其他类型
  // Can add other types as needed
};

// 2024-09-27T17:00:00Z 新增：定义问题类型的用户友好名称
// 2024-09-27T17:00:00Z Added: Define user-friendly names for question types
const QUESTION_TYPE_NAMES = {
  [QUESTION_TYPES.TEXT]: 'Text Question',
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Choice',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.NPS]: 'NPS Rating',
  [QUESTION_TYPES.BOOLEAN]: 'Boolean Question',
};

// 2024-08-07T17:45:00Z 新增：自定义图标组件，可以动态设置颜色
// 2024-08-07T17:45:00Z Added: Custom icon component with dynamic color setting
const PublishIcon = ({ color = "#252326" }) => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="button-icon">
    <path d="M13.2946 3.7081L2.35237 5.54223C2.32466 5.54687 2.29868 5.55878 2.27709 5.57675C2.25549 5.59472 2.23905 5.61809 2.22945 5.64449C2.21985 5.67089 2.21743 5.69937 2.22244 5.72701C2.22745 5.75465 2.2397 5.78047 2.25795 5.80183L3.61535 7.38993C3.65802 7.43988 3.71515 7.47535 3.77884 7.49145C3.84253 7.50755 3.90965 7.50349 3.97094 7.47982L13.3364 3.86043C13.3548 3.8534 13.3699 3.83978 13.3788 3.82221C13.3878 3.80464 13.3898 3.78438 13.3846 3.76538C13.3794 3.74637 13.3673 3.72998 13.3507 3.71939C13.3341 3.7088 13.3141 3.70478 13.2947 3.7081H13.2946ZM11.2488 15.3536L15.7123 4.32646C15.724 4.29745 15.7269 4.26561 15.7206 4.23496C15.7143 4.20431 15.6991 4.17621 15.6768 4.1542C15.6546 4.13219 15.6263 4.11724 15.5956 4.11125C15.5649 4.10525 15.5331 4.10847 15.5042 4.1205L5.11047 8.45449C5.07528 8.46915 5.04413 8.49205 5.01963 8.52126C4.99514 8.55047 4.97802 8.58514 4.96971 8.62234C4.96141 8.65955 4.96216 8.69821 4.97191 8.73506C4.98166 8.77191 5.00012 8.80589 5.02573 8.83412L10.9842 15.4007C11.0023 15.4206 11.0251 15.4355 11.0505 15.4442C11.0759 15.4529 11.1031 15.455 11.1296 15.4503C11.156 15.4455 11.1808 15.4342 11.2017 15.4173C11.2225 15.4004 11.2388 15.3784 11.2488 15.3536H11.2488ZM4.68323 15.2817C4.41031 15.4349 4.06567 15.3734 4.00823 15.3663C3.5725 15.3128 3.31124 14.9155 3.3648 14.4797L3.05086 8.72717L1.43823 6.79926C0.843835 6.16948 0.87446 5.18021 1.50662 4.58962C1.74982 4.36265 2.05873 4.21865 2.38894 4.17833L15.2466 2.42497C16.1077 2.31945 16.8926 2.92852 16.9997 3.78545C17.0364 4.079 16.9886 4.37684 16.862 4.64429L12.5082 15.822C12.1385 16.6026 11.2023 16.9363 10.4173 16.5675C10.2388 16.4836 10.0776 16.3669 9.94214 16.2235L7.08741 13.0808C7.07162 13.0919 6.27023 13.8256 4.68323 15.2818V15.2817ZM4.28623 10.2378L4.47688 13.5419C4.47863 13.5724 4.48916 13.6017 4.50719 13.6264C4.52521 13.651 4.54998 13.67 4.5785 13.6809C4.60703 13.6918 4.6381 13.6943 4.668 13.688C4.69789 13.6817 4.72533 13.6669 4.74702 13.6454L6.06831 12.3342C6.12519 12.2778 6.15862 12.2019 6.16188 12.1218C6.16515 12.0418 6.13802 11.9635 6.08593 11.9026L4.56526 10.1255C4.54367 10.1002 4.51469 10.0824 4.48242 10.0745C4.45014 10.0666 4.4162 10.069 4.38537 10.0814C4.35454 10.0938 4.32839 10.1156 4.3106 10.1437C4.29282 10.1717 4.28429 10.2047 4.28623 10.2378Z" fill={color}/>
  </svg>
);

// 2024-09-27T16:00:00Z 新增：选项管理组件
// 2024-09-27T16:00:00Z Added: Options management component
const OptionsManager = ({ 
  questionType, 
  options, 
  onAddOption, 
  onUpdateOption, 
  onDeleteOption, 
  onDragEnd,
  npsLabels,
  onUpdateNpsLabel,
  booleanLabels,
  onUpdateBooleanLabel,
  disabled
}) => {
  // 条件渲染：只在选择了单选或多选时显示选项管理
  if (questionType === QUESTION_TYPES.SINGLE_CHOICE || questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return (
      <div className="options-container">
        <h3>Question Options</h3>
        <div className="options-list">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="optionsList">
              {(provided) => (
                <div
                  className="options-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {options.map((option, index) => (
                    <Draggable 
                      key={option.id || `option-${index}`} 
                      draggableId={option.id || `option-${index}`} 
                      index={index}
                      isDragDisabled={disabled}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`option-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                        >
                          <div className="option-number">{index + 1}</div>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => onUpdateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="option-input"
                            disabled={disabled}
                          />
                          <button 
                            className="delete-option-button"
                            onClick={() => onDeleteOption(index)}
                            disabled={disabled || options.length <= 2}
                            title={options.length <= 2 ? "Minimum 2 options required" : "Delete this option"}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <button 
          className="add-option-button"
          onClick={onAddOption}
          disabled={disabled}
        >
          + Add Option
        </button>
      </div>
    );
  } 
  // 2024-10-06T12:45:00Z 修改：拆分NPS选项布局为单独渲染判断
  else if (questionType === QUESTION_TYPES.NPS) {
    // 为NPS问题显示标签编辑器
    return (
      <div className="nps-labels-container">
        <h3>NPS Scale Labels</h3>
        <div className="nps-label-item">
          <span>0:</span>
          <input
            type="text"
            value={npsLabels[0]}
            onChange={(e) => onUpdateNpsLabel(0, e.target.value)}
            className="nps-label-input"
            placeholder="Label for 0"
            disabled={disabled}
          />
        </div>
        <div className="nps-label-item">
          <span>10:</span>
          <input
            type="text"
            value={npsLabels[10]}
            onChange={(e) => onUpdateNpsLabel(10, e.target.value)}
            className="nps-label-input"
            placeholder="Label for 10"
            disabled={disabled}
          />
        </div>
        <div className="nps-scale-preview">
          {Array.from({length: 11}, (_, i) => (
            <div key={i} className="nps-number">{i}</div>
          ))}
        </div>
      </div>
    );
  }
  // 2024-10-06T12:45:00Z 修改：拆分布尔题选项布局为单独渲染判断 
  else if (questionType === QUESTION_TYPES.BOOLEAN) {
    // 为布尔问题显示标签编辑器
    return (
      <div className="boolean-labels-container">
        <h3>Boolean Labels</h3>
        <div className="boolean-label-item">
          <span>Yes:</span>
          <input
            type="text"
            value={booleanLabels.true}
            onChange={(e) => onUpdateBooleanLabel('true', e.target.value)}
            className="boolean-label-input"
            placeholder="Label for Yes"
            disabled={disabled}
          />
        </div>
        <div className="boolean-label-item">
          <span>No:</span>
          <input
            type="text"
            value={booleanLabels.false}
            onChange={(e) => onUpdateBooleanLabel('false', e.target.value)}
            className="boolean-label-input"
            placeholder="Label for No"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
  
  // 对于其他问题类型，不显示选项管理
  return null;
};

const NewSurvey = ({ viewMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && !viewMode;
  const isViewing = !!id && viewMode;
  
  const [activeTab, setActiveTab] = useState('details');
  const [surveyTitle, setSurveyTitle] = useState('New Survey');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyThanksMessage, setSurveyThanksMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(questions.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing || isViewing);
  const [error, setError] = useState(null);
  const [surveyId, setSurveyId] = useState(id || null);
  const [surveyStatus, setSurveyStatus] = useState('draft');
  // 2023-10-31: 添加缺失的状态变量，修复错误
  const [isPublished, setIsPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // 问题表单状态
  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  
  // 2024-09-27T15:20:00Z 新增：问题类型和必填状态
  // 2024-09-27T15:20:00Z Added: Question type and required status
  const [selectedQuestionType, setSelectedQuestionType] = useState(QUESTION_TYPES.TEXT);
  // 2024-09-27T18:00:00Z 新增：恢复必填状态变量，但仅用于UI显示，不实际保存到数据库
  // 2024-09-27T18:00:00Z Added: Restore required status variable, only for UI display, not actually saved to database
  const [isQuestionRequired, setIsQuestionRequired] = useState(false);
  
  // 2024-09-27T15:20:00Z 新增：选项相关状态
  // 2024-09-27T15:20:00Z Added: Option-related states
  const [questionOptions, setQuestionOptions] = useState([]);
  const [npsLabels, setNpsLabels] = useState({
    0: 'Not likely',
    10: 'Extremely likely'
  });
  const [booleanLabels, setBooleanLabels] = useState({
    true: 'Yes',
    false: 'No'
  });
  
  useEffect(() => {
    if (isEditing || isViewing) {
      const fetchSurveyData = async () => {
        setInitialLoading(true);
        try {
          const surveyData = await getSurveyById(id);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          setSurveyStatus(surveyData.status.toLowerCase());
          setSurveyThanksMessage(surveyData.thanksMessage || ''); // 2024-05-09: 从问卷数据中加载感谢信息
          
          const questionsData = await getQuestionsBySurveyId(id);
          
          // 2024-10-05T14:55:00Z 修改：确保获取和存储问题的完整信息，包括类型
          // 2024-10-06T12:35:00Z 修改：为每个问题加载对应的选项
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
            
            // 如果是需要选项的问题类型，加载选项
            if (q.type === QUESTION_TYPES.SINGLE_CHOICE || 
                q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
                q.type === QUESTION_TYPES.NPS ||
                q.type === QUESTION_TYPES.BOOLEAN) {
              try {
                const options = await getQuestionOptions(q.id);
                if (options && options.length > 0) {
                  questionWithOptions.options = options;
                }
        } catch (err) {
                console.error(`Error loading options for question ${q.id}:`, err);
              }
            }
            
            questionsWithOptions.push(questionWithOptions);
          }
          
          setQuestions(questionsWithOptions);
          
          // 获取发布状态
          if (surveyData.status.toLowerCase() === 'published') {
            setIsPublished(true);
          }
        } catch (error) {
          console.error('Error loading survey:', error);
          setErrorMessage('Failed to load survey data. Please try again later.');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchSurveyData();
    }
  }, [id, isEditing, isViewing]);
  
  // 2024-10-06T17:15:00Z 新增：在编辑页面自动加载选项数据
  useEffect(() => {
    if (!isViewing && questions.length > 0) {
      const fetchOptionsForQuestions = async () => {
        const updatedQuestions = [...questions];
        let hasUpdates = false;
        
        // 检查是否有需要加载选项的问题
        for (let i = 0; i < updatedQuestions.length; i++) {
          const q = updatedQuestions[i];
          if ((q.type === QUESTION_TYPES.SINGLE_CHOICE || 
               q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
               q.type === QUESTION_TYPES.NPS ||
               q.type === QUESTION_TYPES.BOOLEAN) && 
              (!q.options || q.options.length === 0)) {
            try {
              const options = await getQuestionOptions(q.id);
              if (options && options.length > 0) {
                updatedQuestions[i] = {
                  ...q,
                  options: options
                };
                hasUpdates = true;
              }
            } catch (err) {
              console.error(`Error loading options for question ${q.id}:`, err);
            }
          }
        }
        
        // 只有在有更新时才设置状态
        if (hasUpdates) {
          setQuestions(updatedQuestions);
        }
      };
      
      fetchOptionsForQuestions();
    }
  }, [isViewing, questions.length]);
  
  const handleNext = () => {
    // 2024-08-16T10:45:00Z 修改：确保标题和欢迎信息都已填写
    // 2024-08-16T10:45:00Z Modified: Ensure title and welcome message are filled in
    if (!surveyTitle.trim() || !surveyDescription.trim()) {
      return;
    }
    
    setActiveTab('questions');
    if (questions.length === 0) {
      setShowAddForm(true);
    }
  };
  
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'questions') {
      if (questions.length === 0) {
      setShowAddForm(true);
      } else {
      setShowAddForm(false);
    }
    }
  };
  
  const handlePreview = async () => {
    // 2024-08-16T10:30:00Z 修改：确保至少有一个问题才能预览
    // 2024-08-16T10:30:00Z Modified: Ensure there is at least one question to preview
    if (questions.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // 预览前先保存问卷 - 2023-11-10
      // Save survey before preview - 2023-11-10
      await handleSave();
      
      // 保存成功后跳转到预览页面
      // Navigate to preview page after successful save
      navigate(`/surveys/preview/${surveyId}`);
    } catch (error) {
      // 如果保存失败仍然可以预览，但不会保存最新修改
      // If save fails, can still preview, but won't save latest changes
      if (surveyId) {
        navigate(`/surveys/preview/${surveyId}`);
      }
      console.error('Failed to save before preview:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveThenPreview = async () => {
    setIsLoading(true);
    try {
      const newSurvey = await createSurvey({
        title: surveyTitle,
        description: surveyDescription
      });
      setSurveyId(newSurvey.id);
      
      navigate(`/surveys/preview/${newSurvey.id}`);
    } catch (err) {
      setError(err.message || 'Save survey failed');
      console.error('Error saving survey:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      // 2024-08-16T11:00:00Z 修改：确保标题和欢迎信息都已填写
      // 2024-08-16T11:00:00Z Modified: Ensure title and welcome message are filled in
      if (!surveyTitle.trim() || !surveyDescription.trim()) {
        return;
      }
      
      setIsLoading(true);
      
      let savedSurveyId;
      
      if (surveyId) {
        await updateSurvey(surveyId, {
          title: surveyTitle,
          description: surveyDescription,
          thanksMessage: surveyThanksMessage
        });
        savedSurveyId = surveyId;
      } 
      else {
        const newSurvey = await createSurvey({
          title: surveyTitle,
          description: surveyDescription,
          thanksMessage: surveyThanksMessage
        });
        savedSurveyId = newSurvey.id;
        setSurveyId(savedSurveyId);
      }
      
      navigate('/surveys');
    } catch (err) {
      setError(err.message || 'Save survey failed');
      console.error('Error saving survey:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      // 2024-08-16T11:15:00Z 修改：确保标题、欢迎信息已填写且至少有一个问题
      // 2024-08-16T11:15:00Z Modified: Ensure title, welcome message are filled in and at least one question exists
      if (!surveyTitle.trim() || !surveyDescription.trim() || questions.length === 0) {
        return;
      }
      
    setIsLoading(true);
      
      let publishedSurveyId;
      
      // 2024-08-06 Added: Generate unique survey link
      const generateSurveyLink = async (id) => {
        // Generate a unique link based on ID, can add random characters to increase security
        const baseUrl = window.location.origin; // Get the current website base URL
        const randomStr = Math.random().toString(36).substring(2, 8);
        const surveyLink = `${baseUrl}/survey/${id}/respond?t=${randomStr}`;
        
        // Generate survey link
        await updateSurvey(id, {
          surveyLink: surveyLink, // 2024-08-06 Added: Save survey link
          thanksMessage: surveyThanksMessage
        });
      };
      
      if (surveyId) {
        // 2023-11-01: 确保更新问卷状态为已发布
        await updateSurvey(surveyId, {
          status: 'published',
          thanksMessage: surveyThanksMessage
        });
        
        // 生成问卷链接
        // Generate survey link
        await generateSurveyLink(surveyId);
        publishedSurveyId = surveyId;
        
        // 更新本地状态
        setSurveyStatus('published');
        setIsPublished(true);
      } else {
        const newSurvey = await createSurvey({
          title: surveyTitle,
          description: surveyDescription,
          status: 'published',
          thanksMessage: surveyThanksMessage
        });
        publishedSurveyId = newSurvey.id;
        
        // 2024-08-06 Added: For newly created surveys, need to update the generated link
        await generateSurveyLink(publishedSurveyId);
      }
      
      navigate(`/survey-published/${publishedSurveyId}`);
    } catch (err) {
      setError(err.message || 'Publish survey failed');
      console.error('Error publishing survey:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setQuestionText('');
      setEditingQuestionId(null);

      // 2024-05-09：添加表单显示后自动滚动到Add New Question处
      setTimeout(() => {
        const addFormElement = document.querySelector('.add-question-form');
        if (addFormElement) {
          addFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  
  const handleAddQuestion = async () => {
    if (!questionText.trim()) return;
    
    // 验证问题类型是否需要选项且已提供足够选项
    // Verify question type requires options and enough options are provided
    if (
      (selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
       selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE) && 
      questionOptions.length < 2
    ) {
      // 显示错误提示
      alert('At least 2 options are required for single/multiple choice questions');
      return;
    }
    
    try {
      // 2024-05-09: 在发送请求前立即隐藏表单，改善用户体验
      setShowAddForm(false);
      
      // If we don't have a surveyId yet, create the survey first
      if (!surveyId) {
        setIsLoading(true);
        const newSurvey = await createSurvey({
          title: surveyTitle || 'New Survey',
          description: surveyDescription || ''
        });
        setSurveyId(newSurvey.id);
        
        // Now we have a surveyId to use
        const questionData = {
          surveyId: newSurvey.id,
          text: questionText,
          type: selectedQuestionType,
          // 2024-10-05T18:45:00Z 新增：保存问题的required状态
          required: isQuestionRequired,
          objectives: ''
        };
        
        // 2024-10-06T21:00:00Z 修改：在乐观更新时包含选项数据
        // Create a temporary optimistic question with options
        const tempId = `temp-${Date.now()}`;
        const optimisticQuestion = {
          id: tempId,
          text: questionText,
          number: questions.length + 1,
          type: selectedQuestionType,
          required: isQuestionRequired,
          isSubmitting: true,
          // 2024-10-06T21:00:00Z 新增：增加选项数据
          options: getOptimisticOptions(selectedQuestionType)
        };
        
        // Add to questions array immediately for optimistic UI
        setQuestions(prev => [...prev, optimisticQuestion]);
        
        // Save question to server
        const savedQuestion = await createQuestion(questionData);
        
        // Update questions array with real data
        setQuestions(prev => 
          prev.map(q => q.id === tempId ? {
            ...savedQuestion,
          number: questions.length + 1,
            type: savedQuestion.type,
            required: savedQuestion.required,
            // 2024-10-06T21:00:00Z 新增：保留乐观更新的选项，直到服务器返回真实选项
            options: q.options
          } : q)
        );
        
        // Process options if needed
        if ((selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
             selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE)) {
          try {
            await createMultipleQuestionOptions(savedQuestion.id, 
              questionOptions.map((option, index) => ({
                text: option.text,
                order: index + 1
              }))
            );
          } catch (optionError) {
            console.error('Error saving question options:', optionError);
            alert('Question saved, but options failed to save');
          }
        }
        // 2024-10-06T12:00:00Z 新增：保存布尔题自定义标签到选项
        else if (selectedQuestionType === QUESTION_TYPES.BOOLEAN) {
          try {
            await createMultipleQuestionOptions(savedQuestion.id, [
              { text: booleanLabels.true, order: 1, value: 'true' },
              { text: booleanLabels.false, order: 2, value: 'false' }
            ]);
          } catch (optionError) {
            console.error('Error saving boolean options:', optionError);
            alert('Question saved, but boolean options failed to save');
          }
        }
        // 2024-10-06T12:00:00Z 新增：保存NPS题自定义标签到选项
        else if (selectedQuestionType === QUESTION_TYPES.NPS) {
          try {
            await createMultipleQuestionOptions(savedQuestion.id, [
              { text: npsLabels[0], order: 1, value: '0' },
              { text: npsLabels[10], order: 2, value: '10' }
            ]);
          } catch (optionError) {
            console.error('Error saving NPS options:', optionError);
            alert('Question saved, but NPS labels failed to save');
          }
        }
        
        setIsLoading(false);
      } else {
        // Regular question creation - we already have a surveyId
        // 准备要保存的问题数据
        const questionData = {
          surveyId: surveyId,
            text: questionText,
          type: selectedQuestionType,
          // 2024-10-05T18:45:00Z 新增：保存问题的required状态
          required: isQuestionRequired,
          objectives: ''
        };
        
        // 2024-10-06T21:00:00Z 修改：在乐观更新时包含选项数据
        // 标记该问题项为正在提交状态
        const tempId = `temp-${Date.now()}`;
        const optimisticQuestion = {
          id: editingQuestionId || tempId,
          text: questionText,
          number: editingQuestionId ? 
            questions.find(q => q.id === editingQuestionId)?.number : 
            questions.length + 1,
          type: selectedQuestionType,
          required: isQuestionRequired,
          isSubmitting: true,
          // 2024-10-06T21:00:00Z 新增：增加选项数据
          options: editingQuestionId ? 
            questions.find(q => q.id === editingQuestionId)?.options || getOptimisticOptions(selectedQuestionType) : 
            getOptimisticOptions(selectedQuestionType)
        };
        
        let savedQuestion;
        
        if (editingQuestionId) {
          // 更新现有问题
          setQuestions(prev => 
            prev.map(q => q.id === editingQuestionId ? optimisticQuestion : q)
          );
          
          savedQuestion = await updateQuestion(editingQuestionId, questionData);
          
          // 更新问题列表中的问题
          setQuestions(prev => 
            prev.map(q => q.id === editingQuestionId ? {
              ...savedQuestion,
              number: q.number,
              type: savedQuestion.type,
              required: savedQuestion.required,
              // 2024-10-06T21:00:00Z 新增：保留乐观更新的选项，直到服务器返回真实选项
              options: q.options
            } : q)
          );
          
        } else {
          // 添加问题到列表中（乐观更新）
          setQuestions(prev => [...prev, optimisticQuestion]);
          
          // 保存问题到服务器
          savedQuestion = await createQuestion(questionData);
          
          // 用服务器返回的数据更新问题列表
          setQuestions(prev => 
            prev.map(q => q.id === tempId ? {
              ...savedQuestion,
          number: questions.length + 1,
              type: savedQuestion.type,
              required: savedQuestion.required,
              // 2024-10-06T21:00:00Z 新增：保留乐观更新的选项，直到服务器返回真实选项
              options: q.options
            } : q)
          );
        }
        
        // 2024-09-27T17:35:00Z 新增：处理选项
        if (savedQuestion &&
            (selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
             selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE)) {
          try {
            // 删除现有选项
            if (editingQuestionId) {
              // 获取问题的现有选项
              const existingOptions = await getQuestionOptions(savedQuestion.id);
              
              // 删除现有的所有选项
              for (const option of existingOptions) {
                await deleteQuestionOption(option.id);
              }
            }
            
            // 批量保存选项
            const savedOptions = await createMultipleQuestionOptions(savedQuestion.id, 
              questionOptions.map((option, index) => ({
                text: option.text,
                order: index + 1
              }))
            );
            
            // 2024-10-06T21:00:00Z 新增：使用服务器返回的真实选项数据更新问题
            if (savedOptions && savedOptions.options) {
              setQuestions(prev => 
                prev.map(q => q.id === savedQuestion.id ? {
                  ...q,
                  options: savedOptions.options
                } : q)
              );
            }
            
          } catch (optionError) {
            console.error('Error saving question options:', optionError);
            // 非阻断错误，不影响问题创建
            alert('Question saved, but options failed to save');
          }
        }
        // 2024-10-06T12:05:00Z 新增：保存/更新布尔题自定义标签到选项
        else if (savedQuestion && selectedQuestionType === QUESTION_TYPES.BOOLEAN) {
          try {
            // 如果是编辑现有问题，先删除现有选项
            if (editingQuestionId) {
              // 获取问题的现有选项
              const existingOptions = await getQuestionOptions(savedQuestion.id);
              
              // 删除现有的所有选项
              for (const option of existingOptions) {
                await deleteQuestionOption(option.id);
              }
            }
            
            // 创建新选项
            const savedOptions = await createMultipleQuestionOptions(savedQuestion.id, [
              { text: booleanLabels.true, order: 1, value: 'true' },
              { text: booleanLabels.false, order: 2, value: 'false' }
            ]);
            
            // 2024-10-06T21:00:00Z 新增：使用服务器返回的真实选项数据更新问题
            if (savedOptions && savedOptions.options) {
              setQuestions(prev => 
                prev.map(q => q.id === savedQuestion.id ? {
                  ...q,
                  options: savedOptions.options
                } : q)
              );
            }
            
          } catch (optionError) {
            console.error('Error saving boolean options:', optionError);
            alert('Question saved, but boolean options failed to save');
          }
        }
        // 2024-10-06T12:05:00Z 新增：保存/更新NPS题自定义标签到选项
        else if (savedQuestion && selectedQuestionType === QUESTION_TYPES.NPS) {
          try {
            // 如果是编辑现有问题，先删除现有选项
            if (editingQuestionId) {
              // 获取问题的现有选项
              const existingOptions = await getQuestionOptions(savedQuestion.id);
              
              // 删除现有的所有选项
              for (const option of existingOptions) {
                await deleteQuestionOption(option.id);
              }
            }
            
            // 创建新选项
            const savedOptions = await createMultipleQuestionOptions(savedQuestion.id, [
              { text: npsLabels[0], order: 1, value: '0' },
              { text: npsLabels[10], order: 2, value: '10' }
            ]);
            
            // 2024-10-06T21:00:00Z 新增：使用服务器返回的真实选项数据更新问题
            if (savedOptions && savedOptions.options) {
              setQuestions(prev => 
                prev.map(q => q.id === savedQuestion.id ? {
                  ...q,
                  options: savedOptions.options
                } : q)
              );
            }
            
          } catch (optionError) {
            console.error('Error saving NPS options:', optionError);
            alert('Question saved, but NPS labels failed to save');
          }
        }
      }
      
      // 重置表单
      setQuestionText('');
      setSelectedQuestionType(QUESTION_TYPES.TEXT);
      setIsQuestionRequired(false);
      setQuestionOptions([]);
      setEditingQuestionId(null);
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error adding question:', error);
      // 移除乐观更新添加的问题
      if (!editingQuestionId) {
        setQuestions(prev => prev.filter(q => !q.isSubmitting));
      } else {
        // 恢复编辑前的问题
        setQuestions(prev => 
          prev.map(q => q.id === editingQuestionId ? 
            {...q, isSubmitting: false} : q)
        );
      }
      
      alert(`Failed to add question: ${error.message}`);
    }
  };
  
  const handleEditQuestion = async (id) => {
    try {
      setIsLoading(true);
      const questionToEdit = questions.find(q => q.id === id);
      
      if (questionToEdit) {
        // 2024-05-09: 先添加乐观更新，将问题标记为正在编辑
        const updatedQuestions = questions.map(q => 
          q.id === id ? { ...q, isEditing: true } : q
        );
        setQuestions(updatedQuestions);
        
        setQuestionText(questionToEdit.text);
        // Set the correct question type when editing
        setSelectedQuestionType(questionToEdit.type || QUESTION_TYPES.TEXT);
        
        // 2024-10-05T19:00:00Z 新增：设置问题的required状态
        setIsQuestionRequired(questionToEdit.required || false);
        
        // 2024-10-05T14:45:00Z 修改：添加根据问题类型动态设置所需的表单状态
        if (questionToEdit.type === QUESTION_TYPES.BOOLEAN) {
          // 默认值
          setBooleanLabels({
            true: 'Yes',
            false: 'No'
          });
        } else if (questionToEdit.type === QUESTION_TYPES.NPS) {
          // 默认值
          setNpsLabels({
            0: 'Not likely',
            10: 'Extremely likely'
          });
        }
        
        // Load options if it's a choice-based question
        if (questionToEdit.type === QUESTION_TYPES.SINGLE_CHOICE || 
            questionToEdit.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
            questionToEdit.type === QUESTION_TYPES.NPS || 
            questionToEdit.type === QUESTION_TYPES.BOOLEAN) {
          try {
            const options = await getQuestionOptions(id);
            
            if (options && options.length > 0) {
              // 2024-10-06T12:15:00Z 新增：根据问题类型处理选项
              if (questionToEdit.type === QUESTION_TYPES.SINGLE_CHOICE || 
                  questionToEdit.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
                // 对于单选和多选，直接设置选项数组
                setQuestionOptions(options);
              }
              else if (questionToEdit.type === QUESTION_TYPES.BOOLEAN && options.length >= 2) {
                // 对于布尔题，设置自定义标签
                const trueOption = options.find(o => o.order === 1);
                const falseOption = options.find(o => o.order === 2);
                
                if (trueOption && falseOption) {
                  setBooleanLabels({
                    true: trueOption.text,
                    false: falseOption.text
                  });
                }
              }
              else if (questionToEdit.type === QUESTION_TYPES.NPS && options.length >= 2) {
                // 对于NPS题，设置自定义标签
                const minOption = options.find(o => o.order === 1);
                const maxOption = options.find(o => o.order === 2);
                
                if (minOption && maxOption) {
                  setNpsLabels({
                    ...npsLabels,
                    0: minOption.text,
                    10: maxOption.text
                  });
                }
              }
            } else if (questionToEdit.type === QUESTION_TYPES.SINGLE_CHOICE || 
                       questionToEdit.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
              // If no options found but it's a choice question, initialize with defaults
              setQuestionOptions([
                { id: `option-${Date.now()}-1`, text: 'Option 1' },
                { id: `option-${Date.now()}-2`, text: 'Option 2' }
              ]);
            }
          } catch (err) {
            console.error('Error loading question options:', err);
          }
        } else {
          // Clear options if not a choice-based question
          setQuestionOptions([]);
        }
        
      setEditingQuestionId(id);
      setShowAddForm(true);

      // 2024-05-09：编辑表单显示后自动滚动到Edit Question处
      setTimeout(() => {
        const editFormElement = document.querySelector('.add-question-form');
        if (editFormElement) {
          editFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      }
    } catch (err) {
      console.error('Error preparing question for edit:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteQuestion = async (id) => {
    setIsLoading(true);
    try {
      await deleteQuestion(id);
      
      const updatedQuestions = questions.filter(q => q.id !== id);
      
      const renumberedQuestions = updatedQuestions.map((q, index) => ({
        ...q,
        number: index + 1
      }));
      
      setQuestions(renumberedQuestions);
      
      if (renumberedQuestions.length === 0) {
        setShowAddForm(true);
      }
    } catch (err) {
      setError(err.message || 'Delete question failed');
      console.error('Error deleting question:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelQuestion = () => {
    if (editingQuestionId) {
      setEditingQuestionId(null);
    }
    
    if (questions.length > 0) {
      setShowAddForm(false);
    } else {
      setQuestionText('');
      // 2024-09-27T18:05:00Z Added: Reset required status
      setIsQuestionRequired(false);
      // 2024-09-27T18:05:00Z Added: Reset question type to text
      setSelectedQuestionType(QUESTION_TYPES.TEXT);
      // 2024-09-27T18:05:00Z Added: Clear options
      setQuestionOptions([]);
    }
  };
  
  // 2024-08-07T15:45:00Z 新增：处理Published按钮点击
  // 2024-08-07T15:45:00Z Added: Handle Published button click
  // 2023-10-31: 修改分享按钮的功能提示，使其更明确
  // 2023-11-01: 修改为导航到published页面，而不是复制链接
  const handlePublishedClick = () => {
    if (surveyId) {
      // 导航到问卷published页面
      navigate(`/survey-published/${surveyId}`);
    }
  };
  
  // 2024-08-07T21:00:00Z 新增：处理拖拽结束事件
  // 2024-08-07T21:00:00Z Added: Handle drag end event
  const handleDragEnd = async (result) => {
    // 如果拖拽到了列表外或者没有移动位置
    // If dragged outside list or position didn't change
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    try {
      // 创建问题数组的副本并重新排序
      // Create a copy of the questions array and reorder
      const items = Array.from(questions);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // 更新问题编号
      // Update question numbers
      const updatedQuestions = items.map((item, index) => ({
        ...item,
        number: index + 1
      }));
      
      // 立即更新UI，提升用户体验
      // Immediately update UI for better UX
      setQuestions(updatedQuestions);
      
      if (surveyId) {
        setIsLoading(true);
        // 准备要发送到后端的数据
        // Prepare data to send to the backend
        const orderData = updatedQuestions.map((q, index) => ({
          id: q.id,
          newOrder: index + 1
        }));
        
        // 调用API更新顺序
        // Call API to update order
        await reorderQuestions(surveyId, orderData);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error reordering questions:', err);
      // 显示友好的错误提示，而不是打断用户体验
      // Show friendly error message, rather than interrupting user experience
      setError('Failed to save question order, please try again');
      // 错误后3秒自动清除
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // 2024-09-27T17:50:00Z 新增：添加选项
  // 2024-09-27T17:50:00Z Added: Add option
  const handleAddOption = () => {
    // 生成新选项
    // Generate new option
    const newOption = {
      id: `option-${Date.now()}`,
      text: `Option ${questionOptions.length + 1}`
    };
    
    // 添加到选项列表
    // Add to options list
    setQuestionOptions([...questionOptions, newOption]);
  };

  // 2024-09-27T17:50:00Z 新增：更新选项
  // 2024-09-27T17:50:00Z Added: Update option
  const handleUpdateOption = (index, text) => {
    // 更新选项文本
    // Update option text
    const updatedOptions = [...questionOptions];
    updatedOptions[index] = { ...updatedOptions[index], text };
    setQuestionOptions(updatedOptions);
  };

  // 2024-09-27T17:50:00Z 新增：删除选项
  // 2024-09-27T17:50:00Z Added: Delete option
  const handleDeleteOption = (index) => {
    // 不允许删除到少于2个选项
    // Don't allow deleting to fewer than 2 options
    if (questionOptions.length <= 2 && 
        (selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
         selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE)) {
      alert('At least 2 options are required for single/multiple choice questions');
      return;
    }
    
    // 删除选项
    // Delete option
    const updatedOptions = [...questionOptions];
    updatedOptions.splice(index, 1);
    setQuestionOptions(updatedOptions);
  };

  // 2024-09-27T17:50:00Z 新增：处理选项拖拽
  // 2024-09-27T17:50:00Z Added: Handle option drag
  const handleDragOptionEnd = (result) => {
    // 如果没有目标位置或源位置与目标位置相同，则不做改变
    // If no destination or source and destination are the same, don't change
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }
    
    // 重新排序选项
    // Reorder options
    const reorderedOptions = [...questionOptions];
    const [removed] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, removed);
    
    setQuestionOptions(reorderedOptions);
  };

  // 2024-09-27T17:50:00Z 新增：更新NPS标签
  // 2024-09-27T17:50:00Z Added: Update NPS labels
  const handleUpdateNpsLabel = (position, value) => {
    // 更新NPS标签
    // Update NPS labels
    setNpsLabels(prev => ({
      ...prev,
      [position]: value
    }));
  };

  // 2024-09-27T17:50:00Z 新增：更新判断题标签
  // 2024-09-27T17:50:00Z Added: Update boolean labels
  const handleUpdateBooleanLabel = (key, value) => {
    // 更新判断题标签
    // Update boolean labels
    setBooleanLabels(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 问题类型改变处理函数
  // Question type change handler
  const handleQuestionTypeChange = (newType) => {
    // 2024-10-05T15:45:00Z 修改：确保使用正确的问题类型值
    setSelectedQuestionType(newType);
    
    // 如果切换到需要选项的类型，但当前没有选项，初始化默认选项
    // If switching to a type that needs options, but currently has none, initialize default options
    if (
      (newType === QUESTION_TYPES.SINGLE_CHOICE || 
       newType === QUESTION_TYPES.MULTIPLE_CHOICE) && 
      questionOptions.length === 0
    ) {
      setQuestionOptions([
        { id: `option-${Date.now()}-1`, text: 'Option 1' },
        { id: `option-${Date.now()}-2`, text: 'Option 2' }
      ]);
      
      // 2024-05-09: 当选择需要选项的类型时，自动滚动到选项区域
      setTimeout(() => {
        const optionsElement = document.querySelector('.options-container');
        if (optionsElement) {
          optionsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } 
    else if (newType === QUESTION_TYPES.NPS) {
      // 2024-10-05T15:45:00Z 新增：为 NPS 类型设置默认标签
      setNpsLabels({
        0: 'Not likely',
        10: 'Extremely likely'
      });
      // 清空选项，因为NPS不使用选项列表
      setQuestionOptions([]);
      
      // 2024-05-09: 当选择NPS类型时，自动滚动到NPS标签区域
      setTimeout(() => {
        const npsLabelsElement = document.querySelector('.nps-labels-container');
        if (npsLabelsElement) {
          npsLabelsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    else if (newType === QUESTION_TYPES.BOOLEAN) {
      // 2024-10-05T15:45:00Z 新增：为布尔类型设置默认标签
      setBooleanLabels({
        true: 'Yes',
        false: 'No'
      });
      // 清空选项，因为布尔题不使用选项列表
      setQuestionOptions([]);
      
      // 2024-05-09: 当选择布尔类型时，自动滚动到布尔标签区域
      setTimeout(() => {
        const booleanLabelsElement = document.querySelector('.boolean-labels-container');
        if (booleanLabelsElement) {
          booleanLabelsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    // 如果切换到不需要选项的类型，清空选项列表
    // If switching to a type that doesn't need options, clear the options list
    else if (newType === QUESTION_TYPES.TEXT) {
      setQuestionOptions([]);
    }
  };
  
  // 2024-10-06T21:15:00Z 新增：为乐观更新生成临时选项数据的辅助函数
  const getOptimisticOptions = (questionType) => {
    // 为不同问题类型生成临时选项数据
    if (questionType === QUESTION_TYPES.SINGLE_CHOICE || 
        questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
      // 使用表单中设置的选项
      return questionOptions.map((option, index) => ({
        id: option.id || `temp-option-${Date.now()}-${index}`,
        text: option.text,
        order: index + 1
      }));
    } 
    else if (questionType === QUESTION_TYPES.BOOLEAN) {
      // 使用表单中设置的布尔标签
      return [
        {
          id: `temp-boolean-true-${Date.now()}`,
          text: booleanLabels.true,
          order: 1
        },
        {
          id: `temp-boolean-false-${Date.now()}`,
          text: booleanLabels.false,
          order: 2
        }
      ];
    }
    else if (questionType === QUESTION_TYPES.NPS) {
      // 使用表单中设置的NPS标签
      return [
        {
          id: `temp-nps-0-${Date.now()}`,
          text: npsLabels[0],
          order: 1
        },
        {
          id: `temp-nps-10-${Date.now()}`,
          text: npsLabels[10],
          order: 2
        }
      ];
    }
    
    // 对于其他类型，返回空数组
    return [];
  };
  
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
  
  if (initialLoading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey data..." />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="new-survey-container">
        <div className="new-survey-header">
          <div className="header-title">
            <h1>
              {isViewing 
                ? surveyTitle
                : isEditing 
                  ? 'Edit Survey' 
                  : 'Create New Survey'
              }
            </h1>
            {(isViewing && surveyStatus === 'published') && (
              <Badge status="Published" />
            )}
          </div>
          <div className="header-actions">
            {!isViewing && (
              <Button 
                variant={questions.length > 0 ? "secondary" : "disabled"}
                icon={<img src={previewIcon} alt="Preview" className="button-icon" />}
                onClick={handlePreview}
                disabled={isLoading || questions.length === 0}
              >
                Preview
              </Button>
            )}
            
            {!isViewing && surveyStatus !== 'published' && (
              <Button 
                variant="secondary" 
                icon={<img src={saveIcon} alt="Save" className="button-icon" />}
                onClick={handleSave}
                disabled={isLoading || !surveyTitle.trim() || !surveyDescription.trim()}
              >
                Save
              </Button>
            )}
            
            {(isViewing || surveyStatus === 'published') ? (
              <Button 
                variant="success" 
                icon={<PublishIcon color="#FFFFFF" />}
                onClick={handlePublishedClick}
                disabled={isLoading}
              >
                Share Survey
              </Button>
            ) : (
              <Button 
                variant={questions.length > 0 ? "success" : "disabled"} 
                icon={<PublishIcon color={questions.length > 0 ? "#FFFFFF" : "#999999"} />}
                onClick={handlePublish}
                disabled={isLoading || questions.length === 0}
              >
                Publish
              </Button>
            )}
          </div>
        </div>
        
        {isLoading && (
          <LoadingOverlay message="Processing..." />
        )}
        
        {!isViewing && (
          <div className="new-survey-tabs">
            <div 
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => handleTabClick('details')}
            >
              Basic Information
            </div>
            <div 
              className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => handleTabClick('questions')}
            >
              Questions
            </div>
          </div>
        )}
        
          {isViewing ? (
          <div className="survey-combined-content">
            <div className="survey-description-section">
              {surveyDescription && (
                <>
                  {/* 2023-10-31: 移除Description标签，直接显示问卷描述 */}
                  <p className="survey-description">{surveyDescription}</p>
                </>
              )}
            </div>
            
            <div className="survey-questions-section">
              <h2 className="section-title">Questions</h2>
              <div className={`survey-questions ${questions.length === 0 ? 'is-empty' : ''}`}>
                {questions.length === 0 ? (
                  <div className="empty-questions-message">
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#666', 
                      textAlign: 'center', 
                      margin: '30px 0'
                    }}>
                      No questions added yet.
                    </p>
            </div>
          ) : (
                  <div className="question-list">
                    {questions.map((question) => (
                      <div key={question.id} className="question-item">
                        <div className="question-header">
                          <div className="question-drag view-mode">
                            <img src={dragIcon} alt="Drag" />
                            <span className="question-number">Question {question.number}</span>
                            {/* 2024-10-06T16:30:00Z 修改：修改Required标记的样式与颜色 */}
                            {question.required && (
                              <span className="question-required-badge-inline question-required-badge-green">Required</span>
                            )}
                          </div>
                          
                          {/* 2023-10-31: 移除问题级别的Published状态显示 */}
                          {/* <div className="question-status status-item">
                            <div className={`status-dot ${isPublished ? 'green' : 'grey'}`}></div>
                            <span className="status-text">{isPublished ? 'Published' : 'Draft'}</span>
                          </div> */}
                        </div>
                        
                        <div className="question-content">
                          <div className="question-text">
                            {question.text}
                            
                            <div className="question-meta">
                              {/* 2024-10-05T15:15:00Z 修改：确保始终显示问题类型 */}
                              {question.type && (
                                <span className="question-type-badge">
                                  {QUESTION_TYPE_NAMES[question.type] || question.type}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 单选/多选题选项预览 */}
                          {(question.type === QUESTION_TYPES.SINGLE_CHOICE || 
                            question.type === QUESTION_TYPES.MULTIPLE_CHOICE) && (
                            <div className="question-options-preview">
                              {/* 2024-10-06T16:00:00Z 修改：修正选项显示逻辑 */}
                              {question.options && question.options.length > 0 ? (
                                <div className="options-list-preview">
                                  {question.options.map((option, index) => (
                                    <div key={option.id || index} className="option-preview-item">
                                      <span className="option-number">{index + 1}.</span>
                                      {option.text}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-options-message">No options available</div>
                              )}
                            </div>
                          )}
                          
                          {/* NPS题选项预览 */}
                          {question.type === QUESTION_TYPES.NPS && (
                            <div className="nps-preview">
                              <div className="nps-scale-preview">
                                {Array.from({length: 11}, (_, i) => (
                                  <div key={i} className="nps-number">{i}</div>
                                ))}
                              </div>
                              {/* 2024-10-06T16:40:00Z 修复：确保显示NPS自定义标签 */}
                              {question.options && question.options.length >= 2 && (
                                <div className="nps-labels-preview">
                                  <div className="nps-label-item">
                                    <span>0:</span> {question.options.find(o => o.order === 1)?.text || 'Not likely'}
                                  </div>
                                  <div className="nps-label-item">
                                    <span>10:</span> {question.options.find(o => o.order === 2)?.text || 'Extremely likely'}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 布尔题选项预览 */}
                          {question.type === QUESTION_TYPES.BOOLEAN && (
                            <div className="boolean-preview">
                              <div className="boolean-options-preview">
                                {/* 2024-10-06T16:40:00Z 修复：确保显示布尔题自定义标签 */}
                                {question.options && question.options.length >= 2 ? (
                                  <span>
                                    {question.options.find(o => o.order === 1)?.text || 'Yes'} / {question.options.find(o => o.order === 2)?.text || 'No'}
                                  </span>
                                ) : (
                                  <span>Yes / No</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'details' && (
              <div className="survey-details-form">
                <div className="form-group">
                  <label htmlFor="surveyTitle">Survey Title</label>
                  <div className="label-with-badge">
                    <input 
                      type="text" 
                      id="surveyTitle" 
                      value={surveyTitle}
                      onChange={(e) => setSurveyTitle(e.target.value)}
                      placeholder="Enter survey title"
                      disabled={isLoading}
                      className="filled-input"
                      style={{ fontWeight: '500', color: '#333' }}
                    />
                    <Badge type="required">Required</Badge>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="surveyDescription">Welcome Message</label>
                  <div className="label-with-badge">
                    <textarea 
                      id="surveyDescription" 
                      value={surveyDescription}
                      onChange={(e) => setSurveyDescription(e.target.value)}
                      placeholder="Welcome participants and describe what this survey is about"
                      rows={2}
                      disabled={isLoading}
                      className="empty-input"
                      style={{ fontStyle: 'italic', color: surveyDescription ? '#333' : '#999' }}
                    />
                    <Badge type="required">Required</Badge>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="surveyThanksMessage">Thanks Message</label>
                  <textarea 
                    id="surveyThanksMessage" 
                    value={surveyThanksMessage || ''}
                    onChange={(e) => setSurveyThanksMessage(e.target.value)}
                    placeholder="Thank you message to show after survey submission"
                    rows={2}
                    disabled={isLoading}
                    className="empty-input"
                    style={{ fontStyle: 'italic', color: surveyThanksMessage ? '#333' : '#999' }}
                  />
                </div>

                <div className="form-actions">
                  <Button 
                    variant={!surveyTitle.trim() || !surveyDescription.trim() ? "disabled" : "primary"}
                    onClick={handleNext}
                    disabled={isLoading || !surveyTitle.trim() || !surveyDescription.trim()}
                  >
                    Next
                  </Button>
              </div>
            </div>
          )}
          
            {activeTab === 'questions' && (
              <div className="survey-questions">
                {questions.length === 0 ? (
                  <>
                    <div className="empty-questions-message">
                      <p style={{ 
                        fontSize: '16px', 
                        color: '#666', 
                        textAlign: 'center', 
                        margin: '30px 0'
                      }}>
                        No questions added yet. Add your first question below.
                      </p>
                    </div>
                    {showAddForm ? (
                  <div className="add-question-form">
                        <h2>Add New Question {questions.length + 1}</h2>
                    <div className="form-group">
                      <label htmlFor="questionText">Question Text</label>
                      <textarea 
                        id="questionText" 
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Enter your question here"
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>
                        
                        <div className="form-group">
                          <label htmlFor="questionType">Question Type</label>
                          <select
                            id="questionType"
                            className="question-type-select"
                            value={selectedQuestionType}
                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                            disabled={isLoading}
                          >
                            {Object.entries(QUESTION_TYPE_NAMES).map(([type, name]) => (
                              <option key={type} value={type}>{name}</option>
                            ))}
                          </select>
                    </div>
                    
                    <div className="form-group switch-group">
                          <span className="switch-text">Required Question</span>
                          <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                              checked={isQuestionRequired}
                              onChange={(e) => setIsQuestionRequired(e.target.checked)}
                          disabled={isLoading}
                        />
                            <span className="switch-label"></span>
                          </label>
                    </div>

                        {/* Add OptionsManager for option-based question types */}
                        <OptionsManager 
                          questionType={selectedQuestionType}
                          options={questionOptions}
                          onAddOption={handleAddOption}
                          onUpdateOption={handleUpdateOption}
                          onDeleteOption={handleDeleteOption}
                          onDragEnd={handleDragOptionEnd}
                          npsLabels={npsLabels}
                          onUpdateNpsLabel={handleUpdateNpsLabel}
                          booleanLabels={booleanLabels}
                          onUpdateBooleanLabel={handleUpdateBooleanLabel}
                          disabled={isLoading}
                        />
                    
                        <div className="form-actions">
                      <Button 
                        variant="secondary" 
                        onClick={handleCancelQuestion}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                            variant={!questionText.trim() ? "disabled" : "primary"}
                            onClick={() => {
                              if (questionText.trim()) {
                                handleAddQuestion();
                              }
                            }}
                            disabled={
                              isLoading || 
                              !questionText.trim() ||
                              ((selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
                                selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE) && 
                                questionOptions.length < 2)
                            }
                          >
                            Add Question
                      </Button>
                    </div>
                  </div>
              ) : (
                      <div className="add-question-button-container">
                        <button className="add-question-button" 
                          onClick={() => !isLoading && toggleAddForm()}
                          disabled={isLoading}
                        >
                          <img src={plusIcon} alt="Add" />
                          <span>Add Question</span>
                        </button>
                    </div>
                    )}
                  </>
                  ) : (
                  <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="questionsList">
                        {(provided) => (
                          <div 
                            className="question-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {questions.map((question, index) => (
                              <Draggable 
                                key={question.id} 
                                draggableId={`question-${question.id}`} 
                                index={index}
                                isDragDisabled={false}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`question-item ${snapshot.isDragging ? 'is-dragging' : ''} ${question.isSubmitting ? 'is-submitting' : ''}`}
                                  >
                                    <div className="question-header">
                                      <div 
                                        className="question-drag"
                                        {...provided.dragHandleProps}
                                      >
                                        <img src={dragIcon} alt="Drag" />
                                        <span className="question-number">Question {question.number}</span>
                                        
                                        {/* 2024-05-09: 将问题类型badge移到这里, Required badge之前显示 */}
                                        {question.type && (
                                          <span className="question-type-badge">
                                            {QUESTION_TYPE_NAMES[question.type] || question.type}
                                          </span>
                                        )}
                                        
                                        {/* 2024-05-09: 使用通用Badge组件替换自定义样式 */}
                                        {question.required && (
                                          <Badge type="required">Required</Badge>
                                        )}
                                        
                                        {question.isSubmitting && (
                                          <span className="submitting-indicator">Saving...</span>
                                        )}
                                      </div>
                                      
                                        <div className="question-actions-buttons">
                                          <button className="icon-button" 
                                            onClick={() => !isLoading && handleEditQuestion(question.id)}
                                            disabled={isLoading}
                                          >
                                            <img src={editIcon} alt="Edit" />
                                            <span>Edit</span>
                                          </button>
                                          <button className="icon-button delete-button" 
                                            onClick={() => !isLoading && handleDeleteQuestion(question.id)}
                                            disabled={isLoading}
                                          >
                                            <img src={deleteIcon} alt="Delete" />
                                            <span>Delete</span>
                                          </button>
                                        </div>
                                    </div>
                                    
                                    <div className="question-content">
                                      <div className="question-text">
                                        {question.text}
                                        
                                        {/* 2024-05-09: 移除这里的问题类型显示，已移到header中 */}
                                      </div>
                                      
                                      {/* 单选/多选题选项预览 */}
                                      {(question.type === QUESTION_TYPES.SINGLE_CHOICE || 
                                        question.type === QUESTION_TYPES.MULTIPLE_CHOICE) && (
                                        <div className="question-options-preview">
                                          {/* 2024-10-06T16:00:00Z 修改：修正选项显示逻辑 */}
                                          {question.options && question.options.length > 0 ? (
                                            <div className="options-list-preview">
                                              {question.options.map((option, index) => (
                                                <div key={option.id || index} className="option-preview-item">
                                                  <span className="option-number">{index + 1}.</span>
                                                  {option.text}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="no-options-message">No options available</div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* NPS题选项预览 */}
                                      {question.type === QUESTION_TYPES.NPS && (
                                        <div className="nps-preview">
                                          <div className="nps-scale-preview">
                                            {Array.from({length: 11}, (_, i) => (
                                              <div key={i} className="nps-number">{i}</div>
                                            ))}
                                          </div>
                                          {/* 2024-10-06T16:40:00Z 修复：确保显示NPS自定义标签 */}
                                          {question.options && question.options.length >= 2 && (
                                            <div className="nps-labels-preview">
                                              <div className="nps-label-item">
                                                <span>0:</span> {question.options.find(o => o.order === 1)?.text || 'Not likely'}
                                              </div>
                                              <div className="nps-label-item">
                                                <span>10:</span> {question.options.find(o => o.order === 2)?.text || 'Extremely likely'}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* 布尔题选项预览 */}
                                      {question.type === QUESTION_TYPES.BOOLEAN && (
                                        <div className="boolean-preview">
                                          <div className="boolean-options-preview">
                                            {/* 2024-10-06T16:40:00Z 修复：确保显示布尔题自定义标签 */}
                                            {question.options && question.options.length >= 2 ? (
                                              <span>
                                                {question.options.find(o => o.order === 1)?.text || 'Yes'} / {question.options.find(o => o.order === 2)?.text || 'No'}
                                              </span>
                                            ) : (
                                              <span>Yes / No</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  
                    {showAddForm ? (
                        <div className="add-question-form">
                        <h2>{editingQuestionId ? `Edit Question ${questions.find(q => q.id === editingQuestionId)?.number || ''}` : `Add New Question ${questions.length + 1}`}</h2>
                          <div className="form-group">
                            <label htmlFor="questionText">Question Text</label>
                            <textarea 
                              id="questionText" 
                              value={questionText}
                              onChange={(e) => setQuestionText(e.target.value)}
                              placeholder="Enter your question here"
                              rows={2}
                              disabled={isLoading}
                            />
                          </div>
                        
                        <div className="form-group">
                          <label htmlFor="questionType">Question Type</label>
                          <select
                            id="questionType"
                            className="question-type-select"
                            value={selectedQuestionType}
                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                            disabled={isLoading || (editingQuestionId && true)} // Always disable type change when editing
                          >
                            {Object.entries(QUESTION_TYPE_NAMES).map(([type, name]) => (
                              <option key={type} value={type}>{name}</option>
                            ))}
                          </select>
                          </div>
                          
                          <div className="form-group switch-group">
                          <span className="switch-text">Required Question</span>
                          <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                              checked={isQuestionRequired}
                              onChange={(e) => setIsQuestionRequired(e.target.checked)}
                                disabled={isLoading}
                              />
                            <span className="switch-label"></span>
                          </label>
                          </div>

                        {/* Add OptionsManager for option-based question types */}
                        <OptionsManager 
                          questionType={selectedQuestionType}
                          options={questionOptions}
                          onAddOption={handleAddOption}
                          onUpdateOption={handleUpdateOption}
                          onDeleteOption={handleDeleteOption}
                          onDragEnd={handleDragOptionEnd}
                          npsLabels={npsLabels}
                          onUpdateNpsLabel={handleUpdateNpsLabel}
                          booleanLabels={booleanLabels}
                          onUpdateBooleanLabel={handleUpdateBooleanLabel}
                                disabled={isLoading}
                              />
                          
                          <div className="form-actions">
                            <Button 
                              variant="secondary" 
                              onClick={handleCancelQuestion}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                            variant={!questionText.trim() ? "disabled" : "primary"}
                            onClick={() => {
                              if (questionText.trim()) {
                                handleAddQuestion();
                              }
                            }}
                            disabled={
                              isLoading || 
                              !questionText.trim() ||
                              ((selectedQuestionType === QUESTION_TYPES.SINGLE_CHOICE || 
                                selectedQuestionType === QUESTION_TYPES.MULTIPLE_CHOICE) && 
                                questionOptions.length < 2)
                            }
                            >
                              {editingQuestionId ? 'Update Question' : 'Add Question'}
                            </Button>
                          </div>
                        </div>
                    ) : (
                      <div className="add-question-button-container">
                        <button className="add-question-button" 
                          onClick={() => !isLoading && toggleAddForm()}
                          disabled={isLoading}
                        >
                          <img src={plusIcon} alt="Add" />
                          <span>Add Question</span>
                        </button>
                      </div>
                  )}
                </>
              )}
            </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default NewSurvey; 
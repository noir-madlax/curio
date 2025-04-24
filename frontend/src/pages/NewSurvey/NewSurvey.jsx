import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Button from '../../components/common/Button/Button';
import './NewSurvey.css';
import { 
  createSurvey, 
  updateSurvey, 
  getSurveyById, 
  createQuestion, 
  getQuestionsBySurveyId, 
  updateQuestion, 
  deleteQuestion,
  reorderQuestions
} from '../../services/surveyService';

// 导入SVG图标
import previewIcon from '../../assets/icons/preview_icon.svg';
import saveIcon from '../../assets/icons/save_icon.svg';
import publishIcon from '../../assets/icons/publish_icon.svg';
import infoIcon from '../../assets/icons/info_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';
import deleteIcon from '../../assets/icons/delete_icon.svg';
import dragIcon from '../../assets/icons/drag_icon.svg';
import plusIcon from '../../assets/icons/plus_icon.svg';

// 2024-08-07T17:45:00Z 新增：自定义图标组件，可以动态设置颜色
const PublishIcon = ({ color = "#252326" }) => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="button-icon">
    <path d="M13.2946 3.7081L2.35237 5.54223C2.32466 5.54687 2.29868 5.55878 2.27709 5.57675C2.25549 5.59472 2.23905 5.61809 2.22945 5.64449C2.21985 5.67089 2.21743 5.69937 2.22244 5.72701C2.22745 5.75465 2.2397 5.78047 2.25795 5.80183L3.61535 7.38993C3.65802 7.43988 3.71515 7.47535 3.77884 7.49145C3.84253 7.50755 3.90965 7.50349 3.97094 7.47982L13.3364 3.86043C13.3548 3.8534 13.3699 3.83978 13.3788 3.82221C13.3878 3.80464 13.3898 3.78438 13.3846 3.76538C13.3794 3.74637 13.3673 3.72998 13.3507 3.71939C13.3341 3.7088 13.3141 3.70478 13.2947 3.7081H13.2946ZM11.2488 15.3536L15.7123 4.32646C15.724 4.29745 15.7269 4.26561 15.7206 4.23496C15.7143 4.20431 15.6991 4.17621 15.6768 4.1542C15.6546 4.13219 15.6263 4.11724 15.5956 4.11125C15.5649 4.10525 15.5331 4.10847 15.5042 4.1205L5.11047 8.45449C5.07528 8.46915 5.04413 8.49205 5.01963 8.52126C4.99514 8.55047 4.97802 8.58514 4.96971 8.62234C4.96141 8.65955 4.96216 8.69821 4.97191 8.73506C4.98166 8.77191 5.00012 8.80589 5.02573 8.83412L10.9842 15.4007C11.0023 15.4206 11.0251 15.4355 11.0505 15.4442C11.0759 15.4529 11.1031 15.455 11.1296 15.4503C11.156 15.4455 11.1808 15.4342 11.2017 15.4173C11.2225 15.4004 11.2388 15.3784 11.2488 15.3536H11.2488ZM4.68323 15.2817C4.41031 15.4349 4.06567 15.3734 4.00823 15.3663C3.5725 15.3128 3.31124 14.9155 3.3648 14.4797L3.05086 8.72717L1.43823 6.79926C0.843835 6.16948 0.87446 5.18021 1.50662 4.58962C1.74982 4.36265 2.05873 4.21865 2.38894 4.17833L15.2466 2.42497C16.1077 2.31945 16.8926 2.92852 16.9997 3.78545C17.0364 4.079 16.9886 4.37684 16.862 4.64429L12.5082 15.822C12.1385 16.6026 11.2023 16.9363 10.4173 16.5675C10.2388 16.4836 10.0776 16.3669 9.94214 16.2235L7.08741 13.0808C7.07162 13.0919 6.27023 13.8256 4.68323 15.2818V15.2817ZM4.28623 10.2378L4.47688 13.5419C4.47863 13.5724 4.48916 13.6017 4.50719 13.6264C4.52521 13.651 4.54998 13.67 4.5785 13.6809C4.60703 13.6918 4.6381 13.6943 4.668 13.688C4.69789 13.6817 4.72533 13.6669 4.74702 13.6454L6.06831 12.3342C6.12519 12.2778 6.15862 12.2019 6.16188 12.1218C6.16515 12.0418 6.13802 11.9635 6.08593 11.9026L4.56526 10.1255C4.54367 10.1002 4.51469 10.0824 4.48242 10.0745C4.45014 10.0666 4.4162 10.069 4.38537 10.0814C4.35454 10.0938 4.32839 10.1156 4.3106 10.1437C4.29282 10.1717 4.28429 10.2047 4.28623 10.2378Z" fill={color}/>
  </svg>
);

const NewSurvey = ({ viewMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && !viewMode;
  const isViewing = !!id && viewMode;
  
  const [activeTab, setActiveTab] = useState('details');
  const [surveyTitle, setSurveyTitle] = useState('New Survey');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(questions.length === 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surveyId, setSurveyId] = useState(id || null);
  const [surveyStatus, setSurveyStatus] = useState('draft');
  
  // 问题表单状态
  const [questionText, setQuestionText] = useState('');
  const [needsFollowUp, setNeedsFollowUp] = useState(true);
  const [questionPurpose, setQuestionPurpose] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  
  useEffect(() => {
    if (isEditing || isViewing) {
      const fetchSurveyData = async () => {
        setIsLoading(true);
        try {
          const surveyData = await getSurveyById(id);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          setSurveyStatus(surveyData.status.toLowerCase());
          
          const questionsData = await getQuestionsBySurveyId(id);
          
          const formattedQuestions = questionsData.map((q, index) => ({
            id: q.id,
            number: index + 1,
            text: q.text,
            needsFollowUp: q.followupCount > 0,
            purpose: q.objectives || ''
          }));
          
          setQuestions(formattedQuestions);
          
        } catch (err) {
          console.error('Error fetching survey data:', err);
          setError(err.message || 'Unable to load survey data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSurveyData();
    }
  }, [id, isEditing, isViewing]);
  
  const handleNext = () => {
    setActiveTab('questions');
    if (questions.length === 0) {
      setShowAddForm(true);
      setNeedsFollowUp(true);
    }
  };
  
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'questions' && questions.length === 0) {
      setShowAddForm(true);
      setNeedsFollowUp(true);
    } else if (tabName === 'questions' && questions.length > 0) {
      setShowAddForm(false);
    }
  };
  
  const handlePreview = () => {
    console.log('Preview survey');
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      let savedSurveyId;
      
      if (surveyId) {
        await updateSurvey(surveyId, {
          title: surveyTitle,
          description: surveyDescription
        });
        savedSurveyId = surveyId;
      } 
      else {
        const newSurvey = await createSurvey({
          title: surveyTitle,
          description: surveyDescription
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
    setIsLoading(true);
    try {
      let publishedSurveyId;
      
      // 2024-08-06 新增：生成唯一的问卷链接
      const generateSurveyLink = (id) => {
        // 生成一个基于ID的唯一链接，可以加上一些随机字符来增加安全性
        const baseUrl = window.location.origin; // 获取当前网站的基础URL
        return `${baseUrl}/survey/${id}/respond`;
      };
      
      if (surveyId) {
        // 生成问卷链接
        const surveyLink = generateSurveyLink(surveyId);
        
        await updateSurvey(surveyId, {
          title: surveyTitle,
          description: surveyDescription,
          status: 'published',
          surveyLink: surveyLink // 2024-08-06 新增：保存问卷链接
        });
        publishedSurveyId = surveyId;
      } else {
        const newSurvey = await createSurvey({
          title: surveyTitle,
          description: surveyDescription,
          status: 'published'
        });
        publishedSurveyId = newSurvey.id;
        
        // 2024-08-06 新增：对于新创建的问卷，需要更新生成的链接
        const surveyLink = generateSurveyLink(publishedSurveyId);
        await updateSurvey(publishedSurveyId, {
          surveyLink: surveyLink
        });
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
      setNeedsFollowUp(true);
      setQuestionPurpose('');
      setEditingQuestionId(null);
    }
  };
  
  const handleAddQuestion = async () => {
    if (questionText.trim() === '') return;
    
    setIsLoading(true);
    try {
      if (!surveyId) {
        const newSurvey = await createSurvey({
          title: surveyTitle,
          description: surveyDescription
        });
        setSurveyId(newSurvey.id);
        
        const id = newSurvey.id;
        
        const newQuestionData = {
          surveyId: id,
          text: questionText,
          followupCount: needsFollowUp ? 1 : 0,
          objectives: needsFollowUp ? questionPurpose : '',
          type: 'text'
        };
        
        const createdQuestion = await createQuestion(newQuestionData);
        
        const newQuestion = {
          id: createdQuestion.id,
          number: questions.length + 1,
          text: questionText,
          needsFollowUp,
          purpose: questionPurpose
        };
        
        setQuestions([...questions, newQuestion]);
      } 
      else if (editingQuestionId) {
        const questionIndex = questions.findIndex(q => q.id === editingQuestionId);
        if (questionIndex !== -1) {
          await updateQuestion(editingQuestionId, {
            text: questionText,
            followupCount: needsFollowUp ? 1 : 0,
            objectives: needsFollowUp ? questionPurpose : ''
          });
          
          const updatedQuestions = [...questions];
          updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            text: questionText,
            needsFollowUp,
            purpose: questionPurpose
          };
          
          setQuestions(updatedQuestions);
          setEditingQuestionId(null);
        }
      }
      else {
        const newQuestionData = {
          surveyId,
          text: questionText,
          followupCount: needsFollowUp ? 1 : 0,
          objectives: needsFollowUp ? questionPurpose : '',
          type: 'text'
        };
        
        const createdQuestion = await createQuestion(newQuestionData);
        
        const newQuestion = {
          id: createdQuestion.id,
          number: questions.length + 1,
          text: questionText,
          needsFollowUp,
          purpose: questionPurpose
        };
        
        setQuestions([...questions, newQuestion]);
      }
      
      setQuestionText('');
      setNeedsFollowUp(true);
      setQuestionPurpose('');
      setShowAddForm(false);
      
    } catch (err) {
      setError(err.message || 'Add question failed');
      console.error('Error adding question:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditQuestion = (id) => {
    const questionToEdit = questions.find(q => q.id === id);
    if (questionToEdit) {
      setQuestionText(questionToEdit.text);
      setNeedsFollowUp(questionToEdit.needsFollowUp);
      setQuestionPurpose(questionToEdit.purpose || '');
      setEditingQuestionId(id);
      setShowAddForm(true);
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
      setNeedsFollowUp(true);
      setQuestionPurpose('');
    }
  };
  
  // 2024-08-07T15:45:00Z 新增：处理Published按钮点击
  const handlePublishedClick = () => {
    navigate(`/survey-published/${id}`);
  };
  
  // 2024-08-07T21:00:00Z 新增：处理拖拽结束事件
  const handleDragEnd = async (result) => {
    // 如果拖拽到了列表外或者没有移动位置
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }

    try {
      // 创建问题数组的副本并重新排序
      const items = Array.from(questions);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // 更新问题编号
      const updatedQuestions = items.map((item, index) => ({
        ...item,
        number: index + 1
      }));
      
      // 立即更新UI，提升用户体验
      setQuestions(updatedQuestions);
      
      if (surveyId) {
        setIsLoading(true);
        // 准备要发送到后端的数据
        const orderData = updatedQuestions.map((q, index) => ({
          id: q.id,
          newOrder: index + 1
        }));
        
        // 调用API更新顺序
        await reorderQuestions(surveyId, orderData);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error reordering questions:', err);
      // 显示友好的错误提示，而不是打断用户体验
      setError('无法保存问题顺序，请重试');
      // 错误后3秒自动清除
      setTimeout(() => setError(null), 3000);
    }
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
  
  if (isLoading && isEditing) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-message">Loading survey data...</div>
        </div>
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
              <span className="published-badge">Published</span>
            )}
          </div>
          <div className="header-actions">
            
            {!isViewing && surveyStatus !== 'published' && (
              <Button 
                variant="secondary" 
                icon={<img src={saveIcon} alt="Save" className="button-icon" />}
                onClick={handleSave}
                disabled={isLoading}
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
                className="published-button"
              >
                Share Survey
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                icon={<PublishIcon color="#252326" />}
                onClick={handlePublish}
                disabled={isLoading}
              >
                Publish
              </Button>
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-message">Processing...</div>
          </div>
        )}
        
        <div className="survey-combined-content">
          {isViewing ? (
            <div className="survey-description-section">
              {surveyDescription && (
                <>
                  <span className="description-label">Description:</span>
                  <p className="survey-description">{surveyDescription}</p>
                </>
              )}
            </div>
          ) : (
            <div className="survey-details-section">
              <h2 className="section-title">Survey Details</h2>
              <div className="survey-details-form">
                <div className="form-group">
                  <label htmlFor="surveyTitle">Survey Title</label>
                  <input 
                    type="text" 
                    id="surveyTitle" 
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Enter survey title"
                    disabled={isLoading}
                    className=""
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="surveyDescription">Description</label>
                  <textarea 
                    id="surveyDescription" 
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Describe what this survey is about"
                    rows={2}
                    disabled={isLoading}
                    className=""
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="survey-questions-section">
            <h2 className="section-title">Questions</h2>
            <div className={`survey-questions ${questions.length === 0 ? 'is-empty' : ''}`}>
              {questions.length === 0 && !isViewing ? (
                <>
                  <h3>Add New Question</h3>
                  <div className="add-question-form">
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
                    
                    <div className="form-group switch-group">
                      <div className="toggle-switch">
                        <input 
                          type="checkbox" 
                          id="followUpSwitch" 
                          checked={needsFollowUp}
                          onChange={() => !isLoading && setNeedsFollowUp(!needsFollowUp)}
                          disabled={isLoading}
                        />
                        <label htmlFor="followUpSwitch" className="switch-label"></label>
                      </div>
                      <label htmlFor="followUpSwitch" className="switch-text">Needs follow-up questions</label>
                    </div>

                    <div className="follow-up-explanation">
                       <img src={infoIcon} alt="Info" className="icon-img info-icon" />
                       <p>
                         Enable follow-up questions to let our AI ask contextual questions based on respondents' answers. Provide a purpose for each question to help the AI understand what information you're trying to gather.
                       </p>
                    </div>
                    
                    {needsFollowUp && (
                      <div className="form-group">
                        <label htmlFor="questionPurpose">What is the purpose of this question?</label>
                        <textarea 
                          id="questionPurpose" 
                          value={questionPurpose}
                          onChange={(e) => setQuestionPurpose(e.target.value)}
                          placeholder="Explain the purpose of this question to help Al generate follow-up questions"
                          rows={2}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                    
                    <div className="form-actions question-actions">
                      <Button 
                        variant="secondary" 
                        onClick={handleCancelQuestion}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleAddQuestion}
                        disabled={isLoading || !questionText.trim()}
                      >
                        {editingQuestionId ? 'Update Question' : 'Add Question'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {questions.length === 0 && isViewing ? (
                    <div className="empty-questions-message">
                      <p>No questions added yet.</p>
                    </div>
                  ) : (
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
                                isDragDisabled={isViewing} // 查看模式下禁用拖拽
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`question-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                  >
                                    <div className="question-header">
                                      <div 
                                        className="question-drag"
                                        {...provided.dragHandleProps}
                                      >
                                        <img src={dragIcon} alt="Drag" />
                                        <span className="question-number">Question {question.number}</span>
                                      </div>
                                      <div className="question-status">
                                        {question.needsFollowUp ? (
                                          <div className="status-item">
                                            <span className="status-dot green"></span>
                                            <span className="status-text">Has follow-up questions</span>
                                          </div>
                                        ) : (
                                           <div className="status-item">
                                            <span className="status-dot grey"></span>
                                            <span className="status-text">No follow-up questions</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {!isViewing && (
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
                                      )}
                                    </div>
                                    <div className="question-content">
                                      <div className="question-text">{question.text}</div>
                                      
                                      {question.needsFollowUp && question.purpose && (
                                        <div className="question-purpose">
                                          <div className="purpose-label">Purpose</div>
                                          <div className="purpose-text">{question.purpose}</div>
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
                  )}
                  
                  {!isViewing && (
                    showAddForm ? (
                      <>
                        <h3>{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h3>
                        <div className="add-question-form">
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
                          
                          <div className="form-group switch-group">
                            <div className="toggle-switch">
                              <input 
                                type="checkbox" 
                                id="followUpSwitch_existing"
                                checked={needsFollowUp}
                                onChange={() => !isLoading && setNeedsFollowUp(!needsFollowUp)}
                                disabled={isLoading}
                              />
                              <label htmlFor="followUpSwitch_existing" className="switch-label"></label>
                            </div>
                            <label htmlFor="followUpSwitch_existing" className="switch-text">Needs follow-up questions</label>
                          </div>

                          <div className="follow-up-explanation">
                             <img src={infoIcon} alt="Info" className="icon-img info-icon" />
                             <p>
                               Enable follow-up questions to let our AI ask contextual questions based on respondents' answers. Provide a purpose for each question to help the AI understand what information you're trying to gather.
                             </p>
                          </div>

                          {needsFollowUp && (
                            <div className="form-group">
                              <label htmlFor="questionPurpose_existing">What is the purpose of this question?</label>
                              <textarea 
                                id="questionPurpose_existing"
                                value={questionPurpose}
                                onChange={(e) => setQuestionPurpose(e.target.value)}
                                placeholder="Explain the purpose of this question to help Al generate follow-up questions"
                                rows={2}
                                disabled={isLoading}
                              />
                            </div>
                          )}
                          
                          <div className="form-actions question-actions">
                            <Button 
                              variant="secondary" 
                              onClick={handleCancelQuestion}
                              disabled={isLoading}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="primary" 
                              onClick={handleAddQuestion}
                              disabled={isLoading || !questionText.trim()}
                            >
                              {editingQuestionId ? 'Update Question' : 'Add Question'}
                            </Button>
                          </div>
                        </div>
                      </>
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
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewSurvey; 
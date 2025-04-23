import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Button from '../../components/common/Button/Button';
import './NewSurvey.css';

// 导入SVG图标
import previewIcon from '../../assets/icons/preview_icon.svg';
import saveIcon from '../../assets/icons/save_icon.svg';
import publishIcon from '../../assets/icons/publish_icon.svg';
import infoIcon from '../../assets/icons/info_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';
import deleteIcon from '../../assets/icons/delete_icon.svg';
import dragIcon from '../../assets/icons/drag_icon.svg';
import plusIcon from '../../assets/icons/plus_icon.svg';
import sendIcon from '../../assets/icons/send_chat_icon.svg';

const NewSurvey = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [surveyTitle, setSurveyTitle] = useState('New Survey');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(questions.length === 0);
  
  // 问题表单状态
  const [questionText, setQuestionText] = useState('');
  const [needsFollowUp, setNeedsFollowUp] = useState(true);
  const [questionPurpose, setQuestionPurpose] = useState('');
  
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
    // 预览功能实现
    console.log('Preview survey');
  };
  
  const handleSave = () => {
    // 保存功能实现
    console.log('Save survey', { title: surveyTitle, description: surveyDescription });
    // 保存成功后返回调查列表
    navigate('/surveys');
  };
  
  const handlePublish = () => {
    // TODO: Implement actual publish logic (e.g., API call)
    console.log('Publishing survey:', { title: surveyTitle, description: surveyDescription, questions });
    
    // Simulate successful publish and get a survey ID (replace with actual ID from backend)
    const publishedSurveyId = 'survey' + Date.now(); 

    // 保存成功后导航到新页面
    // 注意: 用户需要在路由配置中添加 "/survey-published/:surveyId" 路由
    navigate(`/survey-published/${publishedSurveyId}`); 
  };
  
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setQuestionText('');
      setNeedsFollowUp(true);
      setQuestionPurpose('');
    }
  };
  
  const handleAddQuestion = () => {
    if (questionText.trim() === '') return;
    
    const newQuestion = {
      id: Date.now(),
      number: questions.length + 1,
      text: questionText,
      needsFollowUp,
      purpose: questionPurpose
    };
    
    setQuestions([...questions, newQuestion]);
    // 添加问题后重置表单并隐藏表单
    setQuestionText('');
    setNeedsFollowUp(true);
    setQuestionPurpose('');
    setShowAddForm(false);
  };
  
  const handleEditQuestion = (id) => {
    console.log('Edit question', id);
    // 实现编辑功能 (此处仅为示例)
  };
  
  const handleDeleteQuestion = (id) => {
    // 删除问题
    setQuestions(prevQuestions => {
        const updatedQuestions = prevQuestions.filter(q => q.id !== id);
        // 如果删除后问题列表为空，则显示添加表单
        if (updatedQuestions.length === 0) {
            setShowAddForm(true);
        }
        return updatedQuestions;
    });
  };
  
  const handleCancelQuestion = () => {
    if (questions.length > 0) {
      setShowAddForm(false);
    } else {
      setQuestionText('');
      setNeedsFollowUp(true);
      setQuestionPurpose('');
    }
  };
  
  // 处理发送消息的函数
  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (text) {
      // 添加消息到列表
      const newUserMessage = {
        id: Date.now(),
        sender: 'user',
        text: text,
      };
      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Received your answer: "${text}". Next question is...`
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage, newAiMessage]);
      
      // 重要：清空输入框
      setInputValue('');
      
      // 如果启用了textarea高度自适应，还需要重置高度
      const textarea = document.querySelector('.chat-input-area textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  };
  
  return (
    <MainLayout>
      <div className="new-survey-container">
        <div className="new-survey-header">
          <div className="header-title">
            <h1>New Survey</h1>
          </div>
          <div className="header-actions">
            <Button 
              variant="secondary" 
              icon={<img src={previewIcon} alt="Preview" className="button-icon" />}
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button 
              variant="secondary" 
              icon={<img src={saveIcon} alt="Save" className="button-icon" />}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button 
              variant="secondary" 
              icon={<img src={publishIcon} alt="Publish" className="button-icon" />}
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </div>
        
        <div className="new-survey-tabs">
          <div 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => handleTabClick('details')}
          >
            Survey Details
          </div>
          <div 
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => handleTabClick('questions')}
          >
            Questions
          </div>
        </div>
        
        {activeTab === 'questions' && questions.length === 0 && (
            <div className="empty-questions-message">
              <p>No questions added yet. Add your first question below.</p>
            </div>
        )}
        
        {activeTab === 'details' && (
          <div className="survey-details-form">
            <div className="form-group">
              <label htmlFor="surveyTitle">Survey Title</label>
              <input 
                type="text" 
                id="surveyTitle" 
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="Enter survey title"
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
              />
            </div>
            
            <div className="form-actions">
              <Button 
                variant="primary" 
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'questions' && (
          <div className={`survey-questions ${questions.length === 0 ? 'is-empty' : ''}`}>
            {questions.length === 0 ? (
              <>
                <h2>Add New Question</h2>
                <div className="add-question-form">
                  <div className="form-group">
                    <label htmlFor="questionText">Question Text</label>
                    <textarea 
                      id="questionText" 
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Enter your question here"
                      rows={2}
                    />
                  </div>
                  
                  <div className="form-group switch-group">
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="followUpSwitch" 
                        checked={needsFollowUp}
                        onChange={() => setNeedsFollowUp(!needsFollowUp)}
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
                      />
                    </div>
                  )}
                  
                  <div className="form-actions question-actions">
                    <Button 
                      variant="secondary" 
                      onClick={handleCancelQuestion}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleAddQuestion}
                    >
                      Add Question
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="question-list">
                  {questions.map((question) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <div className="question-drag">
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
                        <div className="question-actions-buttons">
                          <button className="icon-button" onClick={() => handleEditQuestion(question.id)}>
                            <img src={editIcon} alt="Edit" />
                            <span>Edit</span>
                          </button>
                          <button className="icon-button delete-button" onClick={() => handleDeleteQuestion(question.id)}>
                            <img src={deleteIcon} alt="Delete" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="question-content">
                        <div className="question-label">Question</div>
                        <div className="question-text">{question.text}</div>
                        
                        {question.needsFollowUp && question.purpose && (
                          <div className="question-purpose">
                            <div className="purpose-label">Purpose</div>
                            <div className="purpose-text">{question.purpose}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {showAddForm ? (
                  <>
                    <h2>Add New Question</h2>
                    <div className="add-question-form">
                      <div className="form-group">
                        <label htmlFor="questionText">Question Text</label>
                        <textarea 
                          id="questionText" 
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="Enter your question here"
                          rows={2}
                        />
                      </div>
                      
                      <div className="form-group switch-group">
                        <div className="toggle-switch">
                          <input 
                            type="checkbox" 
                            id="followUpSwitch_existing"
                            checked={needsFollowUp}
                            onChange={() => setNeedsFollowUp(!needsFollowUp)}
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
                          />
                        </div>
                      )}
                      
                      <div className="form-actions question-actions">
                        <Button 
                          variant="secondary" 
                          onClick={handleCancelQuestion}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={handleAddQuestion}
                        >
                          Add Question
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="add-question-button-container">
                    <button className="add-question-button" onClick={toggleAddForm}>
                      <img src={plusIcon} alt="Add" />
                      <span>Add Question</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewSurvey; 
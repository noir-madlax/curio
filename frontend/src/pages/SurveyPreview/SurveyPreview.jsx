import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Button from '../../components/common/Button/Button';
import Badge from '../../components/common/Badge/Badge';
import { FullPageLoading } from '../../components/common/Loading';
import './SurveyPreview.css';
import {
  getSurveyById,
  getQuestionsBySurveyId,
  updateSurvey,
  getQuestionOptions
} from '../../services/surveyService';

// 导入SVG图标
import publishIcon from '../../assets/icons/publish_icon.svg';
import editIcon from '../../assets/icons/edit_icon.svg';

// 2024-10-06T22:00:00Z 新增：问题类型常量
const QUESTION_TYPES = {
  TEXT: 'text',
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  NPS: 'rating_scale',
  BOOLEAN: 'yes_no',
};

// 2024-10-06T22:00:00Z 新增：问题类型名称
const QUESTION_TYPE_NAMES = {
  [QUESTION_TYPES.TEXT]: 'Text Question',
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Choice',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.NPS]: 'NPS Rating',
  [QUESTION_TYPES.BOOLEAN]: 'Boolean Question',
};

// 2024-08-15T17:30:00Z 新增：自定义Publish图标组件
const PublishIcon = ({ color = "#252326" }) => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="button-icon">
    <path d="M13.2946 3.7081L2.35237 5.54223C2.32466 5.54687 2.29868 5.55878 2.27709 5.57675C2.25549 5.59472 2.23905 5.61809 2.22945 5.64449C2.21985 5.67089 2.21743 5.69937 2.22244 5.72701C2.22745 5.75465 2.2397 5.78047 2.25795 5.80183L3.61535 7.38993C3.65802 7.43988 3.71515 7.47535 3.77884 7.49145C3.84253 7.50755 3.90965 7.50349 3.97094 7.47982L13.3364 3.86043C13.3548 3.8534 13.3699 3.83978 13.3788 3.82221C13.3878 3.80464 13.3898 3.78438 13.3846 3.76538C13.3794 3.74637 13.3673 3.72998 13.3507 3.71939C13.3341 3.7088 13.3141 3.70478 13.2947 3.7081H13.2946ZM11.2488 15.3536L15.7123 4.32646C15.724 4.29745 15.7269 4.26561 15.7206 4.23496C15.7143 4.20431 15.6991 4.17621 15.6768 4.1542C15.6546 4.13219 15.6263 4.11724 15.5956 4.11125C15.5649 4.10525 15.5331 4.10847 15.5042 4.1205L5.11047 8.45449C5.07528 8.46915 5.04413 8.49205 5.01963 8.52126C4.99514 8.55047 4.97802 8.58514 4.96971 8.62234C4.96141 8.65955 4.96216 8.69821 4.97191 8.73506C4.98166 8.77191 5.00012 8.80589 5.02573 8.83412L10.9842 15.4007C11.0023 15.4206 11.0251 15.4355 11.0505 15.4442C11.0759 15.4529 11.1031 15.455 11.1296 15.4503C11.156 15.4455 11.1808 15.4342 11.2017 15.4173C11.2225 15.4004 11.2388 15.3784 11.2488 15.3536H11.2488ZM4.68323 15.2817C4.41031 15.4349 4.06567 15.3734 4.00823 15.3663C3.5725 15.3128 3.31124 14.9155 3.3648 14.4797L3.05086 8.72717L1.43823 6.79926C0.843835 6.16948 0.87446 5.18021 1.50662 4.58962C1.74982 4.36265 2.05873 4.21865 2.38894 4.17833L15.2466 2.42497C16.1077 2.31945 16.8926 2.92852 16.9997 3.78545C17.0364 4.079 16.9886 4.37684 16.862 4.64429L12.5082 15.822C12.1385 16.6026 11.2023 16.9363 10.4173 16.5675C10.2388 16.4836 10.0776 16.3669 9.94214 16.2235L7.08741 13.0808C7.07162 13.0919 6.27023 13.8256 4.68323 15.2818V15.2817ZM4.28623 10.2378L4.47688 13.5419C4.47863 13.5724 4.48916 13.6017 4.50719 13.6264C4.52521 13.651 4.54998 13.67 4.5785 13.6809C4.60703 13.6918 4.6381 13.6943 4.668 13.688C4.69789 13.6817 4.72533 13.6669 4.74702 13.6454L6.06831 12.3342C6.12519 12.2778 6.15862 12.2019 6.16188 12.1218C6.16515 12.0418 6.13802 11.9635 6.08593 11.9026L4.56526 10.1255C4.54367 10.1002 4.51469 10.0824 4.48242 10.0745C4.45014 10.0666 4.4162 10.069 4.38537 10.0814C4.35454 10.0938 4.32839 10.1156 4.3106 10.1437C4.29282 10.1717 4.28429 10.2047 4.28623 10.2378Z" fill={color}/>
  </svg>
);

const SurveyPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surveyStatus, setSurveyStatus] = useState('draft');
  
  useEffect(() => {
    if (id) {
      const fetchSurveyData = async () => {
        setIsLoading(true);
        try {
          const surveyData = await getSurveyById(id);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          setSurveyStatus(surveyData.status.toLowerCase());
          
          const questionsData = await getQuestionsBySurveyId(id);
          
          // 2024-10-06T22:00:00Z 修改：保存完整的问题信息，加载问题选项
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
          
        } catch (err) {
          console.error('Error fetching survey data:', err);
          setError(err.message || 'Unable to load survey data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSurveyData();
      
      // 2024-08-18T10:00:00Z 新增：添加返回历史处理
      // 2024-08-22T15:30:00Z 修复：正确注册和清理popstate事件监听器
      const handlePopState = () => {
        navigate(`/surveys/edit/${id}`);
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/surveys');
  };
  
  const handleEdit = () => {
    navigate(`/surveys/edit/${id}`);
  };
  
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // 生成问卷链接
      const generateSurveyLink = (id) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/survey/${id}/respond`;
      };

      const surveyLink = generateSurveyLink(id);
      
      // 2024-10-11T21:30:00Z 修改：更新问卷状态，确保等待操作完成
      console.log('Publishing survey with link:', surveyLink);
      const updateResult = await updateSurvey(id, {
        status: 'published',
        surveyLink: surveyLink
      });
      
      console.log('Survey published successfully:', updateResult);
      
      // 本地状态也更新为published
      setSurveyStatus('published');
      
      // 更新成功后再导航到发布成功页面
      navigate(`/survey-published/${id}`);
    } catch (err) {
      console.error('Error publishing survey:', err);
      setError(err.message || 'Publish survey failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (error) {
    return (
      <MainLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="primary" onClick={handleBack}>
            Back to Surveys
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  if (isLoading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey data..." />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="survey-preview-container">
        <div className="survey-preview-header">
          <div className="header-title">
            <h1>{surveyTitle}</h1>
            {surveyStatus === 'published' && (
              <Badge status="Published" />
            )}
          </div>
          <div className="header-actions">
            <Button 
              variant="secondary" 
              icon={<img src={editIcon} alt="Edit" className="button-icon" />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            
            {surveyStatus === 'published' ? (
              <Button 
                variant="success" 
                icon={<PublishIcon color="#FFFFFF" />}
                onClick={() => {
                  const respondUrl = `/survey/${id}/respond`;
                  console.log('Navigating to:', respondUrl);
                  navigate(respondUrl);
                }}
                className="published-button"
              >
                Respond to Survey
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
          </div>
        </div>
        
        {questions.length === 0 && surveyStatus !== 'published' && (
          <div className="warning-container" style={{
            backgroundColor: '#FFF8E1', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #FFE082'
          }}>
            <p style={{ color: '#FF8F00', margin: 0 }}>
              <strong>Note:</strong> You need to add at least one question to publish this survey. Please return to the edit page to add questions.
            </p>
          </div>
        )}
        
        <div className="survey-preview-content">
          <div className="survey-description-section">
            {surveyDescription && (
              <div className="welcome-message" style={{
                backgroundColor: '#F7F9FC',
                padding: '20px 24px',
                borderRadius: '8px',
                marginBottom: '28px',
                border: '1px solid #E5EEFF'
              }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#4A5568',
                  margin: 0,
                  fontWeight: '400'
                }}>
                  {surveyDescription}
                </p>
              </div>
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
                    No questions added yet. Add your first question below.
                  </p>
                </div>
              ) : (
                <div className="question-list">
                  {questions.map((question) => (
                    <div key={question.id} className="question-item" style={{
                      padding: '16px 20px',
                      borderRadius: '8px',
                      border: '1px solid #E5E5E5',
                      marginBottom: '16px',
                      background: '#FFFFFF'
                    }}>
                      <div className="question-header" style={{
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="question-number" style={{
                            fontWeight: '500',
                            color: '#333',
                            marginRight: '8px'
                          }}>
                            Question {question.number}
                          </div>
                          {question.required && (
                            <div className="required-badge" style={{
                              backgroundColor: '#E8F5E9',
                              color: '#43A047',
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              Required
                            </div>
                          )}
                        </div>
                        <div className="question-type" style={{
                          fontSize: '14px',
                          color: '#6B7280',
                          backgroundColor: '#F3F4F6',
                          padding: '4px 10px',
                          borderRadius: '4px'
                        }}>
                          {QUESTION_TYPE_NAMES[question.type] || question.type}
                        </div>
                      </div>
                      <div className="question-content">
                        <div className="question-text" style={{
                          fontSize: '16px',
                          lineHeight: '1.5',
                          marginBottom: '12px'
                        }}>{question.text}</div>
                        
                        {/* 2024-10-11T21:00:00Z 新增：显示问题选项 */}
                        {(question.type === QUESTION_TYPES.SINGLE_CHOICE || 
                          question.type === QUESTION_TYPES.MULTIPLE_CHOICE) && (
                          <div className="question-options" style={{ marginTop: '10px' }}>
                            {question.options && question.options.length > 0 ? (
                              <ul style={{ 
                                listStyleType: 'none', 
                                padding: 0, 
                                margin: 0 
                              }}>
                                {question.options.map((option, idx) => (
                                  <li key={option.id || idx} style={{
                                    padding: '8px 12px',
                                    margin: '4px 0',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '4px',
                                    border: '1px solid #E5E7EB'
                                  }}>
                                    {option.text}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No options available</p>
                            )}
                          </div>
                        )}
                        
                        {question.type === QUESTION_TYPES.NPS && (
                          <div className="nps-preview" style={{ marginTop: '10px' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              maxWidth: '500px'
                            }}>
                              {Array.from({ length: 11 }, (_, i) => (
                                <div key={i} style={{
                                  width: '36px',
                                  height: '36px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  {i}
                                </div>
                              ))}
                            </div>
                            {question.options && question.options.length >= 2 && (
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                maxWidth: '500px',
                                marginTop: '4px'
                              }}>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>{question.options[0]?.text || 'Not likely'}</span>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>{question.options[1]?.text || 'Very likely'}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {question.type === QUESTION_TYPES.BOOLEAN && (
                          <div className="boolean-preview" style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <div style={{
                                padding: '8px 16px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '4px',
                                border: '1px solid #E5E7EB'
                              }}>
                                {question.options && question.options.length > 0 ? question.options[0]?.text : 'Yes'}
                              </div>
                              <div style={{
                                padding: '8px 16px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '4px',
                                border: '1px solid #E5E7EB'
                              }}>
                                {question.options && question.options.length > 1 ? question.options[1]?.text : 'No'}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {question.type === QUESTION_TYPES.TEXT && (
                          <div className="text-preview" style={{ marginTop: '10px' }}>
                            <div style={{
                              height: '80px',
                              backgroundColor: '#F9FAFB',
                              borderRadius: '4px',
                              border: '1px solid #E5E7EB',
                              padding: '8px 12px',
                              color: '#9CA3AF',
                              fontStyle: 'italic'
                            }}>
                              Text answer field
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
      </div>
    </MainLayout>
  );
};

export default SurveyPreview; 
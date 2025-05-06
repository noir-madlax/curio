import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import { FullPageLoading, LoadingOverlay } from '../../components/common/Loading';
import './SurveyResponse.css';
import { 
  getSurveyById, 
  getQuestionsBySurveyId,
  submitSurveyResponse
} from '../../services/surveyService';

// 导入SVG图标
import logo from '../../assets/icons/curio_logo.svg'; // 假设有这个图标，如果没有请创建

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
  
  // 存储用户的回答
  const [responses, setResponses] = useState({});
  
  useEffect(() => {
    if (surveyId) {
      const fetchSurveyData = async () => {
        setIsLoading(true);
        try {
          console.log('Fetching survey data for surveyId:', surveyId);
          const surveyData = await getSurveyById(surveyId);
          setSurveyTitle(surveyData.title);
          setSurveyDescription(surveyData.description || '');
          
          const questionsData = await getQuestionsBySurveyId(surveyId);
          
          const formattedQuestions = questionsData.map((q, index) => ({
            id: q.id,
            number: index + 1,
            text: q.text
          }));
          
          setQuestions(formattedQuestions);
          
          // 初始化responses对象
          const initialResponses = {};
          formattedQuestions.forEach(q => {
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
  
  const handleChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 格式化回答数据
      const formattedResponses = Object.keys(responses).map(questionId => ({
        questionId,
        text: responses[questionId]
      }));
      
      // 过滤掉空回答
      const validResponses = formattedResponses.filter(r => r.text.trim() !== '');
      
      if (validResponses.length === 0) {
        setError('Please answer at least one question');
        setIsSubmitting(false);
        return;
      }
      
      // 提交回答
      await submitSurveyResponse(surveyId, {
        responses: validResponses
      });
      
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting survey responses:', err);
      setError(err.message || 'Failed to submit survey responses');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    // 重置所有回答
    const resetResponses = {};
    questions.forEach(q => {
      resetResponses[q.id] = '';
    });
    setResponses(resetResponses);
  };
  
  if (error) {
    return (
      <div className="mobile-survey-container">
        <div className="mobile-survey-header">
          <img src={logo} alt="Curio" className="mobile-logo" />
        </div>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="mobile-survey-container">
        <div className="mobile-survey-header">
          <img src={logo} alt="Curio" className="mobile-logo" />
        </div>
        <FullPageLoading message="Loading survey..." />
      </div>
    );
  }
  
  if (submitSuccess) {
    return (
      <div className="mobile-survey-container">
        <div className="mobile-survey-header">
          <img src={logo} alt="Curio" className="mobile-logo" />
        </div>
        <div className="success-container">
          <h2>Thank You!</h2>
          <p>Your response has been successfully submitted.</p>
          <p>You can now close this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mobile-survey-container">
      <div className="mobile-survey-header">
        <img src={logo} alt="Curio" className="mobile-logo" />
      </div>
      
      <div className="mobile-survey-content">
        <div className="mobile-survey-title">
          <h1>{surveyTitle}</h1>
        </div>
        
        {isSubmitting && (
          <LoadingOverlay message="Submitting your responses..." />
        )}
        
        <div className="mobile-description-section">
          {surveyDescription && (
            <p className="mobile-description">{surveyDescription}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="mobile-survey-form">
          <div className="mobile-questions-section">
            <h2 className="mobile-section-title">Questions</h2>
            {questions.length === 0 ? (
              <div className="empty-questions-message">
                <p>No questions available in this survey.</p>
              </div>
            ) : (
              <div className="question-list">
                {questions.map((question) => (
                  <div key={question.id} className="mobile-question-item">
                    <div className="mobile-question-number">
                      Question {question.number}
                    </div>
                    <div className="mobile-question-text">{question.text}</div>
                    <div className="mobile-response-input">
                      <textarea
                        value={responses[question.id]}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mobile-response-actions">
              <Button 
                variant="secondary" 
                onClick={handleReset}
                disabled={isSubmitting}
                type="button"
                className="mobile-reset-button"
              >
                Reset
              </Button>
              <Button 
                variant="primary" 
                disabled={isSubmitting || questions.length === 0}
                type="submit"
                className="mobile-submit-button"
              >
                Submit Response
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mobile-survey-footer">
        <p>Powered by Curio</p>
      </div>
    </div>
  );
};

export default SurveyResponse; 
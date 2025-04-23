import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import MainLayout from '../../components/layout/MainLayout/MainLayout'; // 可能不需要完整布局
import Button from '../../components/common/Button/Button';
import './SurveyChat.css';

// --- 模拟数据 --- 
const MOCK_SURVEYS = {
  'survey1745398678596': { // 使用示例ID
    title: 'Product Feedback Survey',
    questions: [
      'On a scale of 1-10, how satisfied are you with our product?',
      'What features do you like the most?',
      'Is there anything you dislike or would like to see improved?',
      'How likely are you to recommend our product to a friend or colleague (1-10)?'
    ],
    welcomeMessage: "Hi there! I'm Curio, your AI survey assistant. I'd like to ask you a few questions about your experience with our product. This should take about 2 minutes. Ready to begin?",
    thankYouMessage: "That's all the questions I have. Thanks for your feedback!"
  },
  // 可以添加更多模拟问卷
};
// ---------------

// --- 图标占位符 ---
const AvatarAI = () => <div className="avatar ai-avatar">🤖</div>; // 简单占位符
const AvatarUser = () => <div className="avatar user-avatar">🧑</div>; // 简单占位符
const SendIcon = () => <span className="icon-placeholder">➤</span>; // 简单占位符
// ---------------

const SurveyChat = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSurveyFinished, setIsSurveyFinished] = useState(false);
  const messagesEndRef = useRef(null); // 用于自动滚动

  // 模拟获取问卷数据并开始对话
  useEffect(() => {
    const fetchedSurvey = MOCK_SURVEYS[surveyId];
    if (fetchedSurvey) {
      setSurveyData(fetchedSurvey);
      // 添加欢迎消息和第一个问题
      setMessages([
        {
          id: Date.now() + '_ai_welcome',
          sender: 'ai',
          text: fetchedSurvey.welcomeMessage,
          timestamp: new Date()
        },
        {
          id: Date.now() + '_ai_q0',
          sender: 'ai',
          text: fetchedSurvey.questions[0],
          timestamp: new Date()
        }
      ]);
      setCurrentQuestionIndex(1); // 指向下一个问题 (index 1)
    } else {
      // 处理无效 surveyId 的情况，例如导航到404页面
      console.error("Invalid survey ID");
      // navigate('/not-found'); 
    }
  }, [surveyId, navigate]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // 处理发送消息/回答问题
  const handleSendMessage = () => {
    if (!inputValue.trim() || isSurveyFinished || !surveyData) return;

    const now = new Date();
    // 1. 添加用户消息
    const userMessage = {
      id: Date.now() + '_user',
      sender: 'user',
      text: inputValue,
      timestamp: now
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue(''); // 清空输入框

    // 2. 模拟AI处理和回复
    setTimeout(() => {
      // 检查是否还有下一个问题
      if (currentQuestionIndex < surveyData.questions.length) {
        const nextQuestionMessage = {
          id: Date.now() + `_ai_q${currentQuestionIndex}`,
          sender: 'ai',
          text: surveyData.questions[currentQuestionIndex],
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, nextQuestionMessage]);
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // 问卷结束
        const thankYouMessage = {
          id: Date.now() + '_ai_thanks',
          sender: 'ai',
          text: surveyData.thankYouMessage,
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, thankYouMessage]);
        setIsSurveyFinished(true);
      }
    }, 800); // 模拟延迟
  };

  // 处理输入框按 Enter 发送
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行行为
      handleSendMessage();
    }
  };

  if (!surveyData) {
    // 可以显示加载状态或错误信息
    return <div>Loading survey... or Survey not found.</div>;
  }

  return (
    <div className="survey-chat-page">
      {/* 简化的头部，只显示标题 */}
      <header className="chat-header">
        <h1>{surveyData.title}</h1>
        {/* 可以放进度条等 */}
      </header>

      {/* 消息列表 */}
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {msg.sender === 'ai' && <AvatarAI />} 
            <div className="message-content">
              <div className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </div>
              <span className="timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.sender === 'user' && <AvatarUser />} 
          </div>
        ))}
        {/* 空 div 用于滚动定位 */}
        <div ref={messagesEndRef} /> 
      </div>

      {/* 输入区域 */}
      <div className="input-area">
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer..."
          rows="1" // 初始行数，可以根据输入内容自适应高度 (需要额外JS或CSS)
          disabled={isSurveyFinished}
        />
        <Button 
          variant="primary" 
          onClick={handleSendMessage} 
          disabled={isSurveyFinished || !inputValue.trim()}
          className="send-button"
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  );
};

export default SurveyChat; 
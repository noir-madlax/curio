import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// 2024-08-06: Import custom SVG icons
import './SurveyChatPage.css'; // Import styles
// 2024-08-23: 导入发送按钮图标
import sendIcon from '../../assets/icons/send_chat_icon.svg';

// 2024-08-06: Initial messages based on Figma design
const initialMessages = [
  {
    id: 1,
    sender: 'ai',
    text: "Hi there! I'm Curio, your Al survey assistant. I'd like to ask you a few questions about your experience with our product. This should take about 2 minutes. Ready to begin?"
  },
  {
    id: 2,
    sender: 'user',
    text: "Several times a week"
  },
  {
    id: 3,
    sender: 'ai',
    text: "On a scale of 1-10, how satisfied are you with our product?"
  },
  {
    id: 4,
    sender: 'user',
    text: "5"
  }
];

// 2024-08-23: 定义问题总数，用于计算进度
const TOTAL_QUESTIONS = 5;

// Survey response chat page component
function SurveyChatPage() {
  // Get surveyId from URL (not used yet, but kept for future)
  const { surveyId } = useParams();
  // Message list state, using initial messages from Figma
  const [messages, setMessages] = useState(initialMessages);
  // Input box content state
  const [inputValue, setInputValue] = useState('');
  // Reference for chat message area, used for auto-scrolling
  const messagesEndRef = useRef(null);
  
  // 2024-08-31: 更新进度计算逻辑，基于已回答的问题数量
  const answeredQuestions = messages.filter(msg => msg.sender === 'user').length;
  const progress = Math.min(100, Math.round((answeredQuestions / TOTAL_QUESTIONS) * 100));

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when message list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message function (keep reply logic simple)
  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (text) {
      const newUserMessage = {
        id: Date.now(),
        sender: 'user',
        text: text,
      };
      
      // 2024-08-23: 根据问题进度生成不同的回复
      let aiResponse;
      const answeredQuestions = messages.filter(msg => msg.sender === 'user').length;
      const nextQuestionNumber = answeredQuestions + 1;
      
      // 根据当前进度生成不同的问题
      if (nextQuestionNumber < TOTAL_QUESTIONS) {
        // 模拟不同的问题
        const questions = [
          "Thank you! What features do you use most frequently?",
          "What improvements would you like to see in our product?",
          "Would you recommend our product to others? Why or why not?"
        ];
        
        aiResponse = questions[nextQuestionNumber - 2] || "Thank you for your feedback. Next question...";
      } else {
        // 最后一个问题的回答
        aiResponse = "Thank you for completing the survey! Your feedback is greatly appreciated.";
      }
      
      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse
      };
      
      setMessages(prevMessages => [...prevMessages, newUserMessage, newAiMessage]);
      setInputValue('');
    }
  };

  // Handle input box content change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    // 2024-08-06: Simple implementation of textarea height adaptation
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  // Handle sending message with Enter key
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 2024-08-31: 移除调试信息，使用通用日志
  console.log('当前进度:', progress, '%');

  return (
    <div className="survey-chat-page">
      {/* Top title bar - 2024-08-23: 更新标题为居中 */}
      <header className="chat-header">
        <h1>Product Feedback Survey</h1>
      </header>

      {/* 2024-08-31: 修改进度条实现，移除内联样式，使用CSS类 */}
      <div className="progress-container">
        <div className="progress-bar-container">
          <div className="progress-bar-background">
            <div 
              className="progress-bar-foreground"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chat message area - 2024-08-06: Updated rendering logic */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'ai' ? 'ai-message-row' : 'user-message-row'}`}
          >
            {/* 2024-08-06: Add AI avatar */}
            {message.sender === 'ai' && (
              <div className="avatar ai-avatar">C</div>
            )}
            {/* Message bubble */}
            <div className={`message-bubble ${message.sender === 'ai' ? 'ai-message' : 'user-message'}`}>
              <p>{message.text}</p>
            </div>
            {/* 2024-08-06: Add user avatar */}
            {message.sender === 'user' && (
              <div className="avatar user-avatar">Y</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom input area - 2024-08-25: 将发送按钮移到输入框外部 */}
      <div className="chat-input-area">
        {/* 2024-08-06: Input box and send button container */}
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Please type your answer..." // 2024-08-31: 更新为中文占位符
            rows="1"
            className="input-textarea" // 2024-08-31: 使用CSS类替代内联样式
          />
        </div>
        {/* 2024-08-31: 统一将发送按钮的文本改为中文 */}
        <button
          className={`send-icon-button ${inputValue.trim() ? 'active' : ''}`}
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          aria-label="send message"
        >
          <img src={sendIcon} alt="send message" className="send-icon" />
        </button>
      </div>
    </div>
  );
}

export default SurveyChatPage;

// 2024-08-23: 移除内联CSS，所有样式已移至SurveyChatPage.css 
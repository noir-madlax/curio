import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// 2024-07-28: 引入自定义SVG图标
import './SurveyChatPage.css'; // 引入样式

// 2024-07-27: 根据Figma设计稿提供的初始消息
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

// 问卷回答聊天页面组件
function SurveyChatPage() {
  // 从 URL 中获取 surveyId (暂时未使用，但保留)
  const { surveyId } = useParams();
  // 消息列表状态，使用Figma的初始消息
  const [messages, setMessages] = useState(initialMessages);
  // 输入框内容状态
  const [inputValue, setInputValue] = useState('');
  // 聊天消息区域的引用，用于自动滚动
  const messagesEndRef = useRef(null);
  // 2024-07-27: 模拟进度状态
  const [progress] = useState(50); // 假设进度为50%

  // 滚动到底部函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理发送消息的函数 (模拟回复逻辑保持简单)
  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (text) {
      const newUserMessage = {
        id: Date.now(),
        sender: 'user',
        text: text,
      };
      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Received your answer: "${text}". Next question is...` // 保持简单模拟
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage, newAiMessage]);
      setInputValue('');
    }
  };

  // 处理输入框内容变化
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    // 2024-07-27: 简单实现textarea高度自适应
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  // 处理按 Enter 键发送消息
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="survey-chat-page">
      {/* 顶部标题栏 - 2024-07-27: 根据Figma更新 */}
      <header className="chat-header">
        <h1>Product Feedback Survey</h1>
        {/* 2024-07-27: 关闭按钮 (功能需自行实现) */}
      </header>
      {/* 2024-07-27: 进度条 - 根据Figma添加 */}
      <div className="progress-bar-container">
        <div className="progress-bar-background"></div>
        <div className="progress-bar-foreground" style={{ width: `${progress}%` }}></div>
      </div>

      {/* 聊天消息区域 - 2024-07-27: 更新渲染逻辑 */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'ai' ? 'ai-message-row' : 'user-message-row'}`}
          >
            {/* 2024-07-27: 添加AI头像 */}
            {message.sender === 'ai' && (
              <div className="avatar ai-avatar">C</div>
            )}
            {/* 消息气泡 */}
            <div className={`message-bubble ${message.sender === 'ai' ? 'ai-message' : 'user-message'}`}>
              <p>{message.text}</p>
            </div>
            {/* 2024-07-27: 添加用户头像 */}
            {message.sender === 'user' && (
              <div className="avatar user-avatar">Y</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 - 2024-07-27: 根据Figma重构 */}
      <div className="chat-input-area">
        {/* 2024-07-27: 输入框和发送按钮容器 */}
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..." // 2024-07-27: 更新占位符
            rows="1"
            style={{ maxHeight: '100px' }} // 限制最大高度
          />
          {/* 2024-07-27: 发送图标按钮 - 2024-07-28: 更新为SVG图标 */}
          <button
            className="send-icon-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
          </button>
        </div>
        {/* 移除旧按钮 */}
        {/* <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          发送
        </button> */}
      </div>
    </div>
  );
}

export default SurveyChatPage;

// 2024-07-27: 为进度条添加一些基础CSS (应移至 SurveyChatPage.css)
const styles = `
.progress-bar-container {
  height: 4px;
  width: 100%; /* 或者根据Figma调整为固定宽度如 370px */
  background-color: transparent; /* 容器背景透明 */
  padding: 0 16px; /* 左右留白 */
  box-sizing: border-box;
}
.progress-bar-background {
  height: 4px;
  width: 100%;
  background-color: #E9E9EB; /* Figma中的灰色背景 D9D9D9 可能太深 */
  border-radius: 2px;
  position: relative;
}
.progress-bar-foreground {
  height: 4px;
  width: 100%;
  background-color: #3C82F6; /* Figma中的蓝色 2463EB */
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
}
`;

// 动态添加样式到head (临时方案)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 
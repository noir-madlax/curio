import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// 2024-08-06: Import custom SVG icons
import './SurveyChatPage.css'; // Import styles
// 2024-08-23: 导入发送按钮图标
import sendIcon from '../../assets/icons/send_chat_icon.svg';
// 2024-04-25: 导入聊天服务函数，从专门的chatService.js中导入
import { startSurveyChat, sendSurveyMessage } from '../../services/chatService';

// 2024-04-25: 移除初始静态消息

// 2024-08-23: 定义问题总数，用于计算进度
const TOTAL_QUESTIONS = 5;

// Survey response chat page component
function SurveyChatPage() {
  // Get surveyId and responseId from URL
  const { surveyId } = useParams();
  const location = useLocation();
  // 2024-04-25: 从URL查询参数中获取responseId
  const queryParams = new URLSearchParams(location.search);
  const responseIdFromQuery = queryParams.get('responseId');
  
  // 2024-04-25: 增加responseId状态，暂时使用固定值1（从数据库第一条记录）
  const [responseId, setResponseId] = useState(responseIdFromQuery); // 默认使用1作为responseId
  
  // Message list state, starting with empty array
  const [messages, setMessages] = useState([]);
  // Input box content state
  const [inputValue, setInputValue] = useState('');
  // Reference for chat message area, used for auto-scrolling
  const messagesEndRef = useRef(null);
  // 2024-04-25: 新增加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 2024-04-25: 新增错误状态
  const [error, setError] = useState(null);
  // 2024-04-25: 新增当前正在流式获取的消息
  const [streamingMessage, setStreamingMessage] = useState('');
  
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
  }, [messages, streamingMessage]);

  // 2024-04-25: 处理流式响应的函数
  const handleStreamResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 获取响应的reader
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    setStreamingMessage(''); // 清空流式消息缓存
    
    let isDone = false;
    while (!isDone) {
      const { value, done } = await reader.read();
      isDone = done;
      
      if (done) {
        // 流结束，将缓存的消息添加到消息列表
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(),
            sender: 'ai',
            text: streamingMessage
          }
        ]);
        setStreamingMessage(''); // 清空流式消息缓存
        setIsLoading(false);
        break;
      }
      
      // 解码当前块并添加到缓存
      const chunk = decoder.decode(value, { stream: true });
      setStreamingMessage(prev => prev + chunk);
    }
  };

  // 2024-04-25: 初始化对话，在组件加载时调用
  useEffect(() => {
    if (responseId) {
      const initializeChat = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          // 调用API开始对话
          const response = await startSurveyChat(responseId);
          await handleStreamResponse(response);
        } catch (err) {
          console.error('初始化对话失败:', err);
          setError('无法开始对话。请刷新页面重试。');
          setIsLoading(false);
        }
      };
      
      initializeChat();
    } else {
      setError('缺少必要的参数(responseId)。无法开始对话。');
    }
  }, [responseId]); // 仅在responseId改变时执行
  
  // Handle send message function
  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (text && !isLoading) {
      // 添加用户消息到列表
      const newUserMessage = {
        id: Date.now(),
        sender: 'user',
        text: text,
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputValue('');
      
      try {
        setIsLoading(true);
        
        // 调用API发送消息
        const response = await sendSurveyMessage(responseId, text);
        await handleStreamResponse(response);
      } catch (err) {
        console.error('发送消息失败:', err);
        setIsLoading(false);
        // 添加错误消息
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(),
            sender: 'ai',
            text: '抱歉，发送消息时出现错误。请重试。'
          }
        ]);
      }
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

  // 2024-04-25: 移除调试日志

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

      {/* 错误消息显示区域 */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Chat message area */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-row ${message.sender === 'ai' ? 'ai-message-row' : 'user-message-row'}`}
          >
            {/* AI avatar */}
            {message.sender === 'ai' && (
              <div className="avatar ai-avatar">C</div>
            )}
            {/* Message bubble */}
            <div className={`message-bubble ${message.sender === 'ai' ? 'ai-message' : 'user-message'}`}>
              <p>{message.text}</p>
            </div>
            {/* User avatar */}
            {message.sender === 'user' && (
              <div className="avatar user-avatar">Y</div>
            )}
          </div>
        ))}
        
        {/* 流式消息显示 */}
        {streamingMessage && (
          <div className="message-row ai-message-row">
            <div className="avatar ai-avatar">C</div>
            <div className="message-bubble ai-message">
              <p>{streamingMessage}</p>
            </div>
          </div>
        )}
        
        {/* 加载中指示器 */}
        {isLoading && !streamingMessage && (
          <div className="message-row ai-message-row">
            <div className="avatar ai-avatar">C</div>
            <div className="message-bubble ai-message">
              <p>思考中...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom input area */}
      <div className="chat-input-area">
        {/* Input box and send button container */}
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的回答..." // 2024-04-25: 更新为中文占位符
            rows="1"
            className="input-textarea"
            disabled={isLoading} // 加载时禁用输入框
          />
        </div>
        {/* Send button */}
        <button
          className={`send-icon-button ${inputValue.trim() && !isLoading ? 'active' : ''}`}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading} // 加载时禁用发送按钮
          aria-label="发送消息"
        >
          <img src={sendIcon} alt="发送消息" className="send-icon" />
        </button>
      </div>
    </div>
  );
}

export default SurveyChatPage;

// 2024-08-23: 移除内联CSS，所有样式已移至SurveyChatPage.css 
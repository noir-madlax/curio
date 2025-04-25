import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// 2024-08-06: Import custom SVG icons
import './SurveyChatPage.css'; // Import styles
// 2024-08-23: 导入发送按钮图标
import sendIcon from '../../assets/icons/send_chat_icon.svg';
// 2024-04-25: 导入聊天服务函数，从专门的chatService.js中导入
import { startSurveyChat, sendSurveyMessage } from '../../services/chatService';
// 2024-09-24: 导入调查问卷响应服务函数
import { createSurveyResponse, getSurveyResponseById, getSurveyResponseConversations } from '../../services/surveyService';

// 2024-08-23: 定义问题总数，用于计算进度
const TOTAL_QUESTIONS = 5;

// 2024-09-24: 更新获取或创建responseId的函数，使用 Supabase
const getOrCreateResponseId = async (surveyId) => {
  // 尝试从localStorage获取已存储的responseId
  const storageKey = 'survey_respond_id';
  const storedResponseId = localStorage.getItem(storageKey);
  
  // 如果已存在该问卷的responseId，验证它是否存在于数据库中
  if (storedResponseId) {
    console.log('发现已存储的responseId:', storedResponseId);
    try {
      // 验证responseId是否有效
      const response = await getSurveyResponseById(storedResponseId);
      if (response && response.survey_id === parseInt(surveyId)) {
        console.log('使用已存在的有效responseId:', storedResponseId);
        return storedResponseId;
      } else {
        console.log('已存储的responseId无效或属于不同的调查问卷，需要创建新的');
        // 继续执行，创建新的responseId
      }
    } catch (error) {
      console.error('验证responseId时出错:', error);
      // 继续执行，创建新的responseId
    }
  }
  
  // 创建新的问卷响应记录
  try {
    const newResponse = await createSurveyResponse(surveyId);
    const newResponseId = newResponse.id;
    
    // 存储到localStorage
    localStorage.setItem(storageKey, newResponseId.toString());
    
    console.log('创建新的responseId:', newResponseId);
    return newResponseId;
  } catch (error) {
    console.error('创建新的responseId失败:', error);
    throw error;
  }
};

// 2024-09-25: 加载对话历史记录
const loadConversationHistory = async (responseId) => {
  try {
    console.log('加载对话历史记录，Response ID:', responseId);
    const conversations = await getSurveyResponseConversations(responseId);
    
    if (!conversations || conversations.length === 0) {
      console.log('没有找到对话历史记录');
      return [];
    }
    
    console.log(`找到 ${conversations.length} 条对话记录:`, conversations);
    
    // 将对话记录转换为前端消息格式
    const messages = [];
    
    for (const conv of conversations) {
      // 打印每条记录以便调试
      console.log('处理对话记录:', conv);
      
      // 使用正确的字段名: speaker_type 和 message_text
      const speakerType = conv.speaker_type ? conv.speaker_type.toLowerCase() : '';
      const messageText = conv.message_text || '';
      
      // 只处理用户和AI的消息
      if (speakerType === 'user' || speakerType === 'assistant' || 
          speakerType === 'human' || speakerType === 'ai') {
        messages.push({
          id: conv.id,
          sender: (speakerType === 'user' || speakerType === 'human') ? 'user' : 'ai',
          text: messageText,
        });
      } else {
        console.log('跳过不支持的角色类型的对话记录:', conv);
      }
    }
    
    // 按照对话顺序排序
    messages.sort((a, b) => {
      const orderA = conversations.find(c => c.id === a.id)?.conversation_order || 0;
      const orderB = conversations.find(c => c.id === b.id)?.conversation_order || 0;
      return orderA - orderB;
    });
    
    console.log('转换后的消息列表:', messages);
    return messages;
  } catch (error) {
    console.error('加载对话历史记录失败:', error);
    return [];
  }
};

// Survey response chat page component
function SurveyChatPage() {
  // Get surveyId and responseId from URL
  const { surveyId } = useParams();
  const location = useLocation();
  // 2024-04-25: 从URL查询参数中获取responseId
  const queryParams = new URLSearchParams(location.search);
  const responseIdFromQuery = queryParams.get('responseId');
  
  // 2024-09-24: 更新状态初始化和获取逻辑
  const [responseId, setResponseId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2024-09-25: 添加初始化标志，防止重复初始化
  const hasInitialized = useRef(false);
  const chatInitialized = useRef(false);
  
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

  // 2024-09-25: 优化流式响应处理函数，实现打字机效果
  const handleStreamResponse = async (response) => {
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 获取响应的reader
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // 开始接收前清空流式消息
    setStreamingMessage('');
    setIsLoading(true);
    
    let buffer = '';
    let messageContent = '';
    let displayedContent = ''; // 跟踪实际显示的内容
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        
        // 流结束处理
        if (done) {
          console.log('流结束，最终消息长度:', messageContent.length);
          
          // 确保所有内容都已经显示
          if (displayedContent !== messageContent) {
            setStreamingMessage(messageContent);
          }
          
          // 短暂延迟后将完整消息添加到消息列表，并清空流式消息
          setTimeout(() => {
            if (messageContent.trim()) {
              setMessages(prevMessages => [...prevMessages, {
                id: Date.now(),
                sender: 'ai',
                text: messageContent.trim()
              }]);
            }
            setStreamingMessage('');
            setIsLoading(false);
          }, 500);
          
          break;
        }
        
        // 解码接收到的块并添加到缓冲区
        buffer += decoder.decode(value, { stream: true });
        
        // 处理缓冲区中的数据行
        const lines = buffer.split('\n');
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';
        
        let newContent = '';
        
        // 处理完整的行
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data:')) {
            const data = trimmedLine.substring(5).trim();
            
            // 检查是否是完成标记
            if (data === '[DONE]') {
              console.log('收到 [DONE] 标记');
              continue;
            }
            
            // 添加到新内容
            newContent += data;
          } else if (trimmedLine && !trimmedLine.startsWith('event:')) {
            // 处理非空、非data开头、非event开头的行
            newContent += trimmedLine;
          }
        }
        
        // 有新内容时，更新完整消息
        if (newContent) {
          messageContent += newContent;
          
          // 计算尚未显示的字符数
          const remainingChars = messageContent.length - displayedContent.length;
          
          // 如果有很多未显示字符，分批显示以实现打字机效果
          if (remainingChars > 0) {
            const typingSpeed = 10; // 每个字符的毫秒间隔
            const batchSize = 3;    // 每批显示的字符数
            
            for (let i = 0; i < remainingChars; i += batchSize) {
              const charsToAdd = Math.min(batchSize, remainingChars - i);
              
              // 延迟显示，创建打字机效果
              setTimeout(() => {
                displayedContent = messageContent.substring(0, displayedContent.length + charsToAdd);
                setStreamingMessage(displayedContent);
              }, (i / batchSize) * typingSpeed);
            }
            
            // 确保最终显示完整消息
            setTimeout(() => {
              displayedContent = messageContent;
              setStreamingMessage(displayedContent);
            }, (remainingChars / batchSize) * typingSpeed);
          }
        }
      }
    } catch (error) {
      console.error('流读取过程中出错:', error);
      
      // 确保即使出错，已接收的消息也能显示
      if (messageContent.trim()) {
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now(),
          sender: 'ai',
          text: messageContent.trim()
        }]);
      }
      
      setStreamingMessage('');
      setIsLoading(false);
      setError(`流式读取错误: ${error.message}`);
    }
  };

  // 2024-09-25: 使用useEffect异步获取responseId
  useEffect(() => {
    // 2024-09-25: 防止重复初始化
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const initResponseId = async () => {
      try {
        // 优先使用URL中的responseId参数
        let id;
        let isExistingResponse = false;
        
        if (responseIdFromQuery) {
          id = responseIdFromQuery;
        } else {
          // 检查localStorage中是否有responseId
          const storageKey = 'survey_respond_id';
          const storedResponseId = localStorage.getItem(storageKey);
          
          if (storedResponseId) {
            // 验证storedResponseId是否有效
            try {
              const response = await getSurveyResponseById(storedResponseId);
              if (response && response.survey_id === parseInt(surveyId)) {
                id = storedResponseId;
                isExistingResponse = true; // 标记为已存在的响应
              }
            } catch (error) {
              console.error('验证存储的responseId时出错:', error);
            }
          }
          
          // 如果没有有效的responseId，创建新的
          if (!id) {
            const newResponse = await createSurveyResponse(surveyId);
            id = newResponse.id;
            localStorage.setItem(storageKey, id.toString());
          }
        }
        
        setResponseId(id);
        
        // 如果是已存在的响应，加载对话历史
        if (isExistingResponse) {
          const historyMessages = await loadConversationHistory(id);
          if (historyMessages && historyMessages.length > 0) {
            setMessages(historyMessages);
            // 已加载历史，不需要重新开始对话
            chatInitialized.current = true;
          }
        }
      } catch (error) {
        console.error('初始化responseId失败:', error);
        setError('初始化对话失败。请刷新页面重试。');
      } finally {
        setLoading(false);
      }
    };
    
    initResponseId();
  }, [surveyId, responseIdFromQuery]);
  
  // 2024-09-25: 初始化对话逻辑，等待responseId准备好，并检查是否已经有对话历史
  useEffect(() => {
    if (responseId && !loading && !chatInitialized.current) {
      chatInitialized.current = true;
      
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
          chatInitialized.current = false; // 初始化失败，重置标志以便重试
        }
      };
      
      initializeChat();
    } else if (!loading && !responseId) {
      setError('缺少必要的参数(responseId)。无法开始对话。');
    }
  }, [responseId, loading]); // 在responseId和loading改变时执行
  
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

  // 2024-04-26: 添加调试信息，仅在开发环境显示
  useEffect(() => {
    // 2024-04-26: 修正环境变量访问方式
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      console.log('当前问卷ID:', surveyId);
      console.log('当前响应ID:', responseId);
    }
  }, [surveyId, responseId]);

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
        
        {/* 加载中指示器 - 仅在无流式消息时显示 */}
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
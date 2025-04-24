import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
// 2024-08-06: Import custom SVG icons
import './SurveyChatPage.css'; // Import styles

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
  // 2024-08-06: Simulate progress state
  const [progress] = useState(50); // Assume 50% progress

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
      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Received your answer: "${text}". Next question is...` // Keep simulation simple
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

  return (
    <div className="survey-chat-page">
      {/* Top title bar - 2024-08-06: Updated according to Figma */}
      <header className="chat-header">
        <h1>Product Feedback Survey</h1>
        {/* 2024-08-06: Close button (functionality needs to be implemented) */}
      </header>
      {/* 2024-08-06: Progress bar - Added according to Figma */}
      <div className="progress-bar-container">
        <div className="progress-bar-background"></div>
        <div className="progress-bar-foreground" style={{ width: `${progress}%` }}></div>
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

      {/* Bottom input area - 2024-08-06: Restructured according to Figma */}
      <div className="chat-input-area">
        {/* 2024-08-06: Input box and send button container */}
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..." // 2024-08-06: Updated placeholder
            rows="1"
            style={{ maxHeight: '100px' }} // Limit maximum height
          />
          {/* 2024-08-06: Send icon button - Updated to SVG icon */}
          <button
            className="send-icon-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurveyChatPage;

// 2024-08-06: Add some basic CSS for progress bar (should be moved to SurveyChatPage.css)
const styles = `
.progress-bar-container {
  height: 4px;
  width: 100%; /* or adjust to fixed width like 370px according to Figma */
  background-color: transparent; /* transparent container background */
  padding: 0 16px; /* left-right padding */
  box-sizing: border-box;
}
.progress-bar-background {
  height: 4px;
  width: 100%;
  background-color: #E9E9EB; /* Gray background from Figma (D9D9D9 might be too dark) */
  border-radius: 2px;
  position: relative;
}
.progress-bar-foreground {
  height: 4px;
  width: 100%;
  background-color: #3C82F6; /* Blue from Figma 2463EB */
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
}
`;

// Dynamically add styles to head (temporary solution)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 
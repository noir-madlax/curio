// 2024-04-25: 新增聊天服务文件，从surveyService.js分离出聊天相关功能

// 2024-04-25: 开始问卷对话，调用first_chat接口
export const startSurveyChat = async (responseId) => {
  console.log(`startSurveyChat 被调用，Response ID: ${responseId}`);
  
  // 构建API URL
  const apiUrl = `${process.env.REACT_APP_API_BASE_URL || ''}/api/v1/survey-conversations/first_chat`;
  
  // 使用fetch API发送POST请求，指定响应类型为流式
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ response_id: responseId }),
  });

  return response;
};

// 2024-04-25: 发送消息给LLM，调用chat接口
export const sendSurveyMessage = async (responseId, message) => {
  console.log(`sendSurveyMessage 被调用，Response ID: ${responseId}, 消息: ${message}`);
  
  // 构建API URL
  const apiUrl = `${process.env.REACT_APP_API_BASE_URL || ''}/api/v1/survey-conversations/chat`;
  
  // 使用fetch API发送POST请求，指定响应类型为流式
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      response_id: responseId,
      message: message,
    }),
  });

  return response;
}; 
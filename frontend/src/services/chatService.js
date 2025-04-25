// 2024-04-25: 新增聊天服务文件，从surveyService.js分离出聊天相关功能

// 2024-04-27: 直接使用完整URL，确保与curl命令一致
const API_URL = 'http://3.216.98.136:8080/api/v1/survey-conversations';

// 2024-04-26: 开始问卷对话，调用first_chat接口
export const startSurveyChat = async (responseId) => {
  console.log(`startSurveyChat 被调用，Response ID: ${responseId}`);
  
  // 2024-04-27: 使用硬编码的完整URL，确保与curl命令一致
  const apiUrl = `${API_URL}/first_chat`;
  console.log('调用API:', apiUrl);
  
  // 确保responseId为数字类型
  const numericResponseId = parseInt(responseId, 10);
  
  try {
    // 使用fetch API发送POST请求，指定响应类型为流式
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response_id: numericResponseId }),
    });

    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      // 如果响应不成功，记录更多信息以便调试
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
    }
    
    return response;
  } catch (error) {
    console.error('API请求异常:', error);
    throw error;
  }
};

// 2024-04-25: 发送消息给LLM，调用chat接口
export const sendSurveyMessage = async (responseId, message) => {
  console.log(`sendSurveyMessage 被调用，Response ID: ${responseId}, 消息: ${message}`);
  
  // 2024-04-27: 使用硬编码的完整URL，确保与curl命令一致
  const apiUrl = `${API_URL}/chat`;
  console.log('调用API:', apiUrl);
  
  // 确保responseId为数字类型
  const numericResponseId = parseInt(responseId, 10);
  
  try {
    // 使用fetch API发送POST请求，指定响应类型为流式
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        response_id: numericResponseId,
        message: message,
      }),
    });

    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      // 如果响应不成功，记录更多信息以便调试
      const errorText = await response.text();
      console.error('API错误响应:', errorText);
    }
    
    return response;
  } catch (error) {
    console.error('API请求异常:', error);
    throw error;
  }
}; 
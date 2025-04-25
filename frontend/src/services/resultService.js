import { supabase } from '../supabaseClient'; // 2024-09-26T11:45:00Z 新增：导入 Supabase 客户端

// 2024-09-26: 获取问卷结果统计数据
export const getSurveyResultStats = async (surveyId) => {
  console.log(`getSurveyResultStats 被调用，Survey ID: ${surveyId}`);
  try {
    // 获取该问卷的所有回答
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .select('id, status, created_at, updated_at, completion_time')
      .eq('survey_id', surveyId);

    if (error) {
      console.error(`获取问卷回答记录失败，Survey ID: ${surveyId}`, error);
      throw new Error(error.message || '获取问卷统计数据失败');
    }

    // 统计数据
    const totalResponses = data.length;
    const completedResponses = data.filter(r => r.status === 'completed').length;
    const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

    // 计算平均完成时间 - 使用所有回答的时间
    let totalSeconds = 0;
    let countWithTime = 0;
    
    // 首先检查有多少条记录有completion_time
    data.forEach(response => {
      if (response.completion_time) {
        countWithTime++;
        
        // 尝试解析时间格式 "19:15:44" (时:分:秒)
        const timeParts = response.completion_time.split(':');
        if (timeParts.length === 3) {
          const hours = parseInt(timeParts[0]) || 0;
          const minutes = parseInt(timeParts[1]) || 0;
          const seconds = parseInt(timeParts[2]) || 0;
          
          // 转换为总秒数
          const totalSecs = hours * 3600 + minutes * 60 + seconds;
          totalSeconds += totalSecs;
          
          console.log(`回答ID ${response.id}: 时间 ${response.completion_time}, 转换为 ${totalSecs} 秒`);
        }
      }
    });
    
    // 如果有时间记录，计算平均值
    let avgMinutes = 0;
    let avgSeconds = 0;
    
    if (countWithTime > 0) {
      const avgTotalSeconds = Math.round(totalSeconds / countWithTime);
      avgMinutes = Math.floor(avgTotalSeconds / 60);
      avgSeconds = avgTotalSeconds % 60;
      
      console.log(`计算平均时间: ${countWithTime}条记录, 总秒数${totalSeconds}, 平均${avgTotalSeconds}秒, 转换为${avgMinutes}分${avgSeconds}秒`);
    }
    
    // 格式化为 "Xm Ys"
    const avgCompletionTime = `${avgMinutes}m ${avgSeconds}s`;

    return {
      totalResponses,
      completionRate,
      avgCompletionTime,
      rawData: data  // 返回原始数据以便前端进一步处理
    };
  } catch (error) {
    console.error(`Error in getSurveyResultStats service for Survey ID ${surveyId}:`, error);
    throw error;
  }
};

// 2024-09-26: 获取问卷回答记录列表
export const getSurveyResponses = async (surveyId) => {
  console.log(`getSurveyResponses 被调用，Survey ID: ${surveyId}`);
  try {
    // 获取所有回答记录，包括Completion Time字段
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .select('id, respondent_identifier, status, created_at, updated_at, completion_time')  // 添加completion_time字段
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });  // 按创建时间倒序排列

    if (error) {
      console.error(`获取问卷回答记录失败，Survey ID: ${surveyId}`, error);
      throw new Error(error.message || '获取问卷回答记录失败');
    }

    // 处理数据，转换为前端需要的格式
    return data.map(response => {
      // 使用数据库中的completion_time字段，如果存在的话
      let completionTime = '';
      if (response.completion_time) {
        // 如果数据库中有completion_time字段，直接使用
        completionTime = response.completion_time;
      } else if (response.status === 'completed' && response.updated_at && response.created_at) {
        // 否则通过计算获取
        const timeMs = new Date(response.updated_at) - new Date(response.created_at);
        const minutes = Math.floor(timeMs / 60000);
        const seconds = Math.floor((timeMs % 60000) / 1000);
        completionTime = `${minutes}m ${seconds}s`;
      }

      // 格式化日期 (如 "May 20, 2025 • 09:47")
      const date = new Date(response.created_at);
      const dateFormatted = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const timeFormatted = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      const formattedDate = `${dateFormatted} • ${timeFormatted}`;

      // 处理状态，确保'completed'状态会被转换为'Completed'
      let displayStatus;
      if (response.status === 'completed') {
        displayStatus = 'Completed';
      } else {
        displayStatus = response.status.charAt(0).toUpperCase() + response.status.slice(1);
      }

      // 组装返回对象
      return {
        id: response.id,
        name: response.respondent_identifier || `Respondent ${response.id}`,
        email: '',  // 数据库中没有存储邮箱，不显示任何内容
        date: formattedDate,
        completionTime: completionTime,
        status: displayStatus
      };
    });
  } catch (error) {
    console.error(`Error in getSurveyResponses service for Survey ID ${surveyId}:`, error);
    throw error;
  }
};

// 2024-09-26: 获取问卷的每个问题完成率
export const getQuestionCompletionRates = async (surveyId) => {
  console.log(`getQuestionCompletionRates 被调用，Survey ID: ${surveyId}`);
  try {
    // 由于目前数据库结构中没有存储问题的完成情况，我们暂时返回空数据
    // 待后续数据库结构完善后再实现此功能
    return {
      questions: [],
      completionRates: []
    };
  } catch (error) {
    console.error(`Error in getQuestionCompletionRates service for Survey ID ${surveyId}:`, error);
    throw error;
  }
};

// 2024-09-26: 获取问卷回答随时间的分布
export const getResponsesOverTime = async (surveyId) => {
  console.log(`getResponsesOverTime 被调用，Survey ID: ${surveyId}`);
  try {
    // 获取该问卷的所有回答
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .select('created_at')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`获取问卷回答时间分布失败，Survey ID: ${surveyId}`, error);
      throw new Error(error.message || '获取问卷回答时间分布失败');
    }

    // 将回答按日期分组统计
    const responsesByDate = {};
    data.forEach(response => {
      const date = new Date(response.created_at);
      const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
      
      if (!responsesByDate[dateString]) {
        responsesByDate[dateString] = 0;
      }
      responsesByDate[dateString]++;
    });

    // 转换为前端需要的格式
    const dates = Object.keys(responsesByDate);
    const counts = Object.values(responsesByDate);

    return {
      dates,
      counts,
      responsesByDate
    };
  } catch (error) {
    console.error(`Error in getResponsesOverTime service for Survey ID ${surveyId}:`, error);
    throw error;
  }
}; 
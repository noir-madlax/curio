import { supabase } from '../supabaseClient'; // 2024-07-29T11:45:00Z 新增：导入 Supabase 客户端

// 定义一个简单的辅助函数来计算相对时间（仅作示例）
// 2024-07-29T10:00:00Z 新增：用于将日期转换为更友好的相对时间字符串
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30); // 简化估算
  const years = Math.round(days / 365); // 简化估算

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

// ==== Survey CRUD 操作 ====

// 2024-07-29T10:00:00Z 新增：获取所有调查问卷数据的异步函数
// 2024-07-29T11:00:00Z 修改：明确此函数目前模拟 API 调用，返回静态数据
// 2024-07-29T11:45:00Z 修改：使用 Supabase 客户端获取数据
export const getAllSurveys = async () => {
  console.log(" سرويس getAllSurveys 被调用"); // 2024-07-29T11:00:00Z 新增：调试日志
  try {
    // 2024-07-29T11:45:00Z 修改：执行 Supabase 查询
    const { data, error } = await supabase
      .from('cu_survey')
      .select('id, title, status, updated_at, SurveyLink') // 2024-08-07T09:30:00Z 修改：增加SurveyLink字段
      .neq('status', 'deleted') // 2024-08-07T17:00:00Z 修改：过滤掉状态为deleted的问卷
      .order('created_at', { ascending: false }); // 2024-07-29T11:45:00Z 新增：按创建时间降序排序

    // 2024-07-29T11:45:00Z 修改：处理 Supabase 返回的错误
    if (error) {
      console.error('Supabase error fetching surveys:', error);
      throw new Error(error.message || 'Failed to fetch surveys from database');
    }

    // 2024-11-03: 获取每个问卷的问题数量
    const { data: questionsData, error: questionsError } = await supabase
      .from('cu_survey_questions')
      .select('survey_id');
      
    if (questionsError) {
      console.error('Supabase error fetching survey questions:', questionsError);
      // 不阻止整个过程，继续处理问卷数据
    }
    
    // 计算每个问卷的问题数量
    const questionCountMap = {};
    if (questionsData) {
      questionsData.forEach(question => {
        const surveyId = question.survey_id;
        if (!questionCountMap[surveyId]) {
          questionCountMap[surveyId] = 0;
        }
        questionCountMap[surveyId]++;
      });
    }

    // 将数据库数据映射到前端需要的格式
    // 2024-07-29T10:00:00Z 新增：数据映射逻辑
    // 2024-07-29T11:45:00Z 修改：确保映射基于实际返回的 data
    const mappedSurveys = data.map(survey => ({
      id: survey.id,
      title: survey.title ? survey.title.trim() : 'Untitled Survey', // 2024-07-29T11:45:00Z 修改：处理可能的 null title 并清理换行符
      status: survey.status ? survey.status.charAt(0).toUpperCase() + survey.status.slice(1) : 'Draft', // 2024-07-29T11:45:00Z 修改：处理可能的 null status 并首字母大写
      updatedAt: survey.updated_at ? `Updated ${timeAgo(survey.updated_at)}` : 'Updated unknown', // 2024-07-29T11:45:00Z 修改：格式化更新时间，处理 null
      responses: 0, // 暂时设为 0，将被更新
      completionRate: 0, // 暂时设为 0，将被更新
      surveyLink: survey.SurveyLink || null, // 2024-08-07T09:30:00Z 新增：返回问卷链接
      questionCount: questionCountMap[survey.id] || 0 // 2024-11-03: 添加问题数量字段
    }));

    // 2024-10-20: 增强功能：为所有问卷获取真实的响应数据和完成率
    // 获取所有问卷的响应记录
    const { data: responsesData, error: responsesError } = await supabase
      .from('cu_survey_responses')
      .select('survey_id, status');
      
    if (responsesError) {
      console.error('Supabase error fetching survey responses:', responsesError);
      // 返回基本问卷数据，不阻止整个过程
      return mappedSurveys;
    }
    
    // 处理响应数据，计算每个问卷的响应数量和完成率
    const surveyStats = {};
    responsesData.forEach(response => {
      const surveyId = response.survey_id;
      if (!surveyStats[surveyId]) {
        surveyStats[surveyId] = { total: 0, completed: 0 };
      }
      surveyStats[surveyId].total++;
      if (response.status === 'completed') {
        surveyStats[surveyId].completed++;
      }
    });
    
    // 更新问卷数据
    return mappedSurveys.map(survey => {
      const stats = surveyStats[survey.id] || { total: 0, completed: 0 };
      const completionRate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
      
      return {
        ...survey,
        responses: stats.total,
        completionRate: completionRate
      };
    });

  } catch (error) {
    console.error('Error in getAllSurveys service:', error);
    // 向上抛出错误，让调用者（useEffect）处理
    throw error; 
  }
};

// 2024-07-29T11:00:00Z 新增：删除指定 ID 调查问卷的函数框架
// 2024-07-29T11:45:00Z 修改：使用 Supabase 客户端删除数据
// 2024-08-07T15:30:00Z 修改：从物理删除改为逻辑删除（标记is_deleted字段）
// 2024-08-07T17:00:00Z 修改：使用status='deleted'而不是is_deleted字段
export const deleteSurvey = async (id) => {
  console.log(` سرويس deleteSurvey 被调用，ID: ${id}`); // 2024-07-29T11:00:00Z 新增：调试日志
  try {
    // 2024-08-07T17:00:00Z 修改：将问卷状态更新为deleted
    const { error } = await supabase
      .from('cu_survey')
      .update({ status: 'deleted' })
      .match({ id: id });

    // 2024-07-29T11:45:00Z 修改：处理 Supabase 返回的错误
    if (error) {
      console.error(`Supabase error deleting survey ${id}:`, error);
      throw new Error(error.message || 'Failed to delete survey from database');
    }
    
    // 2024-07-29T11:45:00Z 新增：返回成功信息
    return { success: true, message: 'Survey deleted successfully' };

  } catch (error) {
    console.error(`Error in deleteSurvey service for ID ${id}:`, error);
    // 向上抛出错误
    throw error;
  }
};

// 2024-07-29T11:00:00Z 新增：创建新调查问卷的函数框架
// 2024-07-29T11:45:00Z 修改：使用 Supabase 客户端创建数据
export const createSurvey = async (surveyData) => {
  console.log(" سرويس createSurvey 被调用，数据:", surveyData); // 2024-07-29T11:00:00Z 新增：调试日志
  try {
    // 2024-07-29T11:45:00Z 修改：准备要插入的数据，确保有 title 和 status
    const newSurveyData = {
      title: surveyData.title || 'New Untitled Survey', // 提供默认标题
      description: surveyData.description || '', // 提供默认描述
      status: 'draft' // 默认状态为 draft
      // user_id 字段可以根据需要在这里添加，如果需要关联用户
      // user_id: (await supabase.auth.getUser()).data.user?.id // 示例：获取当前用户ID
    };

    // 2024-08-06 新增：如果包含SurveyLink，添加到新问卷数据中
    if (surveyData.surveyLink) {
      newSurveyData.SurveyLink = surveyData.surveyLink;
    }
    
    // 2024-05-14 新增：如果包含thanksMessage，添加到新问卷数据中
    if (surveyData.thanksMessage !== undefined) {
      newSurveyData.thanks_message = surveyData.thanksMessage;
    }

    // 2024-07-29T11:45:00Z 修改：执行 Supabase 插入操作，并使用 .select() 获取返回的数据
    const { data, error } = await supabase
      .from('cu_survey')
      .insert([newSurveyData])
      .select(); // 获取插入后的完整行数据

    // 2024-07-29T11:45:00Z 修改：处理 Supabase 返回的错误
    if (error) {
      console.error('Supabase error creating survey:', error);
      throw new Error(error.message || 'Failed to create survey in database');
    }

    // 2024-07-29T11:45:00Z 修改：检查返回的数据并进行格式化
    if (data && data.length > 0) {
       const createdSurvey = data[0];
       // 将新创建的数据格式化为前端需要的格式
       return {
         id: createdSurvey.id,
         title: createdSurvey.title ? createdSurvey.title.trim() : 'Untitled Survey',
         status: createdSurvey.status ? createdSurvey.status.charAt(0).toUpperCase() + createdSurvey.status.slice(1) : 'Draft',
         updatedAt: createdSurvey.updated_at ? `Created ${timeAgo(createdSurvey.created_at)}` : 'Created just now', // 使用创建时间
         responses: 0, // 新问卷响应为 0
         completionRate: 0, // 新问卷完成率为 0
         surveyLink: createdSurvey.SurveyLink || null, // 2024-08-06 新增：返回问卷链接
         thanksMessage: createdSurvey.thanks_message || '', // 2024-05-14: 新增返回感谢信息字段
      };
    } else {
      // 如果没有返回数据（理论上 .select() 应该返回），抛出错误
      throw new Error('Failed to retrieve created survey data.');
    }

  } catch (error) {
    console.error('Error in createSurvey service:', error);
    // 向上抛出错误
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：根据 ID 获取单个问卷的详细信息
export const getSurveyById = async (id) => {
  console.log(`getSurveyById 被调用，ID: ${id}`);
  try {
    const { data, error } = await supabase
      .from('cu_survey')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Supabase error fetching survey ${id}:`, error);
      throw new Error(error.message || 'Failed to fetch survey details');
    }

    return {
      id: data.id,
      title: data.title ? data.title.trim() : 'Untitled Survey',
      description: data.description || '',
      status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Draft',
      updatedAt: data.updated_at ? `Updated ${timeAgo(data.updated_at)}` : 'Updated unknown',
      createdAt: data.created_at || new Date().toISOString(),
      surveyLink: data.SurveyLink || null, // 2024-08-06 新增：返回问卷链接
      thanksMessage: data.thanks_message || '', // 2024-05-14: 新增返回感谢信息字段
    };
  } catch (error) {
    console.error(`Error in getSurveyById service for ID ${id}:`, error);
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：更新现有问卷的函数
export const updateSurvey = async (id, surveyData) => {
  console.log(`updateSurvey 被调用，ID: ${id}，数据:`, surveyData);
  try {
    // 构建要更新的数据对象
    const updateData = {
      title: surveyData.title, 
      description: surveyData.description,
      updated_at: new Date().toISOString()
    };

    // 如果包含状态，则更新状态
    if (surveyData.status) {
      updateData.status = surveyData.status.toLowerCase();
    }

    // 2024-08-06 新增：如果包含SurveyLink，则更新链接
    if (surveyData.surveyLink) {
      updateData.SurveyLink = surveyData.surveyLink;
    }
    
    // 2024-05-14 新增：如果包含thanksMessage，则更新感谢消息
    if (surveyData.thanksMessage !== undefined) {
      updateData.thanks_message = surveyData.thanksMessage;
    }

    const { data, error } = await supabase
      .from('cu_survey')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Supabase error updating survey ${id}:`, error);
      throw new Error(error.message || 'Failed to update survey');
    }

    if (data && data.length > 0) {
      const updatedSurvey = data[0];
      return {
        id: updatedSurvey.id,
        title: updatedSurvey.title ? updatedSurvey.title.trim() : 'Untitled Survey',
        description: updatedSurvey.description || '',
        status: updatedSurvey.status ? updatedSurvey.status.charAt(0).toUpperCase() + updatedSurvey.status.slice(1) : 'Draft',
        updatedAt: `Updated ${timeAgo(updatedSurvey.updated_at)}`,
        surveyLink: updatedSurvey.SurveyLink || null,  // 2024-08-06 新增：返回问卷链接
        thanksMessage: updatedSurvey.thanks_message || '', // 2024-05-14: 新增返回感谢信息字段
      };
    } else {
      throw new Error('Failed to retrieve updated survey data');
    }
  } catch (error) {
    console.error(`Error in updateSurvey service for ID ${id}:`, error);
    throw error;
  }
};

// ==== Question CRUD 操作 ====

// 2024-07-30T10:00:00Z 新增：获取指定问卷的所有问题
export const getQuestionsBySurveyId = async (surveyId) => {
  console.log(`getQuestionsBySurveyId 被调用，Survey ID: ${surveyId}`);
  try {
    const { data, error } = await supabase
      .from('cu_survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('question_order', { ascending: true });

    if (error) {
      console.error(`Supabase error fetching questions for survey ${surveyId}:`, error);
      throw new Error(error.message || 'Failed to fetch survey questions');
    }

    return data.map(question => ({
      id: question.id,
      surveyId: question.survey_id,
      text: question.question_text,
      order: question.question_order,
      type: question.question_type,
      followupCount: question.followup_count || 0,
      objectives: question.question_objectives || '',
      required: question.is_required,
      createdAt: question.created_at,
      updatedAt: question.updated_at
    }));
  } catch (error) {
    console.error(`Error in getQuestionsBySurveyId service for Survey ID ${surveyId}:`, error);
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：创建新问题
export const createQuestion = async (questionData) => {
  console.log(`createQuestion 被调用，数据:`, questionData);
  try {
    // 检查是否提供了必要的 survey_id
    if (!questionData.surveyId) {
      throw new Error('Survey ID is required to create a question');
    }

    // 获取当前问卷的问题数量，用于设置新问题的顺序
    const { count, error: countError } = await supabase
      .from('cu_survey_questions')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', questionData.surveyId);

    if (countError) {
      console.error(`Error counting questions for survey ${questionData.surveyId}:`, countError);
      throw new Error('Failed to determine question order');
    }

    // 准备要插入的问题数据
    const newQuestionData = {
      survey_id: questionData.surveyId,
      question_text: questionData.text || 'New Question',
      question_order: questionData.order || (count + 1), // 如果未指定顺序，默认添加到最后
      question_type: questionData.type || 'text',
      followup_count: questionData.followupCount || 0,
      question_objectives: questionData.objectives || '',
      // 2024-10-05T20:35:00Z 新增：设置is_required字段
      is_required: questionData.required !== undefined ? questionData.required : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 执行插入操作
    const { data, error } = await supabase
      .from('cu_survey_questions')
      .insert([newQuestionData])
      .select();

    if (error) {
      console.error('Supabase error creating question:', error);
      throw new Error(error.message || 'Failed to create question');
    }

    if (data && data.length > 0) {
      const createdQuestion = data[0];
      return {
        id: createdQuestion.id,
        surveyId: createdQuestion.survey_id,
        text: createdQuestion.question_text,
        order: createdQuestion.question_order,
        type: createdQuestion.question_type,
        followupCount: createdQuestion.followup_count || 0,
        objectives: createdQuestion.question_objectives || '',
        // 2024-10-05T20:35:00Z 新增：返回is_required字段
        required: createdQuestion.is_required,
        createdAt: createdQuestion.created_at,
        updatedAt: createdQuestion.updated_at
      };
    } else {
      throw new Error('Failed to retrieve created question data');
    }
  } catch (error) {
    console.error('Error in createQuestion service:', error);
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：更新问题
export const updateQuestion = async (id, questionData) => {
  console.log(`updateQuestion 被调用，ID: ${id}，数据:`, questionData);
  try {
    // 构建要更新的数据
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // 只更新提供的字段
    if (questionData.text !== undefined) updateData.question_text = questionData.text;
    if (questionData.order !== undefined) updateData.question_order = questionData.order;
    if (questionData.type !== undefined) updateData.question_type = questionData.type;
    if (questionData.followupCount !== undefined) updateData.followup_count = questionData.followupCount;
    if (questionData.objectives !== undefined) updateData.question_objectives = questionData.objectives;
    // 2024-10-05T20:40:00Z 新增：更新is_required字段
    if (questionData.required !== undefined) updateData.is_required = questionData.required;

    // 执行更新操作
    const { data, error } = await supabase
      .from('cu_survey_questions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`Supabase error updating question ${id}:`, error);
      throw new Error(error.message || 'Failed to update question');
    }

    if (data && data.length > 0) {
      const updatedQuestion = data[0];
      return {
        id: updatedQuestion.id,
        surveyId: updatedQuestion.survey_id,
        text: updatedQuestion.question_text,
        order: updatedQuestion.question_order,
        type: updatedQuestion.question_type,
        followupCount: updatedQuestion.followup_count || 0,
        objectives: updatedQuestion.question_objectives || '',
        // 2024-10-05T20:40:00Z 新增：返回is_required字段
        required: updatedQuestion.is_required,
        updatedAt: updatedQuestion.updated_at
      };
    } else {
      throw new Error('Failed to retrieve updated question data');
    }
  } catch (error) {
    console.error(`Error in updateQuestion service for ID ${id}:`, error);
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：删除问题
// 2024-10-05T20:45:00Z 修改：重写删除问题函数，解决supabase.raw问题
export const deleteQuestion = async (id) => {
  console.log(`deleteQuestion 被调用，ID: ${id}`);
  try {
    // 先获取问题信息，特别是 survey_id 和 question_order，用于后续处理
    const { data: questionData, error: fetchError } = await supabase
      .from('cu_survey_questions')
      .select('survey_id, question_order')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error(`Error fetching question ${id} before deletion:`, fetchError);
      throw new Error('Failed to fetch question details before deletion');
    }

    // 执行删除操作
    const { error: deleteError } = await supabase
      .from('cu_survey_questions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error(`Supabase error deleting question ${id}:`, deleteError);
      throw new Error(deleteError.message || 'Failed to delete question');
    }

    // 获取所有需要重排序的问题（order大于删除问题的order的所有问题）
    const { data: questionsToReorder, error: fetchReorderError } = await supabase
      .from('cu_survey_questions')
      .select('id, question_order')
      .eq('survey_id', questionData.survey_id)
      .gt('question_order', questionData.question_order)
      .order('question_order', { ascending: true });
    
    if (fetchReorderError) {
      console.error(`Error fetching questions to reorder after deletion of question ${id}:`, fetchReorderError);
      console.warn('Questions were not reordered correctly after deletion');
      return { success: true, message: 'Question deleted successfully, but reordering failed' };
    }
    
    // 逐个更新问题的order
    for (const question of questionsToReorder) {
      const newOrder = question.question_order - 1;
      const { error: updateOrderError } = await supabase
        .from('cu_survey_questions')
        .update({ question_order: newOrder })
        .eq('id', question.id);
      
      if (updateOrderError) {
        console.error(`Error updating order for question ${question.id}:`, updateOrderError);
      }
    }

    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    console.error(`Error in deleteQuestion service for ID ${id}:`, error);
    throw error;
  }
};

// 2024-07-30T10:00:00Z 新增：重新排序问题
export const reorderQuestions = async (surveyId, newOrder) => {
  console.log(`reorderQuestions 被调用，Survey ID: ${surveyId}，新顺序:`, newOrder);
  try {
    // newOrder 应该是一个对象数组，每个对象包含 id 和 newOrder
    // 例如：[{id: 1, newOrder: 3}, {id: 2, newOrder: 1}, {id: 3, newOrder: 2}]
    
    // 为每个问题创建更新操作
    const updates = newOrder.map(item => 
      supabase
        .from('cu_survey_questions')
        .update({ question_order: item.newOrder, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    );
    
    // 使用 Promise.all 并行执行所有更新
    await Promise.all(updates);
    
    return { success: true, message: 'Questions reordered successfully' };
  } catch (error) {
    console.error(`Error in reorderQuestions service for Survey ID ${surveyId}:`, error);
    throw error;
  }
}; 

// 2024-04-25: 聊天相关的服务已移动到单独的chatService.js文件中
// export const startSurveyChat = async (responseId) => { ... }
// export const sendSurveyMessage = async (responseId, message) => { ... }

// 2024-09-24: 创建新的问卷响应记录
// 2024-05-14T15:30:00Z 修改：确保返回的ID是数字类型
// 2024-10-21T12:00:00Z 修改：统一生成匿名标识符，不依赖URL参数
export const createSurveyResponse = async (surveyId, respondentIdentifier = null) => {
  console.log(`【createSurveyResponse】开始创建问卷响应，Survey ID: ${surveyId}`, {
    surveyId: surveyId,
    respondentIdentifier: respondentIdentifier,
    timestamp: new Date().toISOString(),
    caller: new Error().stack.split('\n')[2].trim() // 获取调用堆栈信息
  });
  
  try {
    if (!surveyId) {
      console.error('【createSurveyResponse】调用错误: 缺少surveyId参数');
      throw new Error('Survey ID is required to create a response');
    }
    
    // 确保surveyId是数字类型
    const numericSurveyId = Number(surveyId);
    if (isNaN(numericSurveyId)) {
      throw new Error(`Invalid survey ID: ${surveyId}. Must be a number.`);
    }
    
    // 验证surveyId是否有效
    try {
      console.log(`【createSurveyResponse】验证问卷ID: ${numericSurveyId}`);
      const { data: surveyExists, error: surveyError } = await supabase
        .from('cu_survey')
        .select('id')
        .eq('id', numericSurveyId)
        .single();
        
      if (surveyError) {
        console.error(`【createSurveyResponse】验证问卷ID时出错:`, surveyError);
        throw new Error(`Failed to validate survey ID: ${surveyError.message}`);
      }
      
      if (!surveyExists) {
        console.error(`【createSurveyResponse】无效的问卷ID: ${numericSurveyId}`);
        throw new Error(`Survey with ID ${numericSurveyId} does not exist`);
      }
      
      console.log(`【createSurveyResponse】问卷ID验证通过: ${numericSurveyId}`);
    } catch (validationError) {
      console.error(`【createSurveyResponse】问卷验证失败:`, validationError);
      throw validationError;
    }
    
    // 生成一个新的匿名标识符，不使用URL参数
    const anonymousId = `anonymous_${Date.now()}`;
    
    // 检查是否已经有进行中的响应记录（通过浏览器存储的ID）
    if (respondentIdentifier && respondentIdentifier.startsWith('anonymous_')) {
      console.log(`【createSurveyResponse】检查现有响应记录，标识符: ${respondentIdentifier}`);
      const { data: existingResponse, error: checkError } = await supabase
        .from('cu_survey_responses')
        .select('id, status, respondent_identifier')
        .eq('survey_id', numericSurveyId)
        .eq('respondent_identifier', respondentIdentifier)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (checkError) {
        console.error('【createSurveyResponse】检查现有记录时出错:', checkError);
      } else if (existingResponse && existingResponse.length > 0) {
        console.log(`【createSurveyResponse】发现已存在的响应记录，ID: ${existingResponse[0].id}`);
        
        // 如果记录已存在且状态不是已完成，则返回现有记录
        if (existingResponse[0].status !== 'completed') {
          return {
            id: Number(existingResponse[0].id),
            status: existingResponse[0].status,
            survey_id: numericSurveyId,
            respondent_identifier: existingResponse[0].respondent_identifier,
            created_at: existingResponse[0].created_at
          };
        }
      }
    }
    
    // 准备要插入的数据 - 始终使用服务端生成的匿名标识符
    const newResponseData = {
      survey_id: numericSurveyId,
      status: 'pending', // 默认状态为 pending
      respondent_identifier: anonymousId
    };

    console.log('【createSurveyResponse】准备插入数据:', newResponseData);
    
    // 执行 Supabase 插入操作
    console.log(`【createSurveyResponse】开始插入数据到数据库...`);
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .insert([newResponseData])
      .select();

    // 处理错误
    if (error) {
      console.error('【createSurveyResponse】数据库插入错误:', error);
      throw new Error(`Failed to create survey response: ${error.message}`);
    }
    
    // 检查返回的数据
    if (!data || data.length === 0) {
      console.error('【createSurveyResponse】数据库返回空数据');
      throw new Error('Failed to create survey response: No data returned');
    }
    
    const responseRecord = data[0];
    const responseId = Number(responseRecord.id); // 确保ID是数字类型
    
    console.log(`【createSurveyResponse】成功创建响应记录! ID: ${responseId}`);
    
    return {
      id: responseId,
      status: responseRecord.status,
      survey_id: responseRecord.survey_id,
      respondent_identifier: responseRecord.respondent_identifier,
      created_at: responseRecord.created_at
    };
    
  } catch (error) {
    console.error('【createSurveyResponse】处理过程中发生错误:', error);
    throw error; // 将错误传递给调用者
  }
};

// 2024-09-24: 根据ID获取问卷响应记录
// 2024-05-14T15:45:00Z 修改：确保responseId是数字类型
export const getSurveyResponseById = async (responseId) => {
  console.log(`getSurveyResponseById 被调用，Response ID: ${responseId}`);
  try {
    // 确保responseId是数字类型
    const numericResponseId = Number(responseId);
    if (isNaN(numericResponseId)) {
      throw new Error(`Invalid response ID: ${responseId}. Must be a number.`);
    }
    
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .select('*')
      .eq('id', numericResponseId)
      .single();

    if (error) {
      console.error(`Supabase error fetching survey response ${numericResponseId}:`, error);
      throw new Error(error.message || '获取问卷响应记录失败');
    }

    return data;
  } catch (error) {
    console.error(`Error in getSurveyResponseById service for ID ${responseId}:`, error);
    throw error;
  }
};

// 2024-09-25: 获取调查问卷响应的对话历史
export const getSurveyResponseConversations = async (responseId) => {
  console.log(`getSurveyResponseConversations 被调用，Response ID: ${responseId}`);
  try {
    const { data, error } = await supabase
      .from('cu_survey_response_conversations')
      .select('id, survey_response_id, speaker_type, message_text, conversation_order, created_at')
      .eq('survey_response_id', responseId)
      .order('conversation_order', { ascending: true });

    if (error) {
      console.error(`Supabase error fetching conversations for response ${responseId}:`, error);
      throw new Error(error.message || '获取对话历史记录失败');
    }

    console.log(`从数据库获取到 ${data?.length || 0} 条对话记录`);
    return data || [];
  } catch (error) {
    console.error(`Error in getSurveyResponseConversations service for ID ${responseId}:`, error);
    throw error;
  }
};

// 2024-09-26: 注意：与问卷结果相关的功能已移至 resultService.js
// - getSurveyResultStats
// - getSurveyResponses 
// - getQuestionCompletionRates
// - getResponsesOverTime

// 2024-08-15T19:00:00Z 新增：提交传统问卷回答（不使用聊天模式）
// 2023-10-31T10:00:00Z 修改：修复问卷响应提交问题，添加日志输出
// 2024-10-14T16:00:00Z 修改：修复response_mode字段缺失的问题
// 2024-10-14T18:00:00Z 修改：移除completed_at字段，数据库中不存在该字段
// 2024-05-10T14:30:00Z 修改：修复表名错误和参数处理问题
// 2024-05-14T15:00:00Z 修改：确保responseId是数字类型
// 2024-10-20T15:30:00Z 修改：确保单选题和多选题使用一致的数组格式保存
// 2024-10-20T17:45:00Z 修改：添加completion_time计算和更新
export const submitSurveyResponse = async (responseId, responseData) => {
  console.log(`submitSurveyResponse 被调用，Response ID: ${responseId}，数据:`, responseData);
  try {
    // 确保responseId存在
    if (!responseId) {
      throw new Error('Response ID is required');
    }

    // 确保responseId是数字类型
    const numericResponseId = Number(responseId);
    if (isNaN(numericResponseId)) {
      throw new Error(`Invalid response ID: ${responseId}. Must be a number.`);
    }
    
    // 首先获取当前响应记录以获取创建时间
    console.log(`获取响应记录，Response ID: ${numericResponseId}`);
    const { data: responseRecord, error: recordError } = await supabase
      .from('cu_survey_responses')
      .select('id, created_at')
      .eq('id', numericResponseId)
      .single();
      
    if (recordError) {
      console.error(`获取响应记录失败，Response ID: ${numericResponseId}`, recordError);
      throw new Error(`Failed to get response record: ${recordError.message}`);
    }
    
    if (!responseRecord) {
      console.error(`响应记录不存在，Response ID: ${numericResponseId}`);
      throw new Error(`Response record with ID ${numericResponseId} does not exist`);
    }
    
    // 计算完成时间
    const createdAt = new Date(responseRecord.created_at);
    const completedAt = new Date();
    const diffMs = completedAt - createdAt; // 毫秒差
    
    // 转换为时:分:秒格式
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    // 格式化为 "HH:MM:SS"
    const completionTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    console.log(`计算完成时间: ${completionTime}，从 ${createdAt.toISOString()} 到 ${completedAt.toISOString()}`);
    
    // 如果直接传入了answers而不是嵌套在responseData.answers中，进行兼容处理
    const answers = responseData.answers || responseData;
    
    // 确保answers存在
    if (!answers) {
      throw new Error('Response answers are required');
    }
    
    // 将answers转换为数组格式
    const answersArray = Object.entries(answers).map(([questionId, value]) => {
      console.log(`处理问题 ${questionId} 的答案:`, value);
      
      let answerText = '';
      
      // 根据不同类型的答案进行格式化
      if (Array.isArray(value)) {
        // 多选题
        answerText = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        // 布尔题
        answerText = value ? 'true' : 'false';
      } else if (typeof value === 'number') {
        // NPS评分题
        answerText = value.toString();
      } else {
        // 文本题或单选题
        // 2024-10-20: 修改单选题处理方式，保持与多选题一致的数组格式
        if (value && typeof value === 'string' && value.trim() !== '') {
          // 如果是单选题，将答案包装为数组形式保存，确保格式一致性
          answerText = JSON.stringify([value]);
        } else {
          // 如果是文本题或空值，保持字符串格式
          answerText = String(value);
        }
      }
      
      return {
        response_id: numericResponseId,
        question_id: questionId,
        text_answer: answerText
      };
    });
    
    console.log(`准备保存 ${answersArray.length} 个问题答案`, answersArray);
    
    // 首先更新问卷响应状态为completed，并设置完成时间
    const { error: updateError } = await supabase
      .from('cu_survey_responses')
      .update({ 
        status: 'completed',
        completion_time: completionTime,
        updated_at: completedAt.toISOString()
      })
      .eq('id', numericResponseId);
      
    if (updateError) {
      console.error(`Error updating survey response status ${numericResponseId}:`, updateError);
      throw new Error(updateError.message || 'Failed to update survey response status');
    }

    // 保存问题答案到正确的表中
    const { error: answersError } = await supabase
      .from('cu_survey_answers')
      .insert(answersArray);

    if (answersError) {
      console.error(`Error saving question answers for response ${numericResponseId}:`, answersError);
      throw new Error(answersError.message || 'Failed to save question answers');
    }

    console.log(`问卷回答成功提交，响应ID: ${numericResponseId}，完成时间: ${completionTime}`);
    return {
      success: true,
      responseId: numericResponseId,
      message: 'Survey response submitted successfully',
      completionTime: completionTime
    };
  } catch (error) {
    console.error(`Error in submitSurveyResponse service for response ${responseId}:`, error);
    throw error;
  }
};

// ===== 问题选项管理 =====
// 2024-09-27T15:00:00Z 新增：问题选项相关服务函数

// 获取问题的所有选项
export const getQuestionOptions = async (questionId) => {
  console.log(`getQuestionOptions 被调用，Question ID: ${questionId}`);
  try {
    const { data, error } = await supabase
      .from('cu_survey_question_options')
      .select('*')
      .eq('question_id', questionId)
      .order('option_order', { ascending: true });

    if (error) {
      console.error(`获取问题选项失败，Question ID: ${questionId}`, error);
      throw new Error(error.message || '获取问题选项失败');
    }

    return data.map(option => ({
      id: option.id,
      questionId: option.question_id,
      text: option.option_text,
      order: option.option_order,
      value: option.option_text, // 使用text作为value
      createdAt: option.created_at,
      updatedAt: option.updated_at
    }));
  } catch (error) {
    console.error(`Error in getQuestionOptions service for Question ID ${questionId}:`, error);
    throw error;
  }
};

// 创建问题选项
export const createQuestionOption = async (questionId, optionData) => {
  console.log(`createQuestionOption 被调用，Question ID: ${questionId}，数据:`, optionData);
  try {
    // 获取当前问题的选项数量，用于设置新选项的顺序
    const { count, error: countError } = await supabase
      .from('cu_survey_question_options')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId);

    if (countError) {
      console.error(`Error counting options for question ${questionId}:`, countError);
      throw new Error('Failed to determine option order');
    }

    // 准备要插入的选项数据
    const newOptionData = {
      question_id: questionId,
      option_text: optionData.text || 'New Option',
      option_order: optionData.order || (count + 1), // 如果未指定顺序，默认添加到最后
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 执行插入操作
    const { data, error } = await supabase
      .from('cu_survey_question_options')
      .insert([newOptionData])
      .select();

    if (error) {
      console.error('Supabase error creating option:', error);
      throw new Error(error.message || 'Failed to create option');
    }

    if (data && data.length > 0) {
      const createdOption = data[0];
      return {
        id: createdOption.id,
        questionId: createdOption.question_id,
        text: createdOption.option_text,
        order: createdOption.option_order,
        createdAt: createdOption.created_at,
        updatedAt: createdOption.updated_at
      };
    } else {
      throw new Error('Failed to retrieve created option data');
    }
  } catch (error) {
    console.error(`Error in createQuestionOption service for Question ID ${questionId}:`, error);
    throw error;
  }
};

// 更新问题选项
export const updateQuestionOption = async (optionId, optionData) => {
  console.log(`updateQuestionOption 被调用，Option ID: ${optionId}，数据:`, optionData);
  try {
    // 构建要更新的数据
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // 只更新提供的字段
    if (optionData.text !== undefined) updateData.option_text = optionData.text;
    if (optionData.order !== undefined) updateData.option_order = optionData.order;

    // 执行更新操作
    const { data, error } = await supabase
      .from('cu_survey_question_options')
      .update(updateData)
      .eq('id', optionId)
      .select();

    if (error) {
      console.error(`Supabase error updating option ${optionId}:`, error);
      throw new Error(error.message || 'Failed to update option');
    }

    if (data && data.length > 0) {
      const updatedOption = data[0];
      return {
        id: updatedOption.id,
        questionId: updatedOption.question_id,
        text: updatedOption.option_text,
        order: updatedOption.option_order,
        updatedAt: updatedOption.updated_at
      };
    } else {
      throw new Error('Failed to retrieve updated option data');
    }
  } catch (error) {
    console.error(`Error in updateQuestionOption service for Option ID ${optionId}:`, error);
    throw error;
  }
};

// 删除问题选项
// 2024-10-05T20:50:00Z 修改：重写删除选项函数，解决supabase.raw问题
export const deleteQuestionOption = async (optionId) => {
  console.log(`deleteQuestionOption 被调用，Option ID: ${optionId}`);
  try {
    // 先获取选项信息，特别是 question_id 和 option_order，用于后续处理
    const { data: optionData, error: fetchError } = await supabase
      .from('cu_survey_question_options')
      .select('question_id, option_order')
      .eq('id', optionId)
      .single();

    if (fetchError) {
      console.error(`Error fetching option ${optionId} before deletion:`, fetchError);
      throw new Error('Failed to fetch option details before deletion');
    }

    // 执行删除操作
    const { error: deleteError } = await supabase
      .from('cu_survey_question_options')
      .delete()
      .eq('id', optionId);

    if (deleteError) {
      console.error(`Supabase error deleting option ${optionId}:`, deleteError);
      throw new Error(deleteError.message || 'Failed to delete option');
    }

    // 获取所有需要重排序的选项
    const { data: optionsToReorder, error: fetchReorderError } = await supabase
      .from('cu_survey_question_options')
      .select('id, option_order')
      .eq('question_id', optionData.question_id)
      .gt('option_order', optionData.option_order)
      .order('option_order', { ascending: true });
    
    if (fetchReorderError) {
      console.error(`Error fetching options to reorder after deletion of option ${optionId}:`, fetchReorderError);
      console.warn('Options were not reordered correctly after deletion');
      return { success: true, message: 'Option deleted successfully, but reordering failed' };
    }
    
    // 逐个更新选项的order
    for (const option of optionsToReorder) {
      const newOrder = option.option_order - 1;
      const { error: updateOrderError } = await supabase
        .from('cu_survey_question_options')
        .update({ option_order: newOrder })
        .eq('id', option.id);
      
      if (updateOrderError) {
        console.error(`Error updating order for option ${option.id}:`, updateOrderError);
      }
    }

    return { success: true, message: 'Option deleted successfully' };
  } catch (error) {
    console.error(`Error in deleteQuestionOption service for Option ID ${optionId}:`, error);
    throw error;
  }
};

// 重新排序问题选项
export const reorderQuestionOptions = async (questionId, newOrder) => {
  console.log(`reorderQuestionOptions 被调用，Question ID: ${questionId}，新顺序:`, newOrder);
  try {
    // newOrder 应该是一个对象数组，每个对象包含 id 和 newOrder
    // 例如：[{id: 1, newOrder: 3}, {id: 2, newOrder: 1}, {id: 3, newOrder: 2}]
    
    // 为每个选项创建更新操作
    const updates = newOrder.map(item => 
      supabase
        .from('cu_survey_question_options')
        .update({ option_order: item.newOrder, updated_at: new Date().toISOString() })
        .eq('id', item.id)
    );
    
    // 使用 Promise.all 并行执行所有更新
    await Promise.all(updates);
    
    return { success: true, message: 'Options reordered successfully' };
  } catch (error) {
    console.error(`Error in reorderQuestionOptions service for Question ID ${questionId}:`, error);
    throw error;
  }
};

// 批量创建问题选项
export const createMultipleQuestionOptions = async (questionId, optionsData) => {
  console.log(`createMultipleQuestionOptions 被调用，Question ID: ${questionId}，选项数量:`, optionsData.length);
  try {
    if (!optionsData || optionsData.length === 0) {
      return { success: true, message: 'No options to create', options: [] };
    }

    // 准备要插入的选项数据
    const newOptionsData = optionsData.map((option, index) => ({
      question_id: questionId,
      option_text: option.text || `Option ${index + 1}`,
      option_order: option.order || (index + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 执行批量插入操作
    const { data, error } = await supabase
      .from('cu_survey_question_options')
      .insert(newOptionsData)
      .select();

    if (error) {
      console.error('Supabase error creating multiple options:', error);
      throw new Error(error.message || 'Failed to create options');
    }

    if (data && data.length > 0) {
      const createdOptions = data.map(option => ({
        id: option.id,
        questionId: option.question_id,
        text: option.option_text,
        order: option.option_order,
        value: option.option_text,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      }));
      
      return { 
        success: true, 
        message: `Successfully created ${data.length} options`,
        options: createdOptions 
      };
    } else {
      throw new Error('Failed to retrieve created options data');
    }
  } catch (error) {
    console.error(`Error in createMultipleQuestionOptions service for Question ID ${questionId}:`, error);
    throw error;
  }
};
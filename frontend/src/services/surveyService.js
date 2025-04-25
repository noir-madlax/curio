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

    // 将数据库数据映射到前端需要的格式
    // 2024-07-29T10:00:00Z 新增：数据映射逻辑
    // 2024-07-29T11:45:00Z 修改：确保映射基于实际返回的 data
    return data.map(survey => ({
      id: survey.id,
      title: survey.title ? survey.title.trim() : 'Untitled Survey', // 2024-07-29T11:45:00Z 修改：处理可能的 null title 并清理换行符
      status: survey.status ? survey.status.charAt(0).toUpperCase() + survey.status.slice(1) : 'Draft', // 2024-07-29T11:45:00Z 修改：处理可能的 null status 并首字母大写
      updatedAt: survey.updated_at ? `Updated ${timeAgo(survey.updated_at)}` : 'Updated unknown', // 2024-07-29T11:45:00Z 修改：格式化更新时间，处理 null
      responses: 0, // 暂时设为 0
      completionRate: 0, // 暂时设为 0
      surveyLink: survey.SurveyLink || null, // 2024-08-07T09:30:00Z 新增：返回问卷链接
    }));

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

    // 重新排序剩余问题 - 找到所有在这个问题之后的问题，并将它们的顺序减1
    const { error: reorderError } = await supabase
      .from('cu_survey_questions')
      .update({ question_order: supabase.raw('question_order - 1') })
      .eq('survey_id', questionData.survey_id)
      .gt('question_order', questionData.question_order);

    if (reorderError) {
      console.error(`Error reordering questions after deletion of question ${id}:`, reorderError);
      // 不抛出异常，因为问题已经成功删除，只是后续排序出现问题
      console.warn('Questions were not reordered correctly after deletion');
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
export const createSurveyResponse = async (surveyId, respondentIdentifier = null) => {
  console.log(`createSurveyResponse 被调用，Survey ID: ${surveyId}`);
  try {
    // 准备要插入的数据
    const newResponseData = {
      survey_id: surveyId,
      status: 'pending', // 默认状态为 pending
      respondent_identifier: respondentIdentifier || `anonymous_${Date.now()}` // 如果没有提供标识符，创建一个匿名标识符
    };

    // 执行 Supabase 插入操作
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .insert([newResponseData])
      .select(); // 获取插入后的完整行数据

    if (error) {
      console.error('Supabase error creating survey response:', error);
      throw new Error(error.message || '创建问卷响应记录失败');
    }

    if (data && data.length > 0) {
      return data[0]; // 返回创建的响应记录
    } else {
      throw new Error('无法获取创建的问卷响应数据');
    }

  } catch (error) {
    console.error('Error in createSurveyResponse service:', error);
    throw error;
  }
};

// 2024-09-24: 根据ID获取问卷响应记录
export const getSurveyResponseById = async (responseId) => {
  console.log(`getSurveyResponseById 被调用，Response ID: ${responseId}`);
  try {
    const { data, error } = await supabase
      .from('cu_survey_responses')
      .select('*')
      .eq('id', responseId)
      .single();

    if (error) {
      console.error(`Supabase error fetching survey response ${responseId}:`, error);
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
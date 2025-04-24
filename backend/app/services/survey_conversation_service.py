"""
问卷对话服务
负责处理问卷调研对话交互，使用LLM进行问题询问和回答处理
"""

import json
import logging
from typing import Dict, List, Any, Optional, AsyncGenerator, Union, Tuple
from datetime import datetime, timezone
from ..database.dao import (
    SurveyDAO,
    SurveyQuestionDAO,
    SurveyResponseDAO,
    SurveyResponseConversationDAO
)
from ..database.schemas import (
    SurveyResponseConversation, 
    SurveyResponseConversationCreate
)
from .llm_service import LLMFactory, LLMProvider

# 配置日志
logger = logging.getLogger(__name__)


def create_iso_timestamp() -> str:
    """创建标准格式的ISO时间戳"""
    # 使用UTC时区并确保微秒格式正确
    dt = datetime.now(timezone.utc)
    # 格式化为6位微秒的ISO格式
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "+00:00"


class SurveyConversationService:
    """问卷对话服务类"""
    
    def __init__(self, llm_provider: Optional[LLMProvider] = None):
        """
        初始化问卷对话服务
        
        Args:
            llm_provider: LLM提供商实例，如果不提供则创建默认实例
        """
        self.llm_provider = llm_provider or LLMFactory.create_provider()
        logger.info(f"初始化SurveyConversationService，使用LLM提供商: {type(self.llm_provider).__name__}")
    
    async def get_survey_id_from_response(self, response_id: int) -> Optional[int]:
        """
        根据回答ID获取问卷ID
        
        Args:
            response_id: 回答ID
            
        Returns:
            问卷ID，如果不存在则返回None
        """
        logger.info(f"正在查询response_id={response_id}对应的survey_id")
        # 获取回答信息
        response = await SurveyResponseDAO.get_by_id(response_id)
        if not response:
            logger.warning(f"找不到response_id={response_id}的记录")
            return None
        
        logger.info(f"response_id={response_id}对应的survey_id={response.survey_id}")
        return response.survey_id
    
    async def get_survey_questions(self, survey_id: int) -> List[Dict[str, Any]]:
        """
        获取问卷问题列表
        
        Args:
            survey_id: 问卷ID
            
        Returns:
            问题列表
        """
        logger.info(f"正在获取survey_id={survey_id}的问题列表")
        # 获取问题列表
        questions = await SurveyQuestionDAO.get_by_survey_id(survey_id)
        
        # 转换为字典列表
        result = [q.dict() for q in questions]
        logger.info(f"成功获取到{len(result)}个问题")
        
        # 打印详细的问题列表
        for i, q in enumerate(result):
            logger.info(f"问题[{i+1}]: {q.get('question_text', '无文本')} (ID: {q.get('id')}, 类型: {q.get('question_type')})")
        
        return result
    
    async def get_conversation_history(self, response_id: int) -> List[Dict[str, str]]:
        """
        获取对话历史记录
        
        Args:
            response_id: 回答ID
            
        Returns:
            对话历史记录列表
        """
        logger.info(f"正在获取response_id={response_id}的对话历史")
        # 获取历史对话
        conversations = await SurveyResponseConversationDAO.get_by_response_id(response_id)
        
        # 转换为LLM所需的对话历史格式
        history = []
        for conv in conversations:
            role = "user" if conv.speaker_type == "user" else "assistant"
            history.append({
                "role": role,
                "content": conv.message_text
            })
        
        logger.info(f"成功获取到{len(history)}条历史对话")
        
        # 打印详细的对话历史
        for i, msg in enumerate(history):
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            content_preview = content[:100] + "..." if len(content) > 100 else content
            logger.info(f"对话历史[{i}] - {role}: {content_preview}")
        
        return history
    
    def _build_prompt(self, questions: List[Dict[str, Any]]) -> str:
        """
        构建提示词
        
        Args:
            questions: 问题列表
            
        Returns:
            完整提示词
        """
        logger.info("开始构建提示词")
        # 拼接问题文本
        questions_text = "\n".join([
            f"{i+1}. {q['question_text']}" 
            for i, q in enumerate(questions)
        ])
        
        # 构建提示词模板
        prompt_template = f"""
你是一位友好、专业的调查问卷机器人。你的任务是按顺序向用户提问问卷中的问题，并收集他们的回答。遵循以下规则：

1. 一次只提一个问题，等待用户回答后再继续下一个问题。
2. 如果用户的回答含糊不清或不完整，可以礼貌地要求他们提供更详细的信息。
3. 如果用户提出题外问题，礼貌地将他们引导回当前问题。
4. 不要修改问卷中的问题内容。
5. 对用户的回答应给予适当的确认，然后再提出下一个问题。
6. 使用自然、对话式的语言，避免机械式回应。
7. 问卷结束后，感谢用户的参与，并告诉他们调查已完成。

问卷问题列表：
{questions_text}

继续进行调查问卷对话。
        """
        
        logger.debug(f"构建的提示词长度: {len(prompt_template)}")
        # 打印前50个字符作为预览
        preview = prompt_template[:200] + "..." if len(prompt_template) > 200 else prompt_template
        logger.debug(f"提示词预览: {preview}")
        return prompt_template
    
    async def save_conversation(self, response_id: int, speaker_type: str, message: str) -> SurveyResponseConversation:
        """
        保存对话消息
        
        Args:
            response_id: 回答ID
            speaker_type: 发言者类型
            message: 消息内容
            
        Returns:
            保存的对话记录
        """
        logger.info(f"保存对话消息: response_id={response_id}, speaker_type={speaker_type}, 消息长度={len(message)}")
        # 获取现有对话，确定顺序
        existing_conversations = await SurveyResponseConversationDAO.get_by_response_id(response_id)
        conversation_order = len(existing_conversations) + 1
        
        try:
            # 创建对话记录
            conversation_data = SurveyResponseConversationCreate(
                survey_response_id=response_id,
                speaker_type=speaker_type,
                message_text=message,
                conversation_order=conversation_order
            )
            
            # 保存到数据库
            result = await SurveyResponseConversationDAO.create(conversation_data)
            logger.info(f"对话消息已保存: id={result.id}, order={result.conversation_order}")
            return result
        
        except Exception as e:
            logger.error(f"保存对话消息失败: {str(e)}")
            # 重试一次，但使用标准格式的时间戳
            try:
                logger.info("使用标准时间格式重试保存")
                # 手动创建数据字典
                data = {
                    'survey_response_id': response_id,
                    'speaker_type': speaker_type,
                    'message_text': message,
                    'conversation_order': conversation_order,
                    'created_at': create_iso_timestamp(),
                    'updated_at': create_iso_timestamp()
                }
                
                # 直接使用DAO插入
                from ..database.config import get_supabase
                client = get_supabase()
                response = client.table('cu_survey_response_conversations').insert(data).execute()
                
                if response.data:
                    logger.info(f"重试保存成功，id={response.data[0]['id']}")
                    # 使用DAO的格式化函数处理结果
                    from ..database.dao.utils import format_timestamp
                    return SurveyResponseConversation(**format_timestamp(response.data[0]))
                else:
                    logger.error("重试保存失败，无响应数据")
                    raise ValueError("无法保存对话记录")
            except Exception as retry_error:
                logger.error(f"重试保存也失败: {str(retry_error)}")
                # 创建一个基本的本地对象作为返回值
                return SurveyResponseConversation(
                    id=-1,  # 使用-1表示这是一个本地对象
                    survey_response_id=response_id,
                    speaker_type=speaker_type,
                    message_text=message,
                    conversation_order=conversation_order,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
    
    def log_conversation_context(self, response_id: int, survey_id: int, questions: List[Dict[str, Any]], history: List[Dict[str, str]], prompt: str, user_message: str = "") -> None:
        """
        记录对话上下文的完整信息
        
        Args:
            response_id: 回答ID
            survey_id: 问卷ID
            questions: 问题列表
            history: 对话历史
            prompt: 提示词
            user_message: 用户消息
        """
        logger.info("================== 对话上下文详细信息 ==================")
        logger.info(f"response_id: {response_id}, survey_id: {survey_id}")
        logger.info(f"问题数量: {len(questions)}")
        logger.info(f"对话历史数量: {len(history)}")
        logger.info(f"当前用户消息: {user_message if user_message else '无(首次对话)'}")
        logger.info(f"提示词长度: {len(prompt)} 字符")
        
        # 输出完整问题列表和提示词到日志文件
        try:
            # 创建完整的上下文数据
            context_data = {
                "metadata": {
                    "timestamp": datetime.now().isoformat(),
                    "response_id": response_id,
                    "survey_id": survey_id
                },
                "questions": questions,
                "history": history,
                "user_message": user_message,
                "prompt": prompt
            }
            
            # 转换为JSON字符串并记录
            context_json = json.dumps(context_data, ensure_ascii=False, indent=2)
            logger.info(f"完整对话上下文JSON:\n{context_json}")
        except Exception as e:
            logger.error(f"记录上下文JSON失败: {str(e)}")
            # 仍然单独记录最重要的信息
            logger.info(f"完整提示词:\n{prompt}")
        
        logger.info("=====================================================")
    
    async def process_conversation(self, response_id: int, user_message: str = "") -> AsyncGenerator[str, None]:
        """
        处理调查问卷对话，生成LLM响应流
        
        Args:
            response_id: 回答ID
            user_message: 用户消息
            
        Returns:
            LLM响应流
        """
        logger.info(f"开始处理对话: response_id={response_id}, 用户消息长度={len(user_message) if user_message else 0}")
        
        # 获取验证结果，如果失败则返回错误消息
        validation_result = await self._validate_response_id(response_id)
        if isinstance(validation_result, str):
            yield validation_result
            return
            
        survey_id, response = validation_result
        
        # 如果有用户消息，先保存用户消息
        if user_message:
            logger.info("保存用户消息")
            await self.save_conversation(response_id, "user", user_message)
        
        # 处理通用的对话逻辑
        async for text_chunk in self._process_conversation_common(
            response_id=response_id,
            survey_id=survey_id
        ):
            yield text_chunk

    async def process_first_conversation(self, response_id: int) -> AsyncGenerator[str, None]:
        """
        处理首次调查问卷对话，确保第一条消息是用户角色
        
        Args:
            response_id: 回答ID
            
        Returns:
            LLM响应流
        """
        logger.info(f"开始处理首次对话: response_id={response_id}")
        
        # 获取验证结果，如果失败则返回错误消息
        validation_result = await self._validate_response_id(response_id)
        if isinstance(validation_result, str):
            yield validation_result
            return
            
        survey_id, response = validation_result
        
        # 检查是否已有对话历史
        existing_conversations = await SurveyResponseConversationDAO.get_by_response_id(response_id)
        if existing_conversations:
            logger.warning(f"该回答已有{len(existing_conversations)}条对话历史，非首次对话")
            # 复用普通对话处理逻辑
            async for text_chunk in self.process_conversation(response_id, ""):
                yield text_chunk
            return
        
        # 处理通用的对话逻辑
        async for text_chunk in self._process_conversation_common(
            response_id=response_id,
            survey_id=survey_id
        ):
            yield text_chunk
            
    async def _validate_response_id(self, response_id: int) -> Union[Tuple[int, Any], str]:
        """
        验证回答ID并获取相关信息
        
        Args:
            response_id: 回答ID
            
        Returns:
            成功时返回(survey_id, response)元组，失败时返回错误消息
        """
        # 验证response_id存在
        response = await SurveyResponseDAO.get_by_id(response_id)
        if not response:
            logger.error(f"无效的回答ID: {response_id}")
            return "错误: 无效的回答ID"
        
        # 获取问卷ID
        survey_id = await self.get_survey_id_from_response(response_id)
        if not survey_id:
            logger.error(f"找不到对应的问卷，response_id={response_id}")
            return "错误: 找不到对应的问卷"
            
        return (survey_id, response)
            
    async def _process_conversation_common(
        self, 
        response_id: int, 
        survey_id: int
    ) -> AsyncGenerator[str, None]:
        """
        处理对话的通用逻辑
        
        Args:
            response_id: 回答ID
            survey_id: 问卷ID
        Returns:
            LLM响应流
        """
        # 获取问题列表
        questions = await self.get_survey_questions(survey_id)
        logger.info(f"获取到{len(questions)}个问题")
        
        # 获取对话历史
        conversation_history = await self.get_conversation_history(response_id)
        
        # 构建提示词
        prompt = self._build_prompt(questions)
        
        # 记录完整上下文信息
        self.log_conversation_context(
            response_id=response_id,
            survey_id=survey_id,
            questions=questions,
            history=conversation_history,
            prompt=prompt
        )
        
        # 调用LLM生成响应
        logger.info("开始调用LLM生成响应")
        response_text = ""
        chunk_count = 0
        
        try:
            async for text_chunk in self.llm_provider.generate_stream(prompt, conversation_history):
                chunk_count += 1
                response_text += text_chunk
                if chunk_count % 10 == 0:  # 每10个片段记录一次日志
                    logger.debug(f"已接收{chunk_count}个文本片段，当前总长度={len(response_text)}")
                yield text_chunk
            
            logger.info(f"LLM响应完成，共{chunk_count}个文本片段，总长度={len(response_text)}")
            
            # 保存LLM响应
            logger.info("保存LLM响应")
            await self.save_conversation(response_id, "assistant", response_text)
            
        except Exception as e:
            error_msg = f"生成LLM响应出错: {str(e)}"
            logger.error(error_msg)
            yield f"[错误] {error_msg}"
            # 尝试保存错误信息到对话历史
            try:
                await self.save_conversation(response_id, "assistant", f"[系统] 生成回答时出错: {str(e)}")
            except Exception as save_error:
                logger.error(f"保存错误信息也失败: {str(save_error)}") 
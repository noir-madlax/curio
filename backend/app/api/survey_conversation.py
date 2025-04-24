"""
问卷对话API路由
提供问卷对话相关的HTTP接口，支持SSE流式响应
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body, Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from ..services.survey_conversation_service import SurveyConversationService
from ..database.dao import SurveyResponseDAO

# 配置日志
logger = logging.getLogger(__name__)

router = APIRouter()
survey_conversation_service = SurveyConversationService()


class ConversationRequest(BaseModel):
    """对话请求模型"""
    response_id: int
    message: Optional[str] = ""


class FirstConversationRequest(BaseModel):
    """首次对话请求模型"""
    response_id: int


@router.post("/chat", status_code=200)
async def chat_with_llm(request: Request, conv_request: ConversationRequest = Body(...)):
    """
    与LLM进行对话，使用SSE流式返回
    
    请求参数:
      - response_id: 问卷回答的ID
      - message: 用户消息（首次对话可为空）
    
    返回:
      - 流式SSE响应，包含LLM生成的文本片段
    """
    logger.info(f"接收对话请求: response_id={conv_request.response_id}, 消息长度={len(conv_request.message) if conv_request.message else 0}")
    
    # 验证response_id
    response = await SurveyResponseDAO.get_by_id(conv_request.response_id)
    if not response:
        logger.error(f"无效的回答ID: {conv_request.response_id}")
        raise HTTPException(status_code=404, detail="无效的回答ID")
    
    logger.info(f"找到有效的回答记录，survey_id={response.survey_id}")
    
    # 创建客户端断开连接检测函数
    disconnect = request.is_disconnected
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"创建SSE连接，客户端IP: {client_ip}")
    
    # 创建SSE流式响应
    async def event_generator():
        chunk_count = 0
        try:
            # 使用安全的生成器包装器
            async for text_chunk in safe_generator(
                survey_conversation_service.process_conversation(
                    conv_request.response_id, conv_request.message
                )
            ):
                chunk_count += 1
                if chunk_count % 20 == 0:  # 每20个片段记录一次日志
                    logger.debug(f"已发送{chunk_count}个文本片段")
                    
                if await disconnect():
                    logger.warning(f"客户端断开连接，IP: {client_ip}")
                    break
                yield {
                    "data": text_chunk
                }
            
            logger.info(f"流式响应完成，共发送{chunk_count}个文本片段")
            # 发送完成标记
            yield {"data": "[DONE]"}
            
        except Exception as e:
            logger.error(f"流式响应出错: {str(e)}")
            yield {"data": f"服务器错误: {str(e)}"}
    
    return EventSourceResponse(event_generator())


@router.post("/first_chat", status_code=200)
async def first_chat_with_llm(request: Request, conv_request: FirstConversationRequest = Body(...)):
    """
    与LLM进行首次对话，确保第一条消息是用户角色，使用SSE流式返回
    
    请求参数:
      - response_id: 问卷回答的ID
      - initial_message: 初始用户消息，默认为"开始问卷"
    
    返回:
      - 流式SSE响应，包含LLM生成的文本片段
    """
    logger.info(f"接收首次对话请求: response_id={conv_request.response_id}")
    
    # 验证response_id
    response = await SurveyResponseDAO.get_by_id(conv_request.response_id)
    if not response:
        logger.error(f"无效的回答ID: {conv_request.response_id}")
        raise HTTPException(status_code=404, detail="无效的回答ID")
    
    logger.info(f"找到有效的回答记录，survey_id={response.survey_id}")
    
    # 创建客户端断开连接检测函数
    disconnect = request.is_disconnected
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"创建SSE连接，客户端IP: {client_ip}")
    
    # 创建SSE流式响应
    async def event_generator():
        chunk_count = 0
        try:
            # 使用安全的生成器包装器
            async for text_chunk in safe_generator(
                survey_conversation_service.process_first_conversation(
                    conv_request.response_id
                )
            ):
                chunk_count += 1
                if chunk_count % 20 == 0:  # 每20个片段记录一次日志
                    logger.debug(f"已发送{chunk_count}个文本片段")
                    
                if await disconnect():
                    logger.warning(f"客户端断开连接，IP: {client_ip}")
                    break
                yield {
                    "data": text_chunk
                }
            
            logger.info(f"流式响应完成，共发送{chunk_count}个文本片段")
            # 发送完成标记
            yield {"data": "[DONE]"}
            
        except Exception as e:
            logger.error(f"流式响应出错: {str(e)}")
            yield {"data": f"服务器错误: {str(e)}"}
    
    return EventSourceResponse(event_generator())


async def safe_generator(generator):
    """安全地包装生成器，处理异常并继续生成"""
    try:
        async for item in generator:
            yield item
    except Exception as e:
        logger.error(f"生成器发生错误: {str(e)}")
        yield f"[错误] {str(e)}"
        # 不传递异常，允许流继续 
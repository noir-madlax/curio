"""
LLM服务层
负责处理与LLM模型的交互，支持不同的LLM提供商
"""

import json
import os
import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, List, Optional
import boto3
from pydantic import BaseModel

# 配置日志
logger = logging.getLogger(__name__)


class LLMResponse(BaseModel):
    """LLM响应模型"""
    text: str
    metadata: Dict[str, Any] = {}


class LLMProvider(ABC):
    """LLM提供商抽象基类"""
    
    @abstractmethod
    async def generate_stream(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> AsyncGenerator[str, None]:
        """
        流式生成LLM响应
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            异步生成器，生成LLM响应的片段
        """
        pass
    
    @abstractmethod
    async def generate(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> LLMResponse:
        """
        生成LLM响应
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            LLM响应
        """
        pass


def log_llm_inputs(prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> None:
    """
    记录LLM调用的详细输入参数
    
    Args:
        prompt: 提示词
        conversation_history: 对话历史
        **kwargs: 其他参数
    """
    # 打印详细的提示词内容
    logger.info("================ LLM调用输入参数 ================")
    logger.info(f"提示词长度: {len(prompt)} 字符")
    logger.info(f"提示词内容:\n{prompt}")
    
    # 打印对话历史
    if conversation_history:
        logger.info(f"对话历史条数: {len(conversation_history)}")
        for i, msg in enumerate(conversation_history):
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            content_preview = content[:150] + "..." if len(content) > 150 else content
            logger.info(f"对话[{i}] - {role}: {content_preview}")
    else:
        logger.info("对话历史: 无")
    
    # 打印其他参数
    if kwargs:
        logger.info(f"其他参数: {kwargs}")
    
    logger.info("===================================================")


class BedrockProvider(LLMProvider):
    """Amazon Bedrock LLM提供商"""
    
    def __init__(self, model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0", region_name: str = "us-west-2"):
        """
        初始化Amazon Bedrock提供商
        
        Args:
            model_id: 模型ID
            region_name: AWS区域名称
        """
        self.model_id = model_id
        self.region_name = region_name
        logger.info(f"初始化BedrockProvider: model_id={model_id}, region={region_name}")
        
        try:
            self.client = boto3.client(
                service_name="bedrock-runtime",
                region_name=region_name
            )
            logger.info("成功创建Bedrock客户端")
        except Exception as e:
            logger.error(f"创建Bedrock客户端失败: {str(e)}")
            raise
    
    async def generate_stream(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> AsyncGenerator[str, None]:
        """
        流式生成Amazon Bedrock LLM响应
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            异步生成器，生成LLM响应的片段
        """
        history_count = len(conversation_history) if conversation_history else 0
        logger.info(f"开始生成流式响应: prompt长度={len(prompt)}, 对话历史数量={history_count}")
        
        # 记录详细输入
        log_llm_inputs(prompt, conversation_history, **kwargs)
        
        # 准备请求负载
        request_body = self._prepare_request_body(prompt, conversation_history, **kwargs)
        
        # 记录完整请求体
        logger.info("完整请求体:")
        logger.info(json.dumps(request_body, indent=2, ensure_ascii=False))
        
        try:
            # 调用Bedrock流式API
            logger.debug(f"调用Bedrock流式API: modelId={self.model_id}")
            response = self.client.invoke_model_with_response_stream(
                modelId=self.model_id,
                body=json.dumps(request_body)
            )
            
            # 处理流式响应
            stream = response.get('body')
            if stream:
                logger.info("开始处理流式响应")
                chunk_count = 0
                async for event in self._process_stream(stream):
                    chunk_count += 1
                    yield event
                logger.info(f"流式响应完成，共处理{chunk_count}个文本片段")
            else:
                logger.warning("Bedrock响应中没有'body'字段")
        except Exception as e:
            logger.error(f"Bedrock流式API调用失败: {str(e)}")
            yield f"LLM服务错误: {str(e)}"
    
    async def _process_stream(self, stream) -> AsyncGenerator[str, None]:
        """处理Amazon Bedrock的流式响应"""
        try:
            event_count = 0
            for event in stream:
                event_count += 1
                if event_count % 20 == 0:
                    logger.debug(f"已处理{event_count}个流事件")
                    
                if 'chunk' in event:
                    chunk = json.loads(event['chunk']['bytes'].decode('utf-8'))
                    if 'type' in chunk and chunk['type'] == 'content_block_delta':
                        text = chunk['delta']['text']
                        if text:
                            yield text
            logger.debug(f"流处理完成，共处理{event_count}个事件")
        except Exception as e:
            logger.error(f"处理流式响应出错: {str(e)}")
            yield f"处理错误: {str(e)}"
        
    async def generate(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> LLMResponse:
        """
        生成Amazon Bedrock LLM响应
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            LLM响应
        """
        history_count = len(conversation_history) if conversation_history else 0
        logger.info(f"开始生成响应: prompt长度={len(prompt)}, 对话历史数量={history_count}")
        
        # 记录详细输入
        log_llm_inputs(prompt, conversation_history, **kwargs)
        
        # 准备请求负载
        request_body = self._prepare_request_body(prompt, conversation_history, **kwargs)
        
        try:
            # 调用Bedrock API
            logger.debug(f"调用Bedrock API: modelId={self.model_id}")
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body)
            )
            
            # 解析响应
            response_body = json.loads(response['body'].read().decode('utf-8'))
            logger.debug(f"收到Bedrock响应，解析响应内容")
            
            # 解析模型特定的响应格式
            if 'content' in response_body and isinstance(response_body['content'], list):
                # Claude 3模型响应格式
                text = ""
                for content_block in response_body['content']:
                    if content_block.get('type') == 'text':
                        text += content_block.get('text', '')
                
                logger.info(f"生成响应成功，文本长度={len(text)}")
                return LLMResponse(text=text, metadata=response_body)
            else:
                # 兜底，直接返回原始响应
                text = response_body.get('completion', str(response_body))
                logger.info(f"生成响应成功(兜底模式)，文本长度={len(text)}")
                return LLMResponse(
                    text=text,
                    metadata=response_body
                )
        except Exception as e:
            logger.error(f"Bedrock API调用失败: {str(e)}")
            return LLMResponse(text=f"错误: {str(e)}", metadata={})
    
    def _prepare_request_body(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> Dict[str, Any]:
        """准备请求正文"""
        logger.debug("准备Bedrock请求体")
        # Claude 3模型的消息格式
        messages = []
        
        # 添加系统提示作为特殊的用户消息（Claude流式API不支持system角色）
        messages.append({
            "role": "user",
            "content": [{"type": "text", "text": prompt}]
        })
        
        # 添加历史消息
        if conversation_history:
            for message in conversation_history:
                role = message.get('role', 'user')
                # 确保所有角色都是API支持的类型（user或assistant）
                if role not in ['user', 'assistant']:
                    role = 'user'  # 默认为用户消息
                
                messages.append({
                    "role": role,
                    "content": [{"type": "text", "text": message.get('content', '')}]
                })
        
        # 构建请求体
        max_tokens = kwargs.get('max_tokens', 4096)
        temperature = kwargs.get('temperature', 0.7)
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": messages
        }
        
        logger.debug(f"请求体准备完成: max_tokens={max_tokens}, temperature={temperature}, 消息数量={len(messages)}")
        return request_body


class OpenAIProvider(LLMProvider):
    """OpenAI LLM提供商 (示例实现，未完全实现)"""
    
    def __init__(self):
        logger.info("初始化OpenAIProvider(未完全实现)")
    
    async def generate_stream(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> AsyncGenerator[str, None]:
        """
        流式生成OpenAI LLM响应 (占位)
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            异步生成器，生成LLM响应的片段
        """
        logger.warning("使用OpenAI流式API占位实现")
        # 记录详细输入
        log_llm_inputs(prompt, conversation_history, **kwargs)
        # TODO: 实现OpenAI流式API调用
        yield "OpenAI流式API尚未实现"
    
    async def generate(self, prompt: str, conversation_history: List[Dict[str, str]] = None, **kwargs) -> LLMResponse:
        """
        生成OpenAI LLM响应 (占位)
        
        Args:
            prompt: 提示词
            conversation_history: 对话历史
            **kwargs: 其他参数
            
        Returns:
            LLM响应
        """
        logger.warning("使用OpenAI API占位实现")
        # 记录详细输入
        log_llm_inputs(prompt, conversation_history, **kwargs)
        # TODO: 实现OpenAI API调用
        return LLMResponse(text="OpenAI API尚未实现", metadata={})


class LLMFactory:
    """LLM工厂类，负责创建不同的LLM提供商实例"""
    
    @staticmethod
    def create_provider(provider_type: str = "bedrock", **kwargs) -> LLMProvider:
        """
        创建LLM提供商实例
        
        Args:
            provider_type: 提供商类型，如"bedrock"、"openai"等
            **kwargs: 其他初始化参数
            
        Returns:
            LLM提供商实例
        """
        logger.info(f"创建LLM提供商: provider_type={provider_type}")
        
        try:
            if provider_type.lower() == "bedrock":
                model_id = kwargs.get('model_id', "anthropic.claude-3-sonnet-20240229-v1:0")
                region_name = kwargs.get('region_name', "us-west-2")
                logger.info(f"创建BedrockProvider: model_id={model_id}, region={region_name}")
                return BedrockProvider(
                    model_id=model_id,
                    region_name=region_name
                )
            elif provider_type.lower() == "openai":
                logger.info("创建OpenAIProvider")
                return OpenAIProvider()
            else:
                error = f"不支持的LLM提供商类型: {provider_type}"
                logger.error(error)
                raise ValueError(error)
        except Exception as e:
            logger.error(f"创建LLM提供商失败: {str(e)}")
            raise


# 默认LLM服务实例，使用环境变量进行配置
try:
    provider_type = os.environ.get("LLM_PROVIDER", "bedrock")
    model_id = os.environ.get("LLM_MODEL_ID", "anthropic.claude-3-7-sonnet-20250219-v1:0")
    region_name = os.environ.get("AWS_REGION", "us-west-2")
    
    logger.info(f"创建默认LLM提供商: provider_type={provider_type}, model_id={model_id}, region={region_name}")
    default_provider = LLMFactory.create_provider(
        provider_type=provider_type,
        model_id=model_id,
        region_name=region_name
    )
except Exception as e:
    logger.error(f"创建默认LLM提供商失败: {str(e)}")
    # 在生产环境中可能需要使用备用提供商或者优雅地处理错误
    raise 
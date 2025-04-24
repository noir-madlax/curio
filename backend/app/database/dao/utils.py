"""
DAO辅助工具函数
"""

from typing import Dict, Any
from datetime import datetime


def format_timestamp(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    将字符串时间戳转换为datetime对象
    
    Args:
        data: 包含时间戳字段的数据字典
        
    Returns:
        处理后的数据字典，时间戳已转换为datetime对象
    """
    if 'created_at' in data and data['created_at']:
        try:
            # 处理各种ISO格式的日期时间字符串
            timestamp = data['created_at']
            # 确保有时区信息
            if 'Z' in timestamp:
                timestamp = timestamp.replace('Z', '+00:00')
            # 确保微秒格式正确
            if '.' in timestamp and '+' in timestamp:
                parts = timestamp.split('+')
                time_part = parts[0]
                zone_part = '+' + parts[1]
                # 如果微秒部分长度超过6，截断它
                if '.' in time_part:
                    time_parts = time_part.split('.')
                    if len(time_parts[1]) > 6:
                        time_parts[1] = time_parts[1][:6]
                    time_part = '.'.join(time_parts)
                timestamp = time_part + zone_part
            data['created_at'] = datetime.fromisoformat(timestamp)
        except Exception as e:
            # 如果解析失败，记录错误但不中断程序
            print(f"解析created_at时间戳出错: {e}, 原始值: {data['created_at']}")
            # 使用当前时间作为备用
            data['created_at'] = datetime.now()
    
    if 'updated_at' in data and data['updated_at']:
        try:
            # 处理各种ISO格式的日期时间字符串
            timestamp = data['updated_at']
            # 确保有时区信息
            if 'Z' in timestamp:
                timestamp = timestamp.replace('Z', '+00:00')
            # 确保微秒格式正确
            if '.' in timestamp and '+' in timestamp:
                parts = timestamp.split('+')
                time_part = parts[0]
                zone_part = '+' + parts[1]
                # 如果微秒部分长度超过6，截断它
                if '.' in time_part:
                    time_parts = time_part.split('.')
                    if len(time_parts[1]) > 6:
                        time_parts[1] = time_parts[1][:6]
                    time_part = '.'.join(time_parts)
                timestamp = time_part + zone_part
            data['updated_at'] = datetime.fromisoformat(timestamp)
        except Exception as e:
            # 如果解析失败，记录错误但不中断程序
            print(f"解析updated_at时间戳出错: {e}, 原始值: {data['updated_at']}")
            # 使用当前时间作为备用
            data['updated_at'] = datetime.now()
    
    return data 
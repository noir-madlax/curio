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
        data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
    if 'updated_at' in data and data['updated_at']:
        data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
    return data 
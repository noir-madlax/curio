"""
此文件已弃用，请使用 database 目录中的模块。

所有数据库操作都通过 Supabase 客户端完成，不再使用 SQLAlchemy。
"""

# 为保持向后兼容，添加导入内容
from .database import get_supabase
from .database.utils import test_supabase_connection

# 依赖项函数 - 获取Supabase客户端
def get_db():
    """
    兼容旧代码的依赖项函数，返回Supabase客户端
    """
    return get_supabase() 
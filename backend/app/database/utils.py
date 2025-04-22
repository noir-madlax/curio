from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from .config import engine


async def test_database_connection() -> bool:
    """
    测试数据库连接是否正常
    """
    try:
        with Session(engine) as session:
            # 执行简单查询测试连接
            result = session.execute(text("SELECT 1"))
            return result.scalar() == 1
    except SQLAlchemyError as e:
        print(f"数据库连接测试失败: {str(e)}")
        return False


async def get_database_tables_info() -> dict:
    """
    获取数据库表信息
    """
    try:
        with Session(engine) as session:
            # 获取所有表
            tables_query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            """
            tables_result = session.execute(text(tables_query))
            tables = [row[0] for row in tables_result]
            
            tables_info = {}
            
            # 获取每个表的列信息
            for table in tables:
                columns_query = f"""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = '{table}'
                """
                columns_result = session.execute(text(columns_query))
                columns = {row[0]: row[1] for row in columns_result}
                tables_info[table] = columns
                
            return tables_info
    except SQLAlchemyError as e:
        print(f"获取数据库表信息失败: {str(e)}")
        return {} 
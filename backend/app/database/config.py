import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取Supabase连接信息
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")  # 格式: postgresql://username:password@host:port/database

# 创建SQLAlchemy引擎
if SUPABASE_DB_URL:
    DATABASE_URL = SUPABASE_DB_URL
else:
    # 如果没有设置Supabase数据库URL，则使用SQLite作为后备选项
    DATABASE_URL = "sqlite:///./app.db"
    
engine = create_engine(DATABASE_URL)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类模型
Base = declarative_base()

# 依赖项函数 - 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
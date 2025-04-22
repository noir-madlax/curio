import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 加载环境变量
load_dotenv()

# Supabase配置
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 创建Supabase客户端
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase客户端连接成功")
    except Exception as e:
        print(f"Supabase客户端连接失败: {str(e)}")
else:
    print("警告：未配置Supabase URL或API Key")

# 获取Supabase客户端实例
def get_supabase() -> Client:
    if supabase is None:
        raise Exception("Supabase客户端未初始化")
    return supabase
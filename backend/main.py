import os
import uvicorn
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

if __name__ == "__main__":
    # 从环境变量获取配置，或使用默认值
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8080"))
    reload = os.getenv("DEBUG", "False").lower() == "true"
    
    # 运行服务器
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload
    ) 
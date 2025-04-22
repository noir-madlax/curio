import uvicorn
from app.main import app

if __name__ == "__main__":
    """
    启动FastAPI应用，使用uvicorn服务器
    
    命令行运行方式:
    python backend/main.py
    """
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True) 
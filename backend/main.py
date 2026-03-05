from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import webbrowser
import threading
import time

from core import load_text, get_loaded_status

app = FastAPI(title="关键词聚合工具", version="0.1.0")


class LoadRequest(BaseModel):
    path: str


@app.get("/", summary="服务状态")
def read_root():
    return {"status": "running", "message": "关键词聚合工具后端服务正常"}


@app.post("/load", summary="加载文本文件")
def api_load(req: LoadRequest):
    """
    根据本地路径读取 TXT 文件，加载到内存供后续搜索使用。
    - **path**: 文件的绝对路径，例如 `C:/novels/test.txt`
    """
    try:
        result = load_text(req.path)
        return {"success": True, "data": result}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取失败: {e}")


@app.get("/status", summary="查看已加载文件状态")
def api_status():
    """返回当前内存中是否已有加载的文本及其基本信息。"""
    return get_loaded_status()


def open_browser():
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8000/docs")


if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)

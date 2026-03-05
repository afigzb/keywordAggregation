import os

# 全局存储已加载的文本，供 search/aggregate 复用
_loaded_text: str = ""
_loaded_path: str = ""


def load_text(path: str) -> dict:
    """
    读取指定路径的 TXT 文件。
    自动检测编码（优先 UTF-8，fallback GBK），适配大多数中文小说文件。
    返回文件基本信息，文本内容存入模块级变量供后续函数使用。
    """
    global _loaded_text, _loaded_path

    if not os.path.exists(path):
        raise FileNotFoundError(f"文件不存在: {path}")

    if not path.lower().endswith(".txt"):
        raise ValueError("仅支持 .txt 文件")

    file_size = os.path.getsize(path)

    # 自动检测编码
    text = _read_with_encoding(path)

    _loaded_text = text
    _loaded_path = path

    lines = text.splitlines()

    return {
        "path": path,
        "file_size_bytes": file_size,
        "file_size_kb": round(file_size / 1024, 2),
        "char_count": len(text),
        "line_count": len(lines),
        "preview": text[:200],  # 前200字作为预览
    }


def get_loaded_status() -> dict:
    """返回当前已加载文件的状态。"""
    if not _loaded_text:
        return {"loaded": False}
    return {
        "loaded": True,
        "path": _loaded_path,
        "char_count": len(_loaded_text),
    }


def _read_with_encoding(path: str) -> str:
    """尝试多种编码读取文件，返回字符串内容。"""
    for encoding in ("utf-8", "utf-8-sig", "gbk", "gb2312"):
        try:
            with open(path, "r", encoding=encoding) as f:
                return f.read()
        except (UnicodeDecodeError, LookupError):
            continue
    # 最终兜底：忽略无法解码的字符
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

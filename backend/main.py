from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import jieba
import re
import json
import chardet
from collections import Counter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AggregateRequest(BaseModel):
    file_path: str
    keyword: str
    top_n: int = 20


def _read_file(file_path: str) -> str:
    """
    Read a text file with automatic encoding detection.
    Strategy: chardet detection → common Chinese encodings → replace-mode fallback.
    """
    with open(file_path, 'rb') as f:
        raw = f.read()

    # 1. chardet auto-detect
    detected = chardet.detect(raw)
    detected_enc = detected.get('encoding')
    if detected_enc:
        try:
            return raw.decode(detected_enc)
        except (UnicodeDecodeError, LookupError):
            pass

    # 2. common Chinese encoding chain
    for encoding in ('utf-8-sig', 'utf-8', 'gb18030', 'gbk', 'big5'):
        try:
            return raw.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            continue

    # 3. guaranteed fallback — replace undecodable bytes with ?
    return raw.decode('gb18030', errors='replace')


def _aggregate_stream(text: str, keyword: str, top_n: int):
    """
    Split text into sentences, find hits containing the keyword,
    segment with jieba, and yield SSE chunks with progressive results.
    """
    sentences = re.split(r'[。！？\n,.!?；;]+', text)
    hits = [s.strip() for s in sentences if s.strip() and keyword in s]
    total = len(hits)

    if total == 0:
        yield json.dumps({"type": "done", "processed": 0, "total": 0, "keywords": []})
        return

    counter: Counter = Counter()
    batch_size = 200

    for batch_start in range(0, total, batch_size):
        batch = hits[batch_start: batch_start + batch_size]
        for sentence in batch:
            words = jieba.lcut_for_search(sentence)
            for word in words:
                # Keep compound words that contain the keyword and are longer than it
                if keyword in word and len(word) > len(keyword):
                    counter[word] += 1

        processed = min(batch_start + batch_size, total)
        yield json.dumps({
            "type": "progress",
            "processed": processed,
            "total": total,
            "keywords": counter.most_common(top_n),
        })

    yield json.dumps({
        "type": "done",
        "processed": total,
        "total": total,
        "keywords": counter.most_common(top_n),
    })


@app.post("/aggregate")
async def aggregate(request: AggregateRequest):
    def generate():
        try:
            text = _read_file(request.file_path)
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            return
        for chunk in _aggregate_stream(text, request.keyword, request.top_n):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=6759)

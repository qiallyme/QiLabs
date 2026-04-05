def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 150) -> list[dict]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append({"text": text[start:end]})
        if end == len(text):
            break
        start = end - overlap
    return chunks
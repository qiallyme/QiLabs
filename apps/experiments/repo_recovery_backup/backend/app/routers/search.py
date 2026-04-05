"""Search router — PostgreSQL full-text search."""

from fastapi import APIRouter, Depends

from app.deps import get_current_user, get_service_client

router = APIRouter()


@router.get("")
async def search(matter_id: str, q: str, user: dict = Depends(get_current_user)):
    db = get_service_client()

    # Search facts
    facts_result = db.table("facts").select("*").eq("matter_id", matter_id).text_search("fts", q).limit(20).execute()

    # Search documents
    docs_result = db.table("documents").select("*").eq("matter_id", matter_id).text_search("fts", q).limit(20).execute()

    # Search chunks
    chunks_result = db.table("text_chunks").select("*, documents!inner(title, matter_id)").eq(
        "documents.matter_id", matter_id
    ).text_search("fts", q).limit(20).execute()

    return {
        "query": q,
        "facts": facts_result.data or [],
        "documents": docs_result.data or [],
        "chunks": chunks_result.data or [],
    }

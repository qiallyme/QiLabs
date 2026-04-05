from fastapi import FastAPI, Request
from coach_logic import process_user_query

app = FastAPI()

@app.post("/coach")
async def coach_endpoint(request: Request):
    data = await request.json()
    user_query = data.get("query")
    user_location = data.get("location")
    case_type = data.get("case_type")
    progress = data.get("progress", {})

    response = process_user_query(
        query=user_query,
        location=user_location,
        case_type=case_type,
        progress=progress
    )
    return {"response": response}
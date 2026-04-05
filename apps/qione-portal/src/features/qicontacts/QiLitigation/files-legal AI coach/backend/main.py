from fastapi import FastAPI, Request
from langchain_agent import get_legal_coach_response

app = FastAPI()

@app.post("/coach")
async def coach_endpoint(request: Request):
    data = await request.json()
    user_query = data.get("query")
    user_location = data.get("location")  # e.g., county/state
    case_type = data.get("case_type")     # e.g., dependency/family

    # Call LangChain agent
    response = get_legal_coach_response(
        query=user_query, location=user_location, case_type=case_type
    )
    return {"response": response}
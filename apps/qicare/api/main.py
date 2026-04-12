from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(title="Mom Care API")

class KBArticle(BaseModel):
    title: str
    content: str

@app.get("/")
async def root():
    return {"status": "online", "message": "Mom Care API is active"}

@app.get("/kb", response_model=List[KBArticle])
async def get_kb():
    return [
        {"title": "How to use Voice Commands", "content": "Click the microphone icon and speak naturally..."},
        {"title": "COPD Safety", "content": "Monitor O2 levels and follow the escalation protocols..."},
        {"title": "Medication Tracking", "content": "The app prevents duplicate doses of acetaminophen..."},
    ]

@app.post("/symptoms/evaluate")
async def evaluate_symptoms(pain_level: int, breathing_status: str):
    # This logic can be more complex, calling an LLM or safety rules
    threshold = 7
    if pain_level >= threshold or breathing_status == "distressed":
        return {"action": "ESCALATE", "message": "High pain or breathing distress detected. Contact provider."}
    return {"action": "MONITOR", "message": "Keep monitoring patient."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

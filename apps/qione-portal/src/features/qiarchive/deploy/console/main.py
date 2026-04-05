from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os

app = FastAPI(title="QiArchive Console")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    # This will pull from the Engine API or directly from the Ledger
    stats = {
        "inbox": 5,
        "staged": 12,
        "uploaded": 150,
        "review": 2
    }
    return templates.TemplateResponse("index.html", {"request": request, "stats": stats})

@app.get("/health")
async def health():
    return {"status": "healthy"}

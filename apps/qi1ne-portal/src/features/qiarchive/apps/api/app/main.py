from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .db import engine, Base
from .config import settings

app = FastAPI(title="QiArchive Cloud API", version="1.0.0")

# Enable CORS for the PWA and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you can restrict this to your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "healthy", "env": settings.APP_ENV}

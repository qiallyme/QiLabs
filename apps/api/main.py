from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import settings
from database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    description="QiOne Operating System API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from routers import auth, users, organizations, objects

app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(
    users.router, prefix=f"{settings.API_V1_PREFIX}/users", tags=["users"]
)
app.include_router(
    organizations.router,
    prefix=f"{settings.API_V1_PREFIX}/organizations",
    tags=["organizations"],
)
app.include_router(
    objects.router, prefix=f"{settings.API_V1_PREFIX}/objects", tags=["objects"]
)


@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/")
async def root():
    return {"message": "Welcome to QiOne API", "docs": "/docs", "version": "1.0.0"}

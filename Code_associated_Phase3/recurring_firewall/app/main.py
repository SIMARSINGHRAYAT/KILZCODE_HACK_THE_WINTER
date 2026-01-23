from fastapi import FastAPI
from contextlib import asynccontextmanager
from .container import container
from .core.config import settings
from .api.v1 import score_routes, investigate_routes, system_routes, merchant_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await container.startup()
    yield
    # Shutdown
    await container.shutdown()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(score_routes.router, tags=["Scoring"])
app.include_router(investigate_routes.router, tags=["Investigation"])
app.include_router(system_routes.router, tags=["System"])
app.include_router(merchant_routes.router, tags=["Merchant"])

from .api.v1 import frontend_routes
app.include_router(frontend_routes.router, tags=["Frontend"])

@app.get("/")
def health_check():
    return {"status": "online", "version": settings.APP_VERSION}

"""
APIService — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.dashboard import router as dashboard_router
from app.routers.search import router as search_router

app = FastAPI(
    title="APIService API",
    version="0.1.0",
    description="Backend API for APIService, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix='/api/v1')
app.include_router(search_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "APIService"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

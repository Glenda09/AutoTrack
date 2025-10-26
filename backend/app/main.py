from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import get_version
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging_conf import configure_logging


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title=settings.APP_NAME,
        version=get_version(),
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
        docs_url="/docs",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["Health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix=settings.API_PREFIX)
    return app


app = create_app()

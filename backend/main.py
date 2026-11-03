# FastAPI entry point
#
# Run from the backend folder:   uvicorn main:app --reload
# Then open:                     http://127.0.0.1:8000
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Make the flat imports below (config, database, routers...) work no matter
# where the app is started from (local uvicorn OR Vercel's "backend.main:app").
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  # noqa: F401  (registers the tables)
from config import settings
from database import Base, engine
from routers import books, issues, users, wishlist
from seed_books import seed_books


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On Vercel every cold start would redo this, so do it once from your PC
    # instead (see README). Locally it still runs automatically.
    if not os.environ.get("VERCEL"):
        Base.metadata.create_all(bind=engine)  # create tables if missing
        seed_books()  # load data/books.json if the books are not there yet
    yield


app = FastAPI(title="Books For All API", lifespan=lifespan)

# The website is served by this same app, so CORS is only needed if you open
# the HTML files from another origin (e.g. VS Code Live Server). Auth uses a
# Bearer token, not cookies, so "*" is safe here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(books.router, prefix="/api/books", tags=["Books"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["Wishlist"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}


# Serve the frontend at "/" (must be mounted last so /api/* keeps working).
frontend_dir = Path(settings.FRONTEND_DIR)
if frontend_dir.is_dir():
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

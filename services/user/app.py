# services/user/app.py
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET not set in .env")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def create_token(data: dict, expires_hours: int = 2) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=expires_hours)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ===== FastAPI app
from routes import profile, password, delete_account

app = FastAPI(title="User Service")

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("AUTH_URL", "http://localhost:4000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/user")
app.include_router(password.router, prefix="/user")
app.include_router(delete_account.router, prefix="/user")

@app.get("/")
async def root():
    return {"message": "User service API is running!"}

@app.get("/test-token")
async def test_token(authorization: str = Header(None)):
    if not authorization:
        return {"detail": "No Authorization header found"}
    token = authorization.replace("Bearer ", "")
    decoded = decode_token(token)
    return {"authorization_received": authorization, "decoded": decoded}



# services/user/routes/password.py
from fastapi import APIRouter, Depends, HTTPException, Cookie, Request, Header
from typing import Optional
from datetime import datetime, timedelta
import re
import secrets
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from schemas import ChangePasswordSchema
from utils.hash import hash_password, verify_password
from utils.jwt import decode_token, encode_token  # توحيد JWT
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# ===== MongoDB client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== Password rules
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;\"'<>,.?/]).{8,}$"
)

# ===== Rate limiter storage (in-memory for demo)
RATE_LIMIT_STORE = {}

def rate_limit(key: str, limit: int, window_seconds: int):
    now = datetime.utcnow()
    if key not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[key] = []
    RATE_LIMIT_STORE[key] = [t for t in RATE_LIMIT_STORE[key] if (now - t).total_seconds() < window_seconds]
    if len(RATE_LIMIT_STORE[key]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests")
    RATE_LIMIT_STORE[key].append(now)

# ===== helper: get_current_user from cookie or Authorization header
async def get_current_user(token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)):
    # نحاول ناخد التوكن من Header أولاً
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="auth.no_token")

    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user_id = decoded.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    return user

# ===== POST /forgot-password
@router.post("/forgot-password")
async def forgot_password(request: Request, email: str):
    rate_limit(f"forgot-password:{request.client.host}", limit=5, window_seconds=300)
    email = (email or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="forgotPassword.error")

    user = await users_collection.find_one({"email": email})
    if not user:
        return {"message": "forgotPassword.check_email"}

    reset_token = secrets.token_hex(32)
    reset_expiry = datetime.utcnow() + timedelta(hours=1)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_password_token": reset_token, "reset_password_expires": reset_expiry}}
    )

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend}/reset-password?token={reset_token}"
    print(f"[forgot-password] reset link: {reset_link}")

    return {"message": "forgotPassword.check_email"}

# ===== POST /reset-password
@router.post("/reset-password")
async def reset_password(request: Request, token: str, new_password: str, confirm_password: str):
    rate_limit(f"reset-password:{request.client.host}", limit=5, window_seconds=300)
    token = (token or "").strip()
    new_password = (new_password or "").strip()
    confirm_password = (confirm_password or "").strip()
    if not token or not new_password or not confirm_password:
        raise HTTPException(status_code=400, detail="ResetPassword.error")
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="ResetPassword.passwordMismatch")
    if not PASSWORD_REGEX.match(new_password):
        raise HTTPException(status_code=400, detail="ResetPassword.error")

    now = datetime.utcnow()
    user = await users_collection.find_one({
        "reset_password_token": token,
        "reset_password_expires": {"$gt": now}
    })
    if not user:
        raise HTTPException(status_code=400, detail="ResetPassword.invalidLink")

    hashed = hash_password(new_password)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed,
            "reset_password_token": None,
            "reset_password_expires": None,
            "last_password_change": now,
            "password_change_count": (user.get("password_change_count") or 0) + 1
        }}
    )
    return {"message": "ResetPassword.success"}

# ===== POST /change-password
@router.post("/change-password")
async def change_password(request: Request, data: ChangePasswordSchema, current_user: dict = Depends(get_current_user)):
    rate_limit(f"change-password:{current_user['_id']}", limit=5, window_seconds=300)
    old_password = (data.old_password or "").strip()
    new_password = (data.new_password or "").strip()
    confirm_password = (data.confirm_password or "").strip()
    if not old_password or not new_password or not confirm_password:
        raise HTTPException(status_code=400, detail="changePassword.error")
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="changePassword.passwordsMismatch")
    if not verify_password(old_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="changePassword.oldPasswordIncorrect")
    if not PASSWORD_REGEX.match(new_password):
        raise HTTPException(status_code=400, detail="changePassword.error")

    now = datetime.utcnow()
    new_hashed = hash_password(new_password)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "password": new_hashed,
            "last_password_change": now,
            "password_change_count": (current_user.get("password_change_count") or 0) + 1
        }}
    )
    return {"message": "changePassword.success"}


"""
# services/user/routes/password.py
from fastapi import APIRouter, Depends, HTTPException, Cookie, Request
from typing import Optional
from datetime import datetime, timedelta
import re
import secrets
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from schemas import ChangePasswordSchema
from utils.hash import hash_password, verify_password
from utils.jwt import decode_token
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# ===== MongoDB client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== Password rules
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;\"'<>,.?/]).{8,}$"
)

# ===== Rate limiter storage (in-memory for demo)
RATE_LIMIT_STORE = {}

def rate_limit(key: str, limit: int, window_seconds: int):
    now = datetime.utcnow()
    if key not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[key] = []
    # remove expired timestamps
    RATE_LIMIT_STORE[key] = [t for t in RATE_LIMIT_STORE[key] if (now - t).total_seconds() < window_seconds]
    if len(RATE_LIMIT_STORE[key]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests")
    RATE_LIMIT_STORE[key].append(now)

# ===== helper: get_current_user from cookie
async def get_current_user(token: Optional[str] = Cookie(None)):
    if not token:
        raise HTTPException(status_code=401, detail="auth.no_token")
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="auth.invalid_token")
    user_id = decoded.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="auth.invalid_token")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    return user

# ===== POST /forgot-password
@router.post("/forgot-password")
async def forgot_password(request: Request, email: str):
    rate_limit(f"forgot-password:{request.client.host}", limit=5, window_seconds=300)
    email = (email or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="forgotPassword.error")

    user = await users_collection.find_one({"email": email})
    if not user:
        return {"message": "forgotPassword.check_email"}

    reset_token = secrets.token_hex(32)
    reset_expiry = datetime.utcnow() + timedelta(hours=1)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_password_token": reset_token, "reset_password_expires": reset_expiry}}
    )

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend}/reset-password?token={reset_token}"
    print(f"[forgot-password] reset link: {reset_link}")

    return {"message": "forgotPassword.check_email"}

# ===== POST /reset-password
@router.post("/reset-password")
async def reset_password(request: Request, token: str, new_password: str, confirm_password: str):
    rate_limit(f"reset-password:{request.client.host}", limit=5, window_seconds=300)
    token = (token or "").strip()
    new_password = (new_password or "").strip()
    confirm_password = (confirm_password or "").strip()
    if not token or not new_password or not confirm_password:
        raise HTTPException(status_code=400, detail="ResetPassword.error")
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="ResetPassword.passwordMismatch")
    if not PASSWORD_REGEX.match(new_password):
        raise HTTPException(status_code=400, detail="ResetPassword.error")

    now = datetime.utcnow()
    user = await users_collection.find_one({
        "reset_password_token": token,
        "reset_password_expires": {"$gt": now}
    })
    if not user:
        raise HTTPException(status_code=400, detail="ResetPassword.invalidLink")

    hashed = hash_password(new_password)
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed,
            "reset_password_token": None,
            "reset_password_expires": None,
            "last_password_change": now,
            "password_change_count": (user.get("password_change_count") or 0) + 1
        }}
    )
    return {"message": "ResetPassword.success"}

# ===== POST /change-password
@router.post("/change-password")
async def change_password(request: Request, data: ChangePasswordSchema, current_user: dict = Depends(get_current_user)):
    rate_limit(f"change-password:{current_user['_id']}", limit=5, window_seconds=300)
    old_password = (data.old_password or "").strip()
    new_password = (data.new_password or "").strip()
    confirm_password = (data.confirm_password or "").strip()
    if not old_password or not new_password or not confirm_password:
        raise HTTPException(status_code=400, detail="changePassword.error")
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="changePassword.passwordsMismatch")
    if not verify_password(old_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="changePassword.oldPasswordIncorrect")
    if not PASSWORD_REGEX.match(new_password):
        raise HTTPException(status_code=400, detail="changePassword.error")

    now = datetime.utcnow()
    new_hashed = hash_password(new_password)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "password": new_hashed,
            "last_password_change": now,
            "password_change_count": (current_user.get("password_change_count") or 0) + 1
        }}
    )
    return {"message": "changePassword.success"}



"""



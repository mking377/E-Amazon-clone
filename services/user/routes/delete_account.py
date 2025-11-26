# services/user/routes/delete_account.py
from fastapi import APIRouter, Depends, HTTPException, Cookie
from bson import ObjectId
from utils.jwt import decode_token
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ===== MongoDB client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== helper: get_current_user from cookie
async def get_current_user(token: str = Cookie(None)):
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

# ===== DELETE /delete-account
@router.delete("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    result = await users_collection.delete_one({"_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    
    return {"message": "Account deleted successfully"}



"""
# services/user/routes/delete_account.py
from fastapi import APIRouter, Depends, HTTPException, Cookie
from bson import ObjectId
from utils.jwt import decode_token
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ===== MongoDB client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== helper: get_current_user from cookie
async def get_current_user(token: str = Cookie(None)):
    if not token:                                                                                       raise HTTPException(status_code=401, detail="auth.no_token")                                decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="auth.invalid_token")
    user_id = decoded.get("id")                                                                     if not user_id:
        raise HTTPException(status_code=401, detail="auth.invalid_token")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    return user

# ===== DELETE /delete-account
@router.delete("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    result = await users_collection.delete_one({"_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    return {"message": "Account deleted successfully"}



"""


"""
# services/user/routes/delete_account.py
from fastapi import APIRouter, Depends, HTTPException, Cookie
from bson import ObjectId
from utils.jwt import decode_token
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# ===== MongoDB client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== helper: get_current_user from cookie
async def get_current_user(token: str = Cookie(None)):
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

# ===== DELETE /delete-account
@router.delete("/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    result = await users_collection.delete_one({"_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="profile.user_not_found")
    return {"message": "Account deleted successfully"}


"""



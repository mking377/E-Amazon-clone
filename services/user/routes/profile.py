# services/user/routes/profile.py
from fastapi import APIRouter, Depends, HTTPException, Header
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os

from utils.jwt import decode_token, encode_token  # استخدام التوكن الموحد
from models import User
from schemas import UpdateProfileSchema

router = APIRouter()

# ===== MongoDB Atlas client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]

# ===== دالة لجلب المستخدم الحالي من التوكن
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="auth.no_token")

    token = authorization.split(" ")[1]
    decoded = decode_token(token)  # استخدام decode الموحد
    if not decoded:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user_id = decoded.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user_data = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_data:
        raise HTTPException(status_code=404, detail="profile.user_not_found")

    return User(**user_data)

# ===== GET /profile
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    جلب بيانات المستخدم الحالي
    """
    return {"user": current_user}

# ===== PUT /update-profile
@router.put("/update-profile")
async def update_profile(
    data: UpdateProfileSchema, current_user: User = Depends(get_current_user)
):
    """
    تحديث بيانات المستخدم الحالي
    """
    update_fields = {}
    if data.name:
        update_fields["name"] = data.name
    if data.email:
        update_fields["email"] = data.email

    if update_fields:
        await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_fields}
        )

    updated_user_data = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    updated_user = User(**updated_user_data)
    return {"message": "profile.update_success", "user": updated_user}

"""

# services/user/routes/profile.py
from fastapi import APIRouter, Depends, HTTPException, Header
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os

from utils.jwt import decode_token
from models import User
from schemas import UpdateProfileSchema

router = APIRouter()

# ===== MongoDB Atlas client
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["amazon_clone"]
users_collection = db["users"]


# ✅ دالة لجلب المستخدم الحالي من التوكن
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="auth.no_token")

    token = authorization.split(" ")[1]
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user_id = decoded.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="auth.invalid_token")

    user_data = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_data:
        raise HTTPException(status_code=404, detail="profile.user_not_found")

    return User(**user_data)


# ===== GET /profile
@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"user": current_user}


# ===== PUT /update-profile
@router.put("/update-profile")
async def update_profile(
    data: UpdateProfileSchema, current_user: User = Depends(get_current_user)
):
    update_fields = {}
    if data.name:
        update_fields["name"] = data.name
    if data.email:
        update_fields["email"] = data.email

    if update_fields:
        await users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": update_fields}
        )

    updated_user_data = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    updated_user = User(**updated_user_data)
    return {"message": "profile.update_success", "user": updated_user}




"""

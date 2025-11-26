from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # تحميل المتغيرات من .env

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("amazon_clone")
users_collection = db.get_collection("users")



"""

from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI")  # هتحط URI بتاع MongoDB Atlas هنا
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("amazon_clone")  # اسم قاعدة البيانات
users_collection = db.get_collection("users")


"""

# services/user/utils/jwt.py
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

# تحميل المتغيرات من .env
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET not set in .env")

def encode_token(payload: dict) -> str:
    """
    توليد JWT جديد باستخدام secret موحد
    """
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict | None:
    """
    فك التوكن والتحقق منه
    """
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        print("✅ Decoded JWT payload:", decoded)
        return decoded
    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print("❌ Invalid token:", str(e))
        return None


"""
# services/user/utils/jwt.py
import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "fallback_secret")

def decode_token(token: str) -> dict | None:
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        # ✅ نطبع الداتا عشان الديباج
        print("Decoded JWT payload:", decoded)
        return decoded
    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print("❌ Invalid token:", str(e))
        return None

"""

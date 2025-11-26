from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    last_password_change: Optional[datetime] = None
    password_change_count: Optional[int] = 0

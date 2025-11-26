from typing import Optional
from pydantic import BaseModel, EmailStr, constr

class UpdateProfileSchema(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]

class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: constr(min_length=8)
    confirm_password: str

"""

from pydantic import BaseModel, EmailStr, constr

class UpdateProfileSchema(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]

class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: constr(min_length=8)
    confirm_password: str
"""

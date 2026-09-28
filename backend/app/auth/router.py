from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.repository import Repository
from app.auth.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: str
    password: str
    organization: str = "Ayurveda IP Research Institute"
    role: str = "Regulatory Specialist"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    role: str

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    repo = Repository(db)
    existing = await repo.get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered.")

    hashed_pw = get_password_hash(req.password)
    user = await repo.create_user(
        email=req.email,
        hashed_password=hashed_pw,
        organization=req.organization,
        role=req.role
    )
    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, email=user.email, role=user.role)

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = Repository(db)
    user = await repo.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, email=user.email, role=user.role)

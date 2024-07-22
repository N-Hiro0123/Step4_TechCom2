from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
import pandas as pd

from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, insert, delete, update, select
import sqlalchemy

from DBControl.database import engine
from DBControl import models, schemas

import os
from dotenv import load_dotenv

# 環境変数のロード
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# パスワードのハッシュ化と検証
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


# userデータの登録
# def create_user_data(db: Session, form_data: Optional[schemas.UserInfo]):
#     mymodel = mymodels.UserDatas
#     hashed_password = pwd_context.hash(form_data.user_password)
#     values = {
#         "user_password": hashed_password,
#         "user_name": form_data.user_name,
#     }
#     stmt = insert(mymodel).values(values)

#     try:
#         # トランザクションを開始
#         with db.begin():
#             # データの挿入
#             db.execute(stmt)
#     except sqlalchemy.exc.IntegrityError:
#         print("挿入に失敗しました")
#         db.rollback()

#     finally:
#         # セッションを閉じる
#         db.close()

#     return {"message": "User created successfully", "status": 201}


def authenticate_user(db: Session, UserID: int, Password: str):
    mymodel = models.User
    stmt = select(mymodel).where(mymodel.UserID == UserID)

    user = db.execute(stmt).scalars().first()
    if user and verify_password(Password, user.Password):
        return user
    return None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    # "exp"に有効期限を入れておく
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # "exp"の有効期限について検証してくれる
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Payload:", payload)
        UserID = int(payload.get("UserID"))
        RoleID = int(payload.get("RoleID"))

        print("User ID:", UserID)
        if UserID is None:
            raise credentials_exception
        token_data = schemas.TokenData(UserID=UserID, RoleID=RoleID)
    except JWTError as e:
        print("JWT Error:", e)
        raise credentials_exception

    return token_data.UserID, token_data.RoleID


# ルーター設定
router = APIRouter()


# データベースセッションの取得
def get_db():
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# トークン取得エンドポイント
@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: schemas.UserPass, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.UserID, form_data.Password)  # OAuth2PasswordRequestFormは、username, passwordをキーとして持つ形式らしい
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"UserID": str(user.UserID), "RoleID": str(user.RoleID)}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


# @router.get("/user-info", response_model=schemas.UserInfoAll)
# async def read_user_info(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):

#     # token_data.user_idを使ってユーザー情報を取得
#     mymodel = mymodels.UserDatas
#     stmt = select(mymodel).where(mymodel.user_id == user_id)

#     user = db.execute(stmt).scalars().first()
#     if user is None:
#         return None
#     return schemas.UserInfoAll(user_id=user.user_id, UserID=user.user_name)


# @router.post("/user-info", response_model=schemas.CreateUserInfoRes)
# async def insert_user_info(form_data: schemas.UserInfo, db: Session = Depends(get_db)):
#     print(form_data)
#     result = create_user_data(db, form_data)

#     return result

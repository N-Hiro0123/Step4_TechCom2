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
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# OAuth2設定
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ユーザーIDとパスワードの確認
def authenticate_user(db: Session, UserID: int, Password: str):
    mymodel = models.User
    stmt = select(mymodel).where(mymodel.UserID == UserID)

    user = db.execute(stmt).scalars().first()
    if user and (Password == user.Password):  # フロントから渡されたハッシュ化済みのPasswordを直接比較
        return user
    return None


# アクセストークンの作成
def create_access_token(data: dict, expires_time: int):
    to_encode = data.copy()
    # 現在時刻＋expires_timeを有効期限とする
    expire = datetime.utcnow() + timedelta(minutes=expires_time)
    # "exp"に有効期限を入れておく
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user_role(token: str = Depends(oauth2_scheme)):
    # UserIDが確認できない時の例外処理
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # RoleIDが正しくない時の例外処理
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have sufficient permissions",
    )

    try:
        # "exp"の有効期限について検証してくれる
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # jwt内の情報を取り出す
        UserID = int(payload.get("UserID"))
        RoleID = int(payload.get("RoleID"))

        if UserID is None:
            raise credentials_exception
        if RoleID != 1:  # 管理者(RoleID=1)をチェック
            raise unauthorized_exception

        # UserIDとRoleIDをまとめたが使わないかも
        token_data = schemas.TokenData(UserID=UserID, RoleID=RoleID)

    except JWTError as e:
        print("JWT Error:", e)
        raise credentials_exception

    return token_data.RoleID


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
    user = authenticate_user(db, form_data.UserID, form_data.Password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"UserID": str(user.UserID), "RoleID": str(user.RoleID)},  # UserID, RoleIDをJWTに持たせる
        expires_time=ACCESS_TOKEN_EXPIRE_MINUTES,  # 60
    )
    return {"access_token": access_token, "token_type": "bearer"}

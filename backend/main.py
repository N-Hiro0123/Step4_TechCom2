import sys
import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Query, Request
from sqlalchemy import func, text
from sqlalchemy.dialects import sqlite
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from DBControl import models, schemas, database
from typing import List

from DBControl.auth import router as auth_router, get_current_user

app = FastAPI()

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ルーターのインクルード
app.include_router(auth_router)

# CORSの設定
origins = [
    "http://localhost:3000",  # Next.jsのデフォルトポート
    "http://127.0.0.1:3000",  # 追加オプション
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# データベース初期化の防止
database_file = './backend/DBControl/TC_dummy.db'
if not os.path.exists(database_file):
    models.Base.metadata.create_all(bind=database.engine)

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    fake_hashed_password = user.Password + "notreallyhashed"
    db_user = models.User(
        EmployeeCode=user.EmployeeCode,
        Password=fake_hashed_password,
        LastName=user.LastName,
        FirstName=user.FirstName,
        RoleID=user.RoleID,
        GenderID=user.GenderID,
        DateOfBirth=user.DateOfBirth,
        DepartmentID=user.DepartmentID,
        PositionID=user.PositionID,
        EmploymentTypeID=user.EmploymentTypeID,
        JoinDate=user.JoinDate,
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists")
    return db_user

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/admin/users", response_model=List[schemas.UserDisplay])
def get_users(db: Session = Depends(get_db)):
    try:
        users_query = (
            db.query(
                models.User.UserID,
                models.User.EmployeeCode,
                models.Department.DepartmentName,
                models.User.LastName,
                models.User.FirstName,
                models.User.DateOfBirth,
                models.User.JoinDate,
                models.Gender.GenderName,
                models.Role.RoleName,
                models.EmploymentType.EmploymentTypeName,
                models.Position.PositionName,
            )
            .join(models.Department, models.User.DepartmentID == models.Department.DepartmentID)
            .join(models.Gender, models.User.GenderID == models.Gender.GenderID)
            .join(models.Role, models.User.RoleID == models.Role.RoleID)
            .join(models.EmploymentType, models.User.EmploymentTypeID == models.EmploymentType.EmploymentTypeID)
            .join(models.Position, models.User.PositionID == models.Position.PositionID)
        )

        users = users_query.all()

        # デバッグ用ログ出力
        for user in users:
            logger.info(f"User fetched: {user}")

        return users
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 従業員検索用エンドポイント
@app.get("/admin/users/search", response_model=List[schemas.UserDisplay])
def search_users(
    EmployeeCode: str = Query(None),
    Name: str = Query(None),
    RoleName: str = Query(None),
    EmploymentTypeName: str = Query(None),
    DepartmentName: str = Query(None),
    PositionName: str = Query(None),  # PositionNameを追加
    db: Session = Depends(get_db)
):
    try:
        query = db.query(
            models.User.UserID,
            models.User.EmployeeCode,
            models.Department.DepartmentName,
            models.User.LastName,
            models.User.FirstName,
            models.User.DateOfBirth,
            models.User.JoinDate,
            models.Gender.GenderName,
            models.Role.RoleName,
            models.EmploymentType.EmploymentTypeName,
            models.Position.PositionName,  # PositionNameを追加
        ).join(models.Department, models.User.DepartmentID == models.Department.DepartmentID
        ).join(models.Gender, models.User.GenderID == models.Gender.GenderID
        ).join(models.Role, models.User.RoleID == models.Role.RoleID
        ).join(models.EmploymentType, models.User.EmploymentTypeID == models.EmploymentType.EmploymentTypeID
        ).join(models.Position, models.User.PositionID == models.Position.PositionID)  # PositionとJOIN

        if EmployeeCode:
            query = query.filter(models.User.EmployeeCode.contains(EmployeeCode))
        if Name:
            name_filter = f"%{Name.replace(' ', '')}%"
            query = query.filter(
                text("replace(lower(users.\"LastName\" || users.\"FirstName\"), ' ', '') LIKE lower(:name)")
            ).params(name=name_filter)
        if RoleName:
            query = query.filter(models.Role.RoleName == RoleName)
        if EmploymentTypeName:
            query = query.filter(models.EmploymentType.EmploymentTypeName == EmploymentTypeName)
        if DepartmentName:
            query = query.filter(models.Department.DepartmentName == DepartmentName)
        if PositionName:
            query = query.filter(models.Position.PositionName == PositionName)  # PositionNameでフィルター

        users = query.all()
        return users
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 従業員情報の取得
@app.get("/admin/users/{user_id}", response_model=schemas.UserDisplay)
def get_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = (
            db.query(
                models.User.UserID,
                models.User.EmployeeCode,
                models.Department.DepartmentName,
                models.User.LastName,
                models.User.FirstName,
                models.User.DateOfBirth,
                models.User.JoinDate,
                models.Gender.GenderName,
                models.Role.RoleName,
                models.EmploymentType.EmploymentTypeName,
                models.Position.PositionName,
            )
            .join(models.Department, models.User.DepartmentID == models.Department.DepartmentID)
            .join(models.Gender, models.User.GenderID == models.Gender.GenderID)
            .join(models.Role, models.User.RoleID == models.Role.RoleID)
            .join(models.EmploymentType, models.User.EmploymentTypeID == models.EmploymentType.EmploymentTypeID)
            .join(models.Position, models.User.PositionID == models.Position.PositionID)
            .filter(models.User.UserID == user_id)
            .first()
        )

        # デバッグ用ログ出力
        logger.info(f"User found: {user}")

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 表が表示されない問題用
from sqlalchemy.orm import joinedload

@app.get("/admin/users/test/{user_id}", response_model=schemas.UserDisplay)
def get_user_test(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(models.User).options(
            joinedload(models.User.gender),
            joinedload(models.User.role),
            joinedload(models.User.department),
            joinedload(models.User.position),
            joinedload(models.User.employment_type)
        ).filter(models.User.UserID == user_id).first()
        
        if user is None:
            logger.info(f"User with ID {user_id} not found")  # デバッグ用のログ
            raise HTTPException(status_code=404, detail="User not found")
        
        # 必要なフィールドを手動で作成
        response_user = schemas.UserDisplay(
            UserID=user.UserID,
            EmployeeCode=user.EmployeeCode,
            LastName=user.LastName,
            FirstName=user.FirstName,
            DateOfBirth=user.DateOfBirth,
            JoinDate=user.JoinDate,
            GenderName=user.gender.GenderName if user.gender else "N/A",
            RoleName=user.role.RoleName if user.role else "N/A",
            DepartmentName=user.department.DepartmentName if user.department else "N/A",
            PositionName=user.position.PositionName if user.position else "N/A",
            EmploymentTypeName=user.employment_type.EmploymentTypeName if user.employment_type else "N/A"
        )

        return response_user
    except Exception as e:
        logger.error(f"Error: {e}")  # エラーメッセージを表示
        raise HTTPException(status_code=500, detail=str(e))

# 従業員情報更新
@app.put("/admin/users/{user_id}", response_model=schemas.UserDisplay)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.UserID == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")

        db_user.LastName = user.LastName
        db_user.FirstName = user.FirstName
        db_user.GenderID = user.GenderID
        db_user.DateOfBirth = user.DateOfBirth
        db_user.JoinDate = user.JoinDate
        db_user.RoleID = user.RoleID
        db_user.DepartmentID = user.DepartmentID
        db_user.PositionID = user.PositionID
        db_user.EmploymentTypeID = user.EmploymentTypeID

        db.commit()
        db.refresh(db_user)

        response_user = schemas.UserDisplay(
            UserID=db_user.UserID,
            EmployeeCode=db_user.EmployeeCode,
            LastName=db_user.LastName,
            FirstName=db_user.FirstName,
            DateOfBirth=db_user.DateOfBirth,
            JoinDate=db_user.JoinDate,
            GenderName=db_user.gender.GenderName,
            RoleName=db_user.role.RoleName,
            DepartmentName=db_user.department.DepartmentName,
            PositionName=db_user.position.PositionName,
            EmploymentTypeName=db_user.employment_type.EmploymentTypeName
        )

        return response_user
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
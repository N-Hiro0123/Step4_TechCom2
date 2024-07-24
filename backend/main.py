import sys
import os

# パスを設定してモジュールをインポート可能にする
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'DBControl')))

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import func, text
from sqlalchemy.dialects import sqlite
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from DBControl import models, schemas, database
from typing import List

from DBControl.auth import router as auth_router, get_current_user

app = FastAPI()

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
        users = (
            db.query(
                models.User.UserID,
                models.User.EmployeeCode,
                models.Department.DepartmentName,
                models.User.LastName,
                models.User.FirstName,
                models.Gender.GenderName,
                models.Role.RoleName,
                models.EmploymentType.EmploymentTypeName,
            )
            .join(models.Department, models.User.DepartmentID == models.Department.DepartmentID)
            .join(models.Gender, models.User.GenderID == models.Gender.GenderID)
            .join(models.Role, models.User.RoleID == models.Role.RoleID)
            .join(models.EmploymentType, models.User.EmploymentTypeID == models.EmploymentType.EmploymentTypeID)
            .all()
        )
        return users
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 従業員検索用エンドポイント
@app.get("/admin/users/search", response_model=List[schemas.UserDisplay])
def search_users(
    EmployeeCode: str = Query(None),
    Name: str = Query(None),
    RoleName: str = Query(None),
    EmploymentTypeName: str = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(
            models.User.UserID,
            models.User.EmployeeCode,
            models.Department.DepartmentName,
            models.User.LastName,
            models.User.FirstName,
            models.Gender.GenderName,
            models.Role.RoleName,
            models.EmploymentType.EmploymentTypeName,
        ).join(models.Department, models.User.DepartmentID == models.Department.DepartmentID
        ).join(models.Gender, models.User.GenderID == models.Gender.GenderID
        ).join(models.Role, models.User.RoleID == models.Role.RoleID
        ).join(models.EmploymentType, models.User.EmploymentTypeID == models.EmploymentType.EmploymentTypeID)

        if EmployeeCode:
            query = query.filter(models.User.EmployeeCode.contains(EmployeeCode))
        if Name:
            name_filter_with_space = f"%{' '.join(Name)}%"
            name_filter_without_space = f"%{Name}%"
            query = query.filter(
                text("lower(users.\"LastName\" || ' ' || users.\"FirstName\") LIKE lower(:name_with_space) OR lower(users.\"LastName\" || users.\"FirstName\") LIKE lower(:name_without_space)")
            ).params(name_with_space=name_filter_with_space, name_without_space=name_filter_without_space)
        if RoleName:
            query = query.filter(models.Role.RoleName.contains(RoleName))
        if EmploymentTypeName:
            query = query.filter(models.EmploymentType.EmploymentTypeName.contains(EmploymentTypeName))

        users = query.all()
        return users
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

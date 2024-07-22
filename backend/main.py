from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError  # 追加
from fastapi.middleware.cors import CORSMiddleware
from DBControl import models, schemas, database
import os

app = FastAPI()

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
        JoinDate=user.JoinDate
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

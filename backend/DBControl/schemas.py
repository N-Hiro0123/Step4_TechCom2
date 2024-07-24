from pydantic import BaseModel
from typing import Optional
from datetime import date

class UserBase(BaseModel):
    EmployeeCode: str
    LastName: str
    FirstName: str
    GenderID: int
    DateOfBirth: date
    JoinDate: date
    RoleID: int
    DepartmentID: int
    PositionID: int
    EmploymentTypeID: int

class UserCreate(UserBase):
    Password: str

class User(UserBase):
    UserID: int

    class Config:
        orm_mode = True

class DepartmentBase(BaseModel):
    DepartmentName: str

class Department(DepartmentBase):
    DepartmentID: int
    users: list[User] = []

    class Config:
        orm_mode = True

class PositionBase(BaseModel):
    PositionName: str

class Position(PositionBase):
    PositionID: int
    users: list[User] = []

    class Config:
        orm_mode = True

class GenderBase(BaseModel):
    GenderName: str

class Gender(GenderBase):
    GenderID: int
    users: list[User] = []

    class Config:
        orm_mode = True

class EmploymentTypeBase(BaseModel):
    EmploymentTypeName: str

class EmploymentType(EmploymentTypeBase):
    EmploymentTypeID: int
    users: list[User] = []

    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    RoleName: str

class Role(RoleBase):
    RoleID: int
    users: list[User] = []

    class Config:
        orm_mode = True

class UserDisplay(BaseModel):
    UserID: int
    EmployeeCode: str
    LastName: str
    FirstName: str
    DateOfBirth: date
    JoinDate: date
    GenderName: str
    RoleName: str
    DepartmentName: str
    PositionName: str
    EmploymentTypeName: str

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    EmployeeCode: str
    Password: str
    LastName: str
    FirstName: str
    RoleID: int
    GenderID: int
    DateOfBirth: Optional[date]
    DepartmentID: int
    PositionID: int
    EmploymentTypeID: int
    JoinDate: Optional[date]

class UserUpdate(BaseModel):
    LastName: str
    FirstName: str
    GenderID: int
    DateOfBirth: date
    JoinDate: date
    RoleID: int
    DepartmentID: int
    PositionID: int
    EmploymentTypeID: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    UserID: int
    RoleID: int

class UserPass(BaseModel):
    UserID: int
    Password: str

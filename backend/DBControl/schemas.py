from pydantic import BaseModel
from datetime import date

class UserBase(BaseModel):
    EmployeeCode: str
    LastName: str
    FirstName: str
    RoleID: int
    GenderID: int
    DateOfBirth: date
    DepartmentID: int
    PositionID: int
    EmploymentTypeID: int
    JoinDate: date

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

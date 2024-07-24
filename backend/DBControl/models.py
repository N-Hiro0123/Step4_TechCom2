from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    UserID = Column(Integer, primary_key=True, index=True)
    EmployeeCode = Column(String(50), unique=True, index=True)
    Password = Column(String(255))
    LastName = Column(String(50))
    FirstName = Column(String(50))
    RoleID = Column(Integer, ForeignKey('roles.RoleID'))
    GenderID = Column(Integer, ForeignKey('genders.GenderID'))
    DateOfBirth = Column(Date)
    DepartmentID = Column(Integer, ForeignKey('departments.DepartmentID'))
    PositionID = Column(Integer, ForeignKey('positions.PositionID'))
    EmploymentTypeID = Column(Integer, ForeignKey('employmenttypes.EmploymentTypeID'))
    JoinDate = Column(Date)

    role = relationship("Role", back_populates="users")
    gender = relationship("Gender", back_populates="users")
    department = relationship("Department", back_populates="users")
    position = relationship("Position", back_populates="users")
    employment_type = relationship("EmploymentType", back_populates="users")


class Department(Base):
    __tablename__ = "departments"

    DepartmentID = Column(Integer, primary_key=True, index=True)
    DepartmentName = Column(String(100))

    users = relationship("User", back_populates="department")


class Position(Base):
    __tablename__ = "positions"

    PositionID = Column(Integer, primary_key=True, index=True)
    PositionName = Column(String(100))

    users = relationship("User", back_populates="position")


class Gender(Base):
    __tablename__ = "genders"

    GenderID = Column(Integer, primary_key=True, index=True)
    GenderName = Column(String(10))

    users = relationship("User", back_populates="gender")


class EmploymentType(Base):
    __tablename__ = "employmenttypes"

    EmploymentTypeID = Column(Integer, primary_key=True, index=True)
    EmploymentTypeName = Column(String(50))

    users = relationship("User", back_populates="employment_type")


class Role(Base):
    __tablename__ = "roles"

    RoleID = Column(Integer, primary_key=True, index=True)
    RoleName = Column(String(50))

    users = relationship("User", back_populates="role")

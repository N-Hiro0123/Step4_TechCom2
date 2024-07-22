import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'TC_dummy.db')}"  # 絶対パスで指定

# エンジンの作成
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# セッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラスの作成
Base = declarative_base()

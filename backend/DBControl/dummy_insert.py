import os
import sys
import pandas as pd
from sqlalchemy import create_engine

# モジュール検索パスに現在のディレクトリの親ディレクトリを追加
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from DBControl.models import Base, User, EmploymentType, Role, Department, Position, Gender

# データベースファイルのパス
db_path = './backend/DBControl/TC_dummy.db'

# データベースファイルの削除
if os.path.exists(db_path):
    os.remove(db_path)
    print("データベースファイルが削除されました。")

# エクセルファイルのパス
excel_file = 'backend/DBControl/techcon_sample_data.xlsx'  # 正確なファイルパスを指定

# SQLiteデータベースへの接続設定
db_url = 'sqlite:///backend/DBControl/TC_dummy.db'  # データベースに接続
engine = create_engine(db_url)

# テーブル作成
Base.metadata.create_all(engine)

# 各シートのデータを読み込み、対応するテーブルに書き込み
sheet_to_table = {'EmploymentTypes': 'employmenttypes', 'Roles': 'roles', 'Departments': 'departments', 'Positions': 'positions', 'Genders': 'genders', 'Users': 'users'}

# Pandasの型設定
dtype_settings = {'Users': {'EmployeeCode': str, 'DateOfBirth': str, 'JoinDate': str}}

for sheet_name, table_name in sheet_to_table.items():
    df = pd.read_excel(excel_file, sheet_name=sheet_name, dtype=dtype_settings.get(sheet_name, {}))

    # 日付カラムの変換
    if sheet_name == 'Users':
        df['DateOfBirth'] = pd.to_datetime(df['DateOfBirth'], errors='coerce').dt.date
        df['JoinDate'] = pd.to_datetime(df['JoinDate'], errors='coerce').dt.date

    df.to_sql(table_name, con=engine, if_exists='replace', index=False)

print("Data imported successfully")

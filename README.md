# Step4_TechCom2

## アプリ概要

- フロントエンド：Next.js、バックエンドをFastAPI、データベースにSQLiteを使用した、管理者がユーザー情報を確認修正するアプリ

## 準備

- バックエンド

  - python仮想環境に対して、requirements.txtの内容をインストール
    - pip install -r requirements.txt
  - /backendに、.envファイルを作成
    - JWT認証の設定
      - SECRET_KEY
      - ALGORITHM
      - ACCESS_TOKEN_EXPIRE_MINUTES

- フロントエンド
  - /frontendにおいて、"npm install"を実行し、package.jsonの内容をインストール
  - /frontendに、.env.localファイルを作成
    - バックエンドのURLの設定
      - NEXT_PUBLIC_API_ENDPOINT

## 実行方法

- バックエンドの立ち上げ
  - /backendにおいて、"uvicorn main:app --reload"
- フロントエンドの立ち上げ
  - /frontendにおいて、"npm run dev"
- webブラウザでフロントエンドにアクセス
  - /login：ログイン画面
    - 管理者権限を持ったアカウントでログインしてください
      - 例）UserID=1
  - /admin/users：ユーザー検索と一覧表示
  - /admin/[user_id]：ユーザー情報の編集
    - ログイン画面から遷移して確認ください
    - 各ページは表示する際に、JWTに含まれる権限情報の確認しており、持たない場合はログイン画面へ遷移するようになっています。

## その他

- ダミーDBの作成方法について
  - ルートディレクトリから以下の実行
    - python backend/DBControl/dummy_insert.py
      - backend/DBControl/TC_dummy.dbを作成します
      - backend/DBControl/techcon_sample_data.xlsxの内容を挿入しています

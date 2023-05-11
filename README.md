# ses-lambda | Lambda 開発環境整備リポジトリ

## 概要

AWS の Lambda 開発をラクにできる様にするために色々試したリポジトリ

## 使用している技術

- node.js v18
- AWS CLI v2
- AWS ECR(Elastic Container Registry)
- AWS Lambda
- AWS SES(Simple Email Service)
- Docker
- docker-compose
- localstack

## 環境変数

### 設定する必要があるもの

**`export`コマンド等で設定**<br>

- `AWS_ACCOUNT_ID`: AWS のアカウント ID
- `AWS_REGION`: AWS のリージョン情報

**`.env`ファイルに記述**(`.env`は`app`ディレクトリに配置してください)

- `EMAIL_ADMIN`: SES でのメールの送信時に使用する宛先アドレス、送信先アドレス

### 設定する必要がないもの

`LOCALSTACK_HOSTNAME`: LocalStack の Lambda を使用した場合に設定されている環境変数、AWS のエンドポイントとして localstack を指定する場合に使用する

## 環境構築

### 依存関係周り

`app`ディレクトリへ移動

```bash
cd app
```

パッケージのインストール

```bash
npm i
```

### コンテナ準備

LocalStack CLI の`localstack`, `awslocal`コマンドはインストール済みの前提とします。未インストールの場合以下のリンクを参照してください。

`localstack`コマンドインストール方法(公式): https://docs.localstack.cloud/getting-started/installation/#installation

`awslocal`コマンドインストール方法(公式): https://docs.localstack.cloud/user-guide/integrations/aws-cli/#installation

`app`ディレクトリへ移動

```bash
cd app
```

`docker-compose`で LocalStack コンテナ立ち上げ

```bash
docker-compose up -d
```

## ファイル構成

`ses-lambda`<br>
`app`<br>
|- `shells`<br>
| |- `ecr`: 本番環境へのイメージのビルド&デプロイ用シェルスクリプトを置いてるディレクトリ、詳細は本番環境へのビルドデプロイ項目に記載<br>
| |- `localstack`: LocalStack 環境への関数の作成、更新、実行用シェルスクリプトを置いてるディレクトリ、詳細は本番環境へのビルドデプロイ項目に記載<br>
|- `docker-compose.yml`: LocalStack 環境構築用 docker-compose ファイル<br>
|- `Dockerfile`: 本番環境 Lambda で動作するイメージ作成用 Dockerfile<br>
|- `index.mjs`: エントリポイント、主な処理はここで実行<br>
|- `validation.mjs`: バリデーションチェック用モジュール<br>

## 実行

`app` ディレクトリ直下での実行が前提になります。

- `app/shells/localstack`: ローカル環境での検証用のスクリプト置き場
- `app/shells/lambda`: 本番 AWS 環境へのビルド&デプロイスクリプト置き場
- `app/shells/ecr`: リアル AWS 環境での検証用スクリプト置き場

### ローカルでの検証

**`app/shells/localstack`**

シンプル(別スクリプト統合していない)なスクリプト

- `create-func-localstack.sh`: 関数の作成
- `update-func-localstack.sh`: 関数の更新
- `invoke-func-localstack.sh`: 関数の実行

別スクリプトを統合したスクリプト

- `create-invoke-localstack.sh`: 関数の作成、実行 (作成時に関数の Status が Pending 状態になるため実行は失敗する)
- `update-invoke-localstack.sh`: 関数の更新、実行

### 本番環境へのビルドデプロイ(zip ファイル)

**`app/shells/lambda`**

シンプル(別スクリプト統合していない)なスクリプト

- `create-func-lambda.sh`: 関数の作成
- `update-func-lambda.sh`: 関数の更新
- `invoke-func-lambda.sh`: 関数の実行

別スクリプトを統合したスクリプト

- `update-invoke-lambda.sh`: 関数の更新、実行

### 本番環境へのビルドデプロイ(Docker イメージ)

シンプル(別スクリプト統合していない)なスクリプト

- `app/shells/ecr/build-handler-image.sh`: Docker イメージのビルド
- `app/shells/ecr/deploy-handler-aws-ecr.sh`: 本番環境 ECR へのデプロイ

別スクリプトを統合したスクリプト

- `build-deploy-lambda-image-aws-ecr.sh`: Docker イメージのビルド、ECR へのデプロイ

その後

- AWS コンソールにログインして Lambda にアクセス、新しいイメージのデプロイから latest バージョンを設定

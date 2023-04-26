# ses-lambda | Lambda 開発環境整備リポジトリ

## 概要

AWS の Lambda 開発をラクにできる様にするために色々試したリポジトリ

## 使用している技術

- node.js v18
- AWS CLI v2
- AWS Lambda
- AWS SES(Simple Email Service)
- Docker
- docker-compose
- localstack

## 環境変数

### 設定する必要があるもの

**`export`コマンド等で設定**<br>
`AWS_ACCOUNT_ID`: AWS のアカウント ID<br>
`AWS_REGION`: AWS のリージョン情報

**`.env`ファイルに記述**(`.env`は`app`ディレクトリに配置してください)<br>
`EMAIL_ADMIN`: SES でのメールの送信時に使用する宛先アドレス、送信先アドレス

### 設定する必要がないもの

`LOCALSTACK_HOSTNAME`: localstack の Lambda を使用した場合に設定されている環境変数、AWS のエンドポイントとして localstack を指定する場合に使用する

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

`localstack`コマンドインストール方法(公式): https://docs.localstack.cloud/getting-started/installation/#installation<br>
`awslocal`コマンドインストール方法(公式): https://docs.localstack.cloud/user-guide/integrations/aws-cli/#installation

`app`ディレクトリへ移動

```bash
cd app
```

`docker-compose`で LocalStack コンテナ立ち上げ

```bash
docker-compose up -d
```

## 実行

### ローカルでの検証

`app/shells/localstack`: ローカル環境での検証用のスクリプト置き場
`app/shells/ecr`: リアル AWS 環境での検証用スクリプト置き場

**`app/shells/localstack`**

シンプル(別スクリプト統合していない)なスクリプト<br>
`create-func-localstack.sh`: 関数の作成<br>
`update-func-localstack.sh`: 関数の更新<br>
`create-invoke-localstack.sh`: 関数の実行

別スクリプトを統合したスクリプト<br>
`create-invoke-localstack.sh`: 関数の作成、実行 (作成時に関数の Status が Pending 状態になるため実行は失敗する)<br>
`update-func-localstack.sh`: 関数の更新、実行

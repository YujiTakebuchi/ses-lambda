#!/bin/bash

zip -r app.zip . -x "Dockerfile" "package*.json" "*.log" "*.yml" "*.sh"
aws lambda create-function --region ap-northeast-1 --function-name ses-lambda --zip-file fileb://app.zip --role $AWS_ROLE_ARN --handler index.handler --runtime nodejs18.x
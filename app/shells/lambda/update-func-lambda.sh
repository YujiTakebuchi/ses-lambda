#!/bin/bash

zip -r app.zip . -x "Dockerfile" "package*.json" "*.log" "*.yml" "*.sh"
awslocal lambda update-function-code --function-name ses-lambda --region ap-northeast-1 --zip-file fileb://app.zip
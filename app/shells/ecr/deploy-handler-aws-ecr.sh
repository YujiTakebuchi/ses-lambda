#!/bin/bash

REGION=$AWS_REGION
ACCOUNT_ID=$AWS_ACCOUNT_ID

ECR_PATH="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

docker tag ses-lambda:latest "${ECR_PATH}/ses-lambda:latest"
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_PATH
docker push "${ECR_PATH}/ses-lambda:latest"
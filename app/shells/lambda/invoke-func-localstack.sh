#!/bin/bash

while (( $# > 0 ))
do
case $1 in
    --payload | --payload=*)
    if [[ "$1" =~ ^--payload= ]]; then
        PAYLOAD=$(echo $1 | sed -e 's/^--payload=//')
    elif [[ -z "$2" ]] || [[ "$2" =~ ^-+ ]]; then
        echo "'payload' requires an argument." 1>&2
        exit 1
    else
        PAYLOAD="--payload '$2' --cli-binary-format raw-in-base64-out"
        shift
    fi
    ;;
esac
shift
done

if [ -n "$PAYLOAD" ]; then
    `echo awslocal lambda invoke --function-name ses-lambda --region ap-northeast-1 ${PAYLOAD} result.log`
else
    awslocal lambda invoke --function-name ses-lambda --region ap-northeast-1 result.log
fi
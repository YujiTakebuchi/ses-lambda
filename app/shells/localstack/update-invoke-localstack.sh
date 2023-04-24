#!/bin/bash

while (( $# > 0 ))
do
  case $1 in
    --paylaod | --payload=*)
      if [[ "$1" =~ ^--paylaod= ]]; then
        PAYLOAD=$(echo $1 | sed -e 's/^--paylaod=//')
      elif [[ -z "$2" ]] || [[ "$2" =~ ^-+ ]]; then
        echo "'paylaod' requires an argument." 1>&2
        exit 1
      else
        PAYLOAD="--payload $2"
        shift
      fi
      ;;
  esac
  shift
done

./shells/localstack/update-func-localstack.sh
./shells/localstack/invoke-func-localstack.sh $PAYLOAD
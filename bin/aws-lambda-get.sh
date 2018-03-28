#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-lambda-get <function-name>"
    exit
fi
if [ -d $1 ]; then
    echo "aws-lambda-get: The directory named $1 already exists. To retry, remove or rename it."
    exit
fi

NAME=$1
JSON=${NAME}.json
ZIP=${NAME}.zip

mkdir ${NAME}
aws lambda get-function --function-name $1 > ${JSON}
curl -o $1.zip `query-json 'Code.Location' < ${JSON}`
unzip ${ZIP} -d ${NAME}/

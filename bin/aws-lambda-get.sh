#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-lambda-get <function-name>"
    exit
fi
if [ -d $1 ]; then
    echo "aws-lambda-get: The directory named $1 already exists. To retry, remove or rename it."
    exit
fi
mkdir $1
mkdir $1/.aws-lambda-get
aws lambda get-function --function-name $1 > $1/.aws-lambda-get/info.json
curl -o $1/.aws-lambda-get/download.zip `node -e "require('aws-lambda').echoZipLoc('$1/.aws-lambda-get/info.json')"`
unzip $1/.aws-lambda-get/download.zip -d $1/
rm -rf $1/.aws-lambda-get

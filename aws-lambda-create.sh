#!/bin/sh
if [ "$1" = "" ]; then
    echo "aws-lambda-create: function-name and role are required"
    echo "usage: aws-lambda-create <function-name> <role>"
    exit
fi
if [ "$2" = "" ]; then
    echo "aws-lambda-create: role is required"
    echo "usage: aws-lambda-create <function-name> <role>"
    exit
fi
cd $1
if [ -e .onupload.sh ]; then
    sh .onupload.sh
fi
zip -r ../$1.zip *
cd ..
aws lambda create-function --function-name $1 --runtime nodejs --role $2 --handler index.handler --zip-file fileb://$1.zip
rm $1.zip

#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-lambda-upload <function-name>"
    exit
fi
cd $1
if [ -e .onupload.sh ]; then
    sh .onupload.sh
fi
zip -r ../$1.zip *
cd ..
aws lambda update-function-code --function-name $1 --zip-file fileb://$1.zip
rm $1.zip

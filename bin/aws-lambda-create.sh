#!/bin/sh
# remove slash from function-name
fname=`echo "$1" | sed -e "s|/||g"`

if [ "${fname}" = "" ]; then
    echo "aws-lambda-create: function-name and role are required"
    echo "usage: aws-lambda-create <function-name> <role>"
    exit
fi

# Check the function-name exists as directory
if [ ! -e ${fname} ]; then
    echo "error: directory ${fname} not found"
    exit
fi
if [ "$2" = "" ]; then
    echo "aws-lambda-create: role is required"
    echo "usage: aws-lambda-create <function-name> <role>"
    exit
fi
cd ${fname}
if [ -e .onupload.sh ]; then
    sh .onupload.sh
fi
zip -r ../${fname}.zip *
cd ..
aws lambda create-function --function-name ${fname} --runtime nodejs --role $2 --handler index.handler --zip-file fileb://${fname}.zip
rm ${fname}.zip

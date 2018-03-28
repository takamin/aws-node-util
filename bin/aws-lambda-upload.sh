#!/bin/sh
# remove slash from function-name
fname=`echo "$1" | sed -e "s|/||g"`

if [ "${fname}" = "" ]; then
    echo "usage: aws-lambda-upload <function-name>"
    exit
fi

# Check the function-name exists as directory
if [ ! -e ${fname} ]; then
    echo "error: directory ${fname} not found"
    exit
fi
cd ${fname}
zip -r ../${fname}.zip *
cd ..
aws lambda update-function-code --function-name ${fname} --zip-file fileb://${fname}.zip
rm ${fname}.zip

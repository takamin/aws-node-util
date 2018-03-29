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
type zip > /dev/null 2>&1
if [[ $? == 0 ]]; then
    ZIP='zip'
else
    type 7z > /dev/null 2>&1
    if [[ $? == 0 ]]; then
        ZIP='7z u'
    else
        echo "Error: Either zip and 7z are not found or unavailable."
        exit 1;
    fi
fi

rm -f ../${fname}.zip
${ZIP} -r ../${fname}.zip *

cd ..
aws lambda update-function-code --function-name ${fname} --zip-file fileb://${fname}.zip
if [[ $? == 0 ]]; then
    rm ${fname}.zip
fi

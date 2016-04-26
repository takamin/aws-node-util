#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-dynamodb-tbldesc2create <table-name>"
    exit
fi
aws dynamodb describe-table --table-name $1 > $1.json
node -e "require('aws-dynamodb').putCreateTableJson('$1.json')"
rm $1.json

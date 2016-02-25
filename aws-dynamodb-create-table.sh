#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-dynamodb-create-table <table-definition-filename>"
    exit
fi
if [ -e $1 ]; then
    aws dynamodb create-table --cli-input-json file://$1
else
    echo "aws-dynamodb-create-table file not found: $1"
    exit
fi

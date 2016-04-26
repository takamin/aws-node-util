#!/bin/sh
if [ "$1" = "" ]; then
    echo "usage: aws-dynamodb-delete-table <table-name>"
    exit
fi
aws dynamodb delete-table --table-name $1


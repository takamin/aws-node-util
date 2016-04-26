#!/bin/sh
aws lambda get-function --function-name $1 > f.json
if [ $? -ne 0 ]; then
    rm f.json
    exit 1
fi
node -e "
    require('fs').readFile('f.json', function(err, data) {
        if(err) { console.error(err); return 1; }
        console.log(JSON.parse(data).Configuration.FunctionArn);
    });
" $1
if [ $? -ne 0 ]; then
    rm f.json
    exit 1
fi
rm f.json
exit 0

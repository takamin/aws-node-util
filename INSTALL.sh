DSTBIN=~/bin
NODE_MODULE=~/node_modules
install aws-lambda-get.sh ${DSTBIN}/aws-lambda-get
install aws-lambda-create.sh ${DSTBIN}/aws-lambda-create
install aws-lambda-upload.sh ${DSTBIN}/aws-lambda-upload
install aws-apigw-describe-all.js ${DSTBIN}/aws-apigw-describe-all
install aws-dynamodb-tbldesc2create.sh ${DSTBIN}/aws-dynamodb-tbldesc2create
install aws-dynamodb-create-table.sh ${DSTBIN}/aws-dynamodb-create-table
install aws-dynamodb-delete-table.sh ${DSTBIN}/aws-dynamodb-delete-table
install node_modules/aws-lambda.js ${NODE_MODULE}
install node_modules/aws-dynamodb.js ${NODE_MODULE}
install node_modules/awscli.js ${NODE_MODULE}
install node_modules/aws-apigateway.js ${NODE_MODULE}

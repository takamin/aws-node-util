DSTBIN=~/bin
NODE_MODULE=~/node_modules
install aws-lambda-get.sh ${DSTBIN}/aws-lambda-get
install aws-lambda-create.sh ${DSTBIN}/aws-lambda-create
install aws-lambda-upload.sh ${DSTBIN}/aws-lambda-upload

install aws-iam-list-roles.js ${DSTBIN}/aws-iam-list-roles
install aws-iam-get-role.js ${DSTBIN}/aws-iam-get-role
install aws-iam-create-role.js ${DSTBIN}/aws-iam-create-role
install aws-iam-attach-role-policy.js ${DSTBIN}/aws-iam-attach-role-policy

install aws-apigw-describe-all.js ${DSTBIN}/aws-apigw-describe-all

install aws-dynamodb-tbldesc2create.sh ${DSTBIN}/aws-dynamodb-tbldesc2create
install aws-dynamodb-create-table.sh ${DSTBIN}/aws-dynamodb-create-table
install aws-dynamodb-delete-table.sh ${DSTBIN}/aws-dynamodb-delete-table

install node_modules/cli.js ${NODE_MODULE}
install node_modules/awscli.js ${NODE_MODULE}
install node_modules/aws-lambda.js ${NODE_MODULE}
install node_modules/aws-iam.js ${NODE_MODULE}
install node_modules/aws-dynamodb.js ${NODE_MODULE}
install node_modules/aws-apigateway.js ${NODE_MODULE}

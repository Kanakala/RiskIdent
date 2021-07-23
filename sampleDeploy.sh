export AWS_ACCESS_KEY_ID=AKIA*************
export AWS_SECRET_ACCESS_KEY=mVlUKW3s*************
export AWS_REGION=us-east-1
export YOUR_BUCKET=YOUR_BUCKET
export ENVIRONMENT=dev
npm run build
sam deploy -t cloudformation/handlers/transactions.yaml --stack-name transactions --s3-bucket ${YOUR_BUCKET} --parameter-overrides ENVIRONMENT=${ENVIRONMENT} --capabilities CAPABILITY_IAM
say "Deployed"

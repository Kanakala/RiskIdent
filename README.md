# RiskIdent backend

- In order to develop the solution, I've leveraged AWS' serverless tools (Lambda & APIGateway) and deployed it using SAM and CloudFormation templates as IAC.
- The entire application is written using typescript and used webpack in order to transform & bundle the ts files to js files.
- After deploying through `bash deploy.sh` command, we can get the endpoint url in the termina as an output.

## End Point

* `https://pgd6dq57y2.execute-api.us-east-1.amazonaws.com/Prod/transactions?transactionId=5c868b22eb7069b50c6d2d32&confidenceLevel=0.9` 

## Useful commands

* `npm install` first
* `bash deploy.sh` to deploy our code to AWS as a lambda endpoint
* `npm run watch` to build on change
* `npm run lint` to check code style
* `npm run test` to test the code
* `sam validate -t cloudformation/handlers/transactions.yaml` to check our cfn template

## Output

* Deployment Output:

![Deployment Output](https://www.linkpicture.com/q/Screenshot-2021-07-23-at-12.14.34-PM.png)


* API Response:

![API Response](https://www.linkpicture.com/q/Screenshot-2021-07-23-at-12.14.45-PM.png)

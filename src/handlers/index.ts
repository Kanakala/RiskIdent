import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { get } from 'lodash';
import { Transaction } from '../services';
import { baseHandler } from '../utils/handlerUtil';

export class Handlers {
  static async getTransactions(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return baseHandler(event, Transaction, 'getTransactions', 'transactions', [
      get(event.queryStringParameters, 'transactionId', ''),
      get(event.queryStringParameters, 'confidenceLevel', ''),
    ]);
  }
}

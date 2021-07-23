import { APIGatewayProxyEvent } from 'aws-lambda';
import { resolve } from 'path';
import { Handlers } from '../src/handlers';
import logger from '../src/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const { getTransactions } = Handlers;

describe('Transactions Test', () => {
  test('Fail if there is no transactionId or confidenceLevel', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { transactionId: '5c868b22eb7069b50c6d2d32' },
    } as unknown as APIGatewayProxyEvent;
    const testResp = await getTransactions(event);
    logger.info(`testResp is:  ${JSON.stringify(testResp)}`);
    expect(testResp).toHaveProperty('body', 'Please provide transactionId & confidenceLevel');
    expect(testResp).toHaveProperty('statusCode', 500);
    expect(testResp).toHaveProperty('headers', {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    });
  });

  test('Fail if the confidenceLevel > 1', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { transactionId: '5c868b22eb7069b50c6d2d32', confidenceLevel: 2 },
    } as unknown as APIGatewayProxyEvent;
    const testResp = await getTransactions(event);
    logger.info(`testResp is:  ${JSON.stringify(testResp)}`);
    expect(testResp).toHaveProperty('body', 'ConfidenceLevel must be greater than 0 and less than 1');
    expect(testResp).toHaveProperty('statusCode', 500);
    expect(testResp).toHaveProperty('headers', {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    });
  });

  test('Fail if there is no transaction', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { transactionId: '1234567890987654321', confidenceLevel: 1 },
    } as unknown as APIGatewayProxyEvent;
    const testResp = await getTransactions(event);
    logger.info(`testResp is:  ${JSON.stringify(testResp)}`);
    expect(testResp).toHaveProperty('body', 'Cannot find the transaction with the given id');
    expect(testResp).toHaveProperty('statusCode', 500);
    expect(testResp).toHaveProperty('headers', {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    });
  });

  test('getTransactions', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { transactionId: '5c868b22eb7069b50c6d2d32', confidenceLevel: 0.9 },
    } as unknown as APIGatewayProxyEvent;
    const testResp = await getTransactions(event);
    logger.info(`testResp is:  ${JSON.stringify(testResp)}`);
    expect(testResp).toHaveProperty('body');
    expect(testResp).toHaveProperty('statusCode', 200);
    expect(testResp).toHaveProperty('headers', {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    });
    const testData = JSON.parse(testResp.body).data.transactions;
    expect(testData).toHaveLength(12);
  });

  test('getTransactions', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: { transactionId: '5c868b22eb7069b50c6d2d32', confidenceLevel: 0.9 },
    } as unknown as APIGatewayProxyEvent;
    const testResp = await getTransactions(event);
    logger.info(`testResp is:  ${JSON.stringify(testResp)}`);
    expect(testResp).toHaveProperty('body');
    expect(testResp).toHaveProperty('statusCode', 200);
    expect(testResp).toHaveProperty('headers', {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    });
    const testData = JSON.parse(testResp.body).data.transactions;
    expect(testData).toHaveLength(12);
    const expectedResp = fs.readFileSync(resolve(__dirname, 'fixtures.json'));
    expect(testData).toEqual(JSON.parse(expectedResp));
  });
});

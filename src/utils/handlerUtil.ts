import logger from '../utils/logger';

import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

export const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
};

interface customError {
  statusCode: number;
  message: string;
}

interface customErrorResponse {
  statusCode: number;
  body: string;
  headers: typeof headers;
}

export const handleError = (error: customError): customErrorResponse => {
  return {
    statusCode: error.statusCode || 500,
    body: error.message || JSON.stringify(error),
    headers,
  };
};

export const baseHandler = async (
  event: APIGatewayProxyEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  serviceClass: any,
  serviceMethod: string,
  entityName: string,
  params: Array<string> = [],
): Promise<APIGatewayProxyResult> => {
  try {
    const serviceInit = new serviceClass();
    const finalData = await serviceInit[serviceMethod](...params);
    logger.info(`Final Response: ${JSON.stringify(finalData)}`);
    return {
      body: JSON.stringify({ data: { [`${entityName}`]: finalData } }),
      statusCode: 200,
      headers,
    };
  } catch (error) {
    return handleError(error);
  }
};

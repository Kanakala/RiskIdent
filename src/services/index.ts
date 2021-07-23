import { get } from 'lodash';
import { resolve } from 'path';
import logger from '../utils/logger';
import { ITransaction } from '../interfaces';
import '../datasources/data.json';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

export class Transaction {
  private readFile() {
    const data = fs.readFileSync(
      process.env.LAMBDA_TASK_ROOT ? resolve('./data.json') : resolve(__dirname, '../datasources/data.json'),
    );
    return JSON.parse(data);
  }

  private findTransaction(transactionId: string): ITransaction {
    const data = this.readFile();
    while (data.length) {
      const node = data.shift();
      if (node.id === transactionId) return node;
      node.children && data.push(...node.children);
    }
    return null;
  }

  private transformChildren(
    children: ITransaction[] = [],
    parentTypes: string[] = [],
    confidenceLevel: number,
    parentConfidence = 1,
    flattenedTransactions: ITransaction[],
  ): ITransaction[] {
    children
      .filter((child: ITransaction) => get(child, 'connectionInfo.confidence', 0) * parentConfidence >= confidenceLevel)
      .forEach((child: ITransaction) => {
        const tempChild = { ...child };
        delete tempChild.children;
        const childConfidence = get(child, 'connectionInfo.confidence', 0);
        const combinedConfidence = parentConfidence * childConfidence;
        tempChild.combinedConnectionInfo = {
          types: [get(child, 'connectionInfo.type', ''), ...parentTypes].filter((type: string) => !!type),
          confidence: parseFloat(combinedConfidence.toFixed(2)),
        };
        flattenedTransactions.push(tempChild);
        return this.transformChildren(
          child.children,
          get(tempChild, 'combinedConnectionInfo.types', []),
          confidenceLevel,
          childConfidence,
          flattenedTransactions,
        );
      });
    return flattenedTransactions;
  }

  private transformTransaction(transaction: ITransaction, confidenceLevel: number): ITransaction[] {
    try {
      const tempTrans = { ...transaction };
      delete tempTrans.children;
      delete tempTrans.connectionInfo;
      const flattenedTransactions = [tempTrans];
      this.transformChildren(transaction.children, [], confidenceLevel, 1, flattenedTransactions);
      return flattenedTransactions;
    } catch (err) {
      logger.error(`err: ${err}`);
      throw err;
    }
  }

  public async getTransactions(transactionId: string, confidenceLevel: number): Promise<ITransaction[]> {
    try {
      if (!transactionId || (confidenceLevel !== 0 && !confidenceLevel)) {
        const err = 'Please provide transactionId & confidenceLevel';
        logger.error(`err: ${err}`);
        throw Error(err);
      }
      if (confidenceLevel > 1 || confidenceLevel < 0) {
        const err = 'ConfidenceLevel must be greater than 0 and less than 1';
        logger.error(`err: ${err}`);
        throw Error(err);
      }

      const transaction = this.findTransaction(transactionId);
      if (!transaction) {
        const err = 'Cannot find the transaction with the given id';
        logger.error(`err: ${err}`);
        throw Error(err);
      }

      return this.transformTransaction(transaction, confidenceLevel);
    } catch (err) {
      logger.error(`err: ${err}`);
      throw err;
    }
  }
}

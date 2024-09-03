import type { Pool, PoolClient } from 'pg';
import { randomBytes } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace TransactionRunner {
  export interface Stats {
    /**
     * Time it took the runner to obtain an available database client. Time
     * is given in milliseconds. If missing the query failed to obtain a
     * client. Defaults to -1. (no connection time)
     */
    connectionTime: number;
    /**
     * Time it took the runner to execute the query. Time is given in
     * milliseconds. If missing the query failed to execute.
     * Defaults to -1. (no execution time)
     */
    executionTime: number;
    /**
     * The number of queries executed in the transaction.
     */
    queryCount: number;
  }

  export interface Logger {
    logTransactionRollback: (transactionId: string, stats: Stats) => void;

    logTransactionStart: (transactionId: string) => void;

    logTransactionCommit: (transactionId: string, stats: Stats) => void;
  }
}

export class TransactionRunner {
  private static readonly TRANSACTION_ID_LENGTH = 8;

  public client?: PoolClient;

  public readonly stats: TransactionRunner.Stats = {
    queryCount: 0,
    connectionTime: -1,
    executionTime: -1,
  };

  public readonly transactionId = TransactionRunner.generateTransactionId();

  private readonly pool: Pool;

  private readonly logger: TransactionRunner.Logger;

  public constructor(pool: Pool, logger: TransactionRunner.Logger) {
    this.pool = pool;
    this.logger = logger;
  }

  private static generateTransactionId(): string {
    // Generate random short string
    return randomBytes(TransactionRunner.TRANSACTION_ID_LENGTH)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, TransactionRunner.TRANSACTION_ID_LENGTH);
  }

  public async start(): Promise<void> {
    if (this.client) {
      throw new Error('Transaction already started');
    }
    this.client = await this.pool.connect();
    await this.client.query('BEGIN');
    this.logger.logTransactionStart(this.transactionId);
  }

  public async commit(): Promise<void> {
    if (!this.client) {
      throw new Error('Transaction not started or already committed');
    }
    await this.client.query('COMMIT');
    this.client.release();
    this.logger.logTransactionCommit(this.transactionId, this.stats);
    this.client = undefined;
  }

  public async rollback(): Promise<void> {
    if (!this.client) {
      throw new Error('Transaction not started or already rolled back');
    }
    await this.client.query('ROLLBACK');
    this.client.release();
    this.logger.logTransactionRollback(this.transactionId, this.stats);
    this.client = undefined;
  }
}

import type { Pool, PoolClient } from 'pg';
import type { TransactionLogger } from './transaction-logger';
import { TransactionStats } from './transaction-stats';
import { randomBytes } from 'crypto';

export class TransactionRunner {
  private static readonly TRANSACTION_ID_LENGTH = 8;

  public client?: PoolClient;

  public readonly stats = new TransactionStats();

  public readonly transactionId = TransactionRunner.generateTransactionId();

  private readonly pool: Pool;

  private readonly logger: TransactionLogger;

  public constructor(pool: Pool, logger: TransactionLogger) {
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

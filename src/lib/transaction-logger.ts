import type { TransactionStats } from './transaction-stats';

export interface LoggerDriver {
  log: (message: string, messagePayload: Record<string, unknown>) => void;
  error: (message: string, messagePayload: Record<string, unknown>) => void;
}

export class TransactionLogger {
  public static readonly MESSAGE_TYPES = {
    TRANSACTION_STARTED: 'pg:transactionStarted',
    TRANSACTION_COMMITTED: 'pg:transactionCommitted',
    TRANSACTION_ROLLED_BACK: 'pg:transactionRolledBack',
  } as const;

  protected readonly driver: LoggerDriver;

  public constructor(driver: LoggerDriver) {
    this.driver = driver;
  }

  public logTransactionRollback(
    transactionId: string,
    stats: TransactionStats,
  ): void {
    this.driver.log(`Rolled back postgres transaction: ${transactionId}`, {
      pg: {
        type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_ROLLED_BACK,
        transactionId,
        stats,
      },
    });
  }

  public logTransactionStart(transactionId: string): void {
    this.driver.log(`Started postgres transaction: ${transactionId}`, {
      pg: {
        type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_STARTED,
        transactionId,
      },
    });
  }

  public logTransactionCommit(
    transactionId: string,
    stats: TransactionStats,
  ): void {
    this.driver.log(`Committed postgres transaction: ${transactionId}`, {
      pg: {
        type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_COMMITTED,
        transactionId,
        stats,
      },
    });
  }
}

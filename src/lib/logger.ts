import type { QueryConfig } from '@kilbergr/pg-sql';
import type { Datasource } from './datasource';
import type { QueryRunner } from './query-runner';
import type { TransactionRunner } from './transaction-runner';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace PgLogger {
  export interface TransactionRollbackMessage {
    type: typeof PgLogger.MESSAGE_TYPES.TRANSACTION_ROLLED_BACK;
    transactionId: string;
    stats: TransactionRunner.Stats;
  }

  export interface TransactionStartMessage {
    type: typeof PgLogger.MESSAGE_TYPES.TRANSACTION_STARTED;
    transactionId: string;
  }

  export interface TransactionCommitMessage {
    type: typeof PgLogger.MESSAGE_TYPES.TRANSACTION_COMMITTED;
    transactionId: string;
    stats: TransactionRunner.Stats;
  }

  export interface QueryExecutedMessage {
    type: typeof PgLogger.MESSAGE_TYPES.QUERY_EXECUTED;
    query: string;
    stats: QueryRunner.Stats;
  }

  export interface QueryFailedMessage {
    type: typeof PgLogger.MESSAGE_TYPES.QUERY_FAILED;
    query: string;
    error: string;
  }

  export interface AdvisoryLockMessage {
    type: typeof PgLogger.MESSAGE_TYPES.ADVISORY_LOCK;
    lockId: number;
  }

  export interface AdvisoryUnlockMessage {
    type: typeof PgLogger.MESSAGE_TYPES.ADVISORY_UNLOCK;
    lockId: number;
  }

  export type AnyMessage =
    | TransactionCommitMessage
    | TransactionRollbackMessage
    | TransactionStartMessage
    | QueryExecutedMessage
    | QueryFailedMessage
    | AdvisoryLockMessage
    | AdvisoryUnlockMessage;

  export interface Log<M extends AnyMessage = AnyMessage> {
    pg: M;
  }

  export interface Driver {
    log: (message: string, messagePayload: Log) => void;
    error: (message: string, messagePayload: Log) => void;
  }

  export interface Options {
    driver: Driver;
    sqlTruncateLength?: number;
  }
}

export class PgLogger
  implements TransactionRunner.Logger, QueryRunner.Logger, Datasource.Logger
{
  public static readonly MESSAGE_TYPES = {
    ADVISORY_LOCK: 'pg:advisoryLock',
    ADVISORY_UNLOCK: 'pg:advisoryUnlock',
    QUERY_EXECUTED: 'pg:queryExecuted',
    QUERY_FAILED: 'pg:queryFailed',
    TRANSACTION_STARTED: 'pg:transactionStarted',
    TRANSACTION_COMMITTED: 'pg:transactionCommitted',
    TRANSACTION_ROLLED_BACK: 'pg:transactionRolledBack',
  } as const;

  private static readonly DEFAULT_TRUNCATE_QUERY_LENGTH = 40;

  private readonly driver: PgLogger.Driver;

  private readonly sqlTruncateLength: number;

  public constructor(options: PgLogger.Options) {
    this.driver = options.driver;
    this.sqlTruncateLength =
      options.sqlTruncateLength ?? PgLogger.DEFAULT_TRUNCATE_QUERY_LENGTH;
  }

  public logAdvisoryLock(lockId: number): void {
    this.driver.log(`Acquired advisory lock: ${lockId}`, {
      pg: {
        type: PgLogger.MESSAGE_TYPES.ADVISORY_LOCK,
        lockId,
      },
    });
  }

  public logAdvisoryUnlock(lockId: number): void {
    this.driver.log(`Released advisory lock: ${lockId}`, {
      pg: {
        type: PgLogger.MESSAGE_TYPES.ADVISORY_UNLOCK,
        lockId,
      },
    });
  }

  public logTransactionRollback(
    transactionId: string,
    stats: TransactionRunner.Stats,
  ): void {
    this.driver.log(`Rolled back postgres transaction: ${transactionId}`, {
      pg: {
        type: PgLogger.MESSAGE_TYPES.TRANSACTION_ROLLED_BACK,
        transactionId,
        stats,
      },
    });
  }

  public logTransactionStart(transactionId: string): void {
    this.driver.log(`Started postgres transaction: ${transactionId}`, {
      pg: {
        type: PgLogger.MESSAGE_TYPES.TRANSACTION_STARTED,
        transactionId,
      },
    });
  }

  public logTransactionCommit(
    transactionId: string,
    stats: TransactionRunner.Stats,
  ): void {
    this.driver.log(`Committed postgres transaction: ${transactionId}`, {
      pg: {
        type: PgLogger.MESSAGE_TYPES.TRANSACTION_COMMITTED,
        transactionId,
        stats,
      },
    });
  }

  public logQueryExecuted(
    queryConfig: QueryConfig,
    queryStats: QueryRunner.Stats,
  ): void {
    const truncatedQuery = this.truncateQuery(queryConfig.text);
    const totalDuration =
      queryStats.connectionDuration + queryStats.executionDuration;

    this.driver.log(
      `Executed postgres query: "${truncatedQuery}" in ` + `${totalDuration}ms`,
      {
        pg: {
          type: PgLogger.MESSAGE_TYPES.QUERY_EXECUTED,
          query: queryConfig.text,
          stats: queryStats,
        },
      },
    );
  }

  public logQueryFailed(error: unknown, queryConfig: QueryConfig): void {
    const truncatedQuery = this.truncateQuery(queryConfig.text);

    let errorString = '';

    if (error instanceof AggregateError) {
      const fragments: string[] = [];

      if (error.message) {
        fragments.push(error.message);
      }

      if (error.errors.length > 0) {
        fragments.push(
          ...error.errors.map((e) =>
            e instanceof Error ? e.message : String(e),
          ),
        );
      }

      errorString = fragments.join(', ');
    } else if (error instanceof Error) {
      errorString = error.message;
    } else {
      errorString = String(error);
    }

    this.driver.error(
      `Error "${errorString}": postgres query: "${truncatedQuery}"`,
      {
        pg: {
          type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
          query: queryConfig.text,
          error: errorString,
        },
      },
    );
  }

  private truncateQuery(query: string): string {
    return query.length > this.sqlTruncateLength
      ? `${query.substring(0, this.sqlTruncateLength)}...`
      : query;
  }
}

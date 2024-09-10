import {
  DatabaseError,
  type Pool,
  type QueryResultRow,
  type QueryResult,
  type PoolClient,
} from 'pg';
import { QueryConfig } from '@kilbergr/pg-sql';
import { TransactionRunner } from './transaction-runner';
import * as E from 'fp-ts/lib/Either';
import type { SqlQuery, SqlStatement } from './queries';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace QueryRunner {
  export interface Logger {
    logQueryExecuted: (queryConfig: QueryConfig, queryStats: Stats) => void;
    logQueryFailed: (error: unknown, queryConfig: QueryConfig) => void;
  }

  export interface Stats {
    /**
     * Time it took the runner to obtain an available database client. Time
     * is given in milliseconds. If missing the query failed to obtain a
     * client. Defaults to -1. (no connection time)
     */
    connectionDuration: number;
    /**
     * Time it took the runner to execute the query. Time is given in
     * milliseconds. If missing the query failed to execute. Defaults to -1.
     * (no execution time)
     */
    executionDuration: number;
  }

  export interface Result<R extends QueryResultRow = QueryResultRow>
    extends QueryResult<R> {
    stats: Stats;
    queryId: string;
  }
}

export class QueryRunner {
  private readonly pool: Pool;

  private readonly logger: QueryRunner.Logger & TransactionRunner.Logger;

  private transaction?: TransactionRunner;

  public constructor(
    pool: Pool,
    logger: QueryRunner.Logger & TransactionRunner.Logger,
  ) {
    this.pool = pool;
    this.logger = logger;
  }

  public static getDurationInMilliseconds(startTime: bigint): number {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return Number((process.hrtime.bigint() - startTime) / BigInt(1e6));
  }

  public isInTransaction(): boolean {
    return !!this.transaction;
  }

  public getTransactionStats(): TransactionRunner.Stats | undefined {
    return this.transaction?.stats;
  }

  public async startTransaction(): Promise<void> {
    if (this.isInTransaction()) {
      throw new Error(
        'Cannot start new SQL transaction. ' +
          'The query runner is already in a transaction.',
      );
    }

    this.transaction = new TransactionRunner(this.pool, this.logger);

    await this.transaction.start();
  }

  public async commitTransaction(): Promise<void> {
    if (!this.transaction) {
      throw new Error(
        'Cannot commit transaction. This query runner is not in a transaction.',
      );
    }
    await this.transaction.commit();

    this.transaction = undefined;
  }

  public async rollbackTransaction(): Promise<void> {
    if (!this.transaction) {
      throw new Error(
        'Cannot rollback transaction. This query runner is not in a transaction.',
      );
    }

    await this.transaction.rollback();

    this.transaction = undefined;
  }

  public prepare<
    ARGS extends object,
    RESULT = QueryRunner.Result,
    PROCESSED_ERROR = DatabaseError,
  >(
    statement: SqlStatement<ARGS, RESULT, PROCESSED_ERROR>,
  ): SqlQuery<ARGS, RESULT, PROCESSED_ERROR> {
    return statement.prepare(this);
  }

  public async query<R extends QueryResultRow>(
    input: string | QueryConfig,
  ): Promise<E.Either<DatabaseError, QueryRunner.Result<R>>> {
    // Resolve the query input into a QueryConfig object
    const queryConfig =
      typeof input === 'string' ? new QueryConfig(input) : input;

    const connectionStartTime = process.hrtime.bigint();
    // If the query runner is in the middle of a transaction the
    // client is already set and we don't need to connect to the pool.
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let client: PoolClient;

    try {
      client = this.transaction?.client ?? (await this.pool.connect());
    } catch (error) {
      this.logger.logQueryFailed(error, queryConfig);

      if (error instanceof DatabaseError) {
        return E.left<DatabaseError, QueryRunner.Result<R>>(error);
      }
      // Other than DatabaseError should not happen. If it does, it should
      // be considered a bug in the code.
      throw error;
    }

    try {
      const queryStats: QueryRunner.Stats = {
        connectionDuration: -1,
        executionDuration: -1,
      };

      queryStats.connectionDuration =
        QueryRunner.getDurationInMilliseconds(connectionStartTime);

      const queryStartTime = process.hrtime.bigint();

      const queryResult = Object.assign(await client.query<R>(queryConfig), {
        stats: queryStats,
        queryId: queryConfig.id,
      });

      queryStats.executionDuration =
        QueryRunner.getDurationInMilliseconds(queryStartTime);

      if (this.transaction) {
        this.transaction.stats.queryCount =
          this.transaction.stats.queryCount + 1;
      }

      this.logger.logQueryExecuted(queryConfig, queryStats);

      if (!this.isInTransaction()) {
        client.release();
      }

      return E.right<DatabaseError, QueryRunner.Result<R>>(queryResult);
    } catch (error) {
      this.logger.logQueryFailed(error, queryConfig);

      if (this.isInTransaction()) {
        await this.rollbackTransaction();
      } else {
        client.release();
      }

      if (error instanceof DatabaseError) {
        return E.left<DatabaseError, QueryRunner.Result<R>>(error);
      }
      // Other than DatabaseError should not happen. If it does, it should
      // be considered a bug in the code.
      throw error;
    }
  }
}

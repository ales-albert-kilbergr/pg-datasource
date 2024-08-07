import type { Pool, QueryResultRow } from 'pg';
import { QueryConfig } from '@kilbergr/pg-sql';
import { QueryResult } from './query-result';
import { TransactionRunner } from './transaction-runner';
import type { QueryLogger } from './query-logger';
import { from, type Observable } from 'rxjs';
import type { TransactionStats } from './transaction-stats';
import { Class } from 'type-fest';

export class QueryRunner {
  private readonly pool: Pool;

  private readonly logger: QueryLogger;

  private transaction?: TransactionRunner;

  public constructor(pool: Pool, logger: QueryLogger) {
    this.pool = pool;
    this.logger = logger;
  }

  public static getDurationInMilliseconds(startTime: bigint): number {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return Number((process.hrtime.bigint() - startTime) / BigInt(1e6));
  }

  public createRepository<R, C>(repositoryClass: Class<R>, config?: C): R {
    return new repositoryClass(this, config);
  }

  public isInTransaction(): boolean {
    return !!this.transaction;
  }

  public getTransactionStats(): TransactionStats | undefined {
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

  public observe<R extends QueryResultRow>(
    queryConfig: string | QueryConfig,
  ): Observable<QueryResult<R>> {
    return from(this.query<R>(queryConfig));
  }

  public async query<R extends QueryResultRow>(
    queryConfig: string | QueryConfig,
  ): Promise<QueryResult<R>> {
    const queryConfigObj =
      typeof queryConfig === 'string'
        ? new QueryConfig(queryConfig)
        : queryConfig;
    const result = new QueryResult<R>(queryConfigObj);
    const connectionStartTime = process.hrtime.bigint();
    // If the query runner is in the middle of a transaction the
    // client is already set and we don't need to connect to the pool.
    const client = this.transaction?.client ?? (await this.pool.connect());
    result.stats.connectionDuration =
      QueryRunner.getDurationInMilliseconds(connectionStartTime);
    const queryStartTime = process.hrtime.bigint();

    try {
      result.result = await client.query<R>(queryConfigObj);

      result.stats.executionDuration =
        QueryRunner.getDurationInMilliseconds(queryStartTime);
      result.stats.rowCount = result.result.rowCount ?? 0;

      if (this.transaction) {
        this.transaction.stats.queryCount =
          this.transaction.stats.queryCount + 1;
      }

      this.logger.logQueryExecuted(result);

      if (!this.isInTransaction()) {
        client.release();
      }

      return result;
    } catch (error) {
      this.logger.logQueryFailed(error, queryConfigObj);

      if (this.isInTransaction()) {
        await this.rollbackTransaction();
      } else {
        client.release();
      }

      throw error;
    }
  }
}

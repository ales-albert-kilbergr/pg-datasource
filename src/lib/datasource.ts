import type { Pool } from 'pg';
import { QueryRunner } from './query-runner';
import { AdvisoryLock } from './advisory-lock';
import type { TransactionRunner } from './transaction-runner';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Datasource {
  export interface Logger {
    logAdvisoryLock: (lockId: number) => void;
    logAdvisoryUnlock: (lockId: number) => void;
  }
}

export class Datasource {
  public readonly pool: Pool;

  public readonly name: string;

  public readonly logger: Datasource.Logger &
    QueryRunner.Logger &
    TransactionRunner.Logger;

  public constructor(
    name: string,
    pool: Pool,
    logger: Datasource.Logger & QueryRunner.Logger & TransactionRunner.Logger,
  ) {
    this.name = name;
    this.pool = pool;
    this.logger = logger;
  }
  /**
   * Gets the pool instance.
   *
   * @returns {Pool}
   */
  public getPool(): Pool {
    return this.pool;
  }
  /**
   * Creates a new query runner.
   *
   * @returns {QueryRunner}
   */
  public createQueryRunner(): QueryRunner {
    return new QueryRunner(this.pool, this.logger);
  }
  /**
   * Destroys the pool instance.
   */
  public async destroy(): Promise<void> {
    await this.pool.end();
  }

  public createAdvisorLock(lockId: number): AdvisoryLock {
    return new AdvisoryLock(this, lockId);
  }
}

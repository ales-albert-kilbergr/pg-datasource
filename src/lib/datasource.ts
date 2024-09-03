import type { Pool } from 'pg';
import { QueryRunner } from './query-runner';
import { sql } from '@kilbergr/pg-sql';
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

  public async schemaExists(schemaName: string): Promise<boolean> {
    const query = sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = :${schemaName}
      ) AS exists;
    `;

    const result = await this.pool.query(query);

    return result.rows[0].exists === true;
  }

  public async tableExists(
    schemaName: string,
    tableName: string,
  ): Promise<boolean> {
    const query = sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = :${schemaName}
        AND table_name = :${tableName}
      ) AS exists;
    `;

    const result = await this.pool.query(query);

    return result.rows[0].exists === true;
  }

  public createAdvisorLock(lockId: number): AdvisoryLock {
    return new AdvisoryLock(this, lockId);
  }
}

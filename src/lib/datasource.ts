import type { Pool } from 'pg';
import { QueryRunner } from './query-runner';
import type { QueryLogger } from './query-logger';

export class Datasource {
  public readonly pool: Pool;

  public readonly name: string;

  private readonly logger: QueryLogger;

  public constructor(name: string, pool: Pool, logger: QueryLogger) {
    this.name = name;
    this.pool = pool;
    this.logger = logger;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public createQueryRunner(): QueryRunner {
    return new QueryRunner(this.pool, this.logger);
  }

  public async destroy(): Promise<void> {
    await this.pool.end();
  }
}

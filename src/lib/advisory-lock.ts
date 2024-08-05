import { sql } from '@kilbergr/pg-sql';
import type { Datasource } from './datasource';

export class AdvisoryLock {
  private readonly datasource: Datasource;

  public constructor(datasource: Datasource) {
    this.datasource = datasource;
  }

  public async lock(lockId: number): Promise<void> {
    const queryConfig = sql`
      SELECT pg_advisory_lock(${lockId});
    `;

    await this.datasource.pool.query(queryConfig);

    this.datasource.logger.logAdvisoryLock(lockId);
  }

  public async unlock(lockId: number): Promise<void> {
    const queryConfig = sql`
      SELECT pg_advisory_unlock(${lockId});
    `;

    await this.datasource.pool.query(queryConfig);

    this.datasource.logger.logAdvisoryUnlock(lockId);
  }
}

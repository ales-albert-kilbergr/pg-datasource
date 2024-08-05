import { sql } from '@kilbergr/pg-sql';
import type { Datasource } from './datasource';

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace AdvisoryLock {
  type Status = 'IDLE' | 'LOCK_PENDING' | 'LOCKED' | 'UNLOCK_PENDING';
}
export class AdvisoryLock {
  private readonly datasource: Datasource;

  private readonly lockId: number;

  private status: AdvisoryLock.Status = 'IDLE';

  public constructor(datasource: Datasource, lockId: number) {
    this.datasource = datasource;
    this.lockId = lockId;
  }

  public getStatus(): AdvisoryLock.Status {
    return this.status;
  }

  public isLocked(): boolean {
    return this.status === 'LOCKED';
  }

  public async lock(): Promise<void> {
    const queryConfig = sql`
      SELECT pg_advisory_lock(${this.lockId});
    `;

    this.status = 'LOCK_PENDING';
    await this.datasource.pool.query(queryConfig);
    this.status = 'LOCKED';

    this.datasource.logger.logAdvisoryLock(this.lockId);
  }

  public async unlock(): Promise<void> {
    const queryConfig = sql`
      SELECT pg_advisory_unlock(${this.lockId});
    `;
    this.status = 'UNLOCK_PENDING';
    await this.datasource.pool.query(queryConfig);
    this.status = 'IDLE';

    this.datasource.logger.logAdvisoryUnlock(this.lockId);
  }
}

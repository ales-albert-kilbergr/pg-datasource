import { QueryLogger } from './query-logger';

export class DatasourceLogger extends QueryLogger {
  public static readonly MESSAGE_TYPES = {
    ADVISORY_LOCK: 'pg:advisoryLock',
    ADVISORY_UNLOCK: 'pg:advisoryUnlock',
    ...QueryLogger.MESSAGE_TYPES,
  };

  public logAdvisoryLock(lockId: number): void {
    this.driver.log(`Acquired advisory lock: ${lockId}`, {
      pg: {
        type: DatasourceLogger.MESSAGE_TYPES.ADVISORY_LOCK,
        lockId,
      },
    });
  }

  public logAdvisoryUnlock(lockId: number): void {
    this.driver.log(`Released advisory lock: ${lockId}`, {
      pg: {
        type: DatasourceLogger.MESSAGE_TYPES.ADVISORY_UNLOCK,
        lockId,
      },
    });
  }
}

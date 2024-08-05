/* eslint-disable @typescript-eslint/unbound-method */
import { mock } from 'jest-mock-extended';
import type { Pool } from 'pg';
import type { DatasourceLogger } from './datasource-logger';
import { Datasource } from './datasource';
import { AdvisoryLock } from './advisory-lock';

describe('(Unit) AdvisoryLock', () => {
  describe('getStatus', () => {
    it('should return IDLE status when lock is created but not yet locked', () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      // Act
      const status = advisoryLock.getStatus();
      // Assert
      expect(status).toBe('IDLE');
    });

    it('should return LOCKED status when lock is locked', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      await advisoryLock.lock();
      // Act
      const status = advisoryLock.getStatus();
      // Assert
      expect(status).toBe('LOCKED');
    });

    it('should return IDLE status after the lock is unlocked', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      await advisoryLock.lock();
      await advisoryLock.unlock();
      // Act
      const status = advisoryLock.getStatus();
      // Assert
      expect(status).toBe('IDLE');
    });
  });

  describe('lock', () => {
    it('should lock the advisory lock', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      // Act
      await advisoryLock.lock();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT pg_advisory_lock(1);',
        }),
      );
    });

    it('should log the advisory lock', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      // Act
      await advisoryLock.lock();
      // Assert
      expect(logger.logAdvisoryLock).toHaveBeenCalledWith(1);
    });
  });

  describe('unlock', () => {
    it('should unlock the advisory lock', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      // Act
      await advisoryLock.unlock();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(pool.query).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'SELECT pg_advisory_unlock(1);',
        }),
      );
    });

    it('should log the advisory unlock', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource, 1);
      // Act
      await advisoryLock.unlock();
      // Assert
      expect(logger.logAdvisoryUnlock).toHaveBeenCalledWith(1);
    });
  });
});

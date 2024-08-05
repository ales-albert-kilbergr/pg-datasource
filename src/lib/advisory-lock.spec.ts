/* eslint-disable @typescript-eslint/unbound-method */
import { mock } from 'jest-mock-extended';
import type { Pool } from 'pg';
import type { DatasourceLogger } from './datasource-logger';
import { Datasource } from './datasource';
import { AdvisoryLock } from './advisory-lock';

describe('(Unit) AdvisoryLock', () => {
  describe('lock', () => {
    it('should lock the advisory lock', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<DatasourceLogger>();
      const datasource = new Datasource('test', pool, logger);
      const advisoryLock = new AdvisoryLock(datasource);
      // Act
      await advisoryLock.lock(1);
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
      const advisoryLock = new AdvisoryLock(datasource);
      // Act
      await advisoryLock.lock(1);
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
      const advisoryLock = new AdvisoryLock(datasource);
      // Act
      await advisoryLock.unlock(1);
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
      const advisoryLock = new AdvisoryLock(datasource);
      // Act
      await advisoryLock.unlock(1);
      // Assert
      expect(logger.logAdvisoryUnlock).toHaveBeenCalledWith(1);
    });
  });
});

import { mock } from 'jest-mock-extended';
import type { Pool } from 'pg';
import type { QueryLogger } from './query-logger';
import { Datasource } from './datasource';
import { QueryRunner } from './query-runner';

describe('(Unit) Datasource', () => {
  describe('constructor', () => {
    it('should set the name, pool, and logger', () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<QueryLogger>();
      // Act
      const datasource = new Datasource('test', pool, logger);
      // Assert
      expect(datasource.name).toBe('test');
      expect(datasource.pool).toBe(pool);
    });
  });

  describe('getPgPool', () => {
    it('should return the pool', () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<QueryLogger>();
      const datasource = new Datasource('test', pool, logger);
      // Act
      const result = datasource.getPgPool();
      // Assert
      expect(result).toBe(pool);
    });
  });

  describe('createQueryRunner', () => {
    it('should return a new QueryRunner', () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<QueryLogger>();
      const datasource = new Datasource('test', pool, logger);
      // Act
      const result = datasource.createQueryRunner();
      // Assert
      expect(result).toBeInstanceOf(QueryRunner);
    });
  });

  describe('destroy', () => {
    it('should end the pool', async () => {
      // Arrange
      const pool = mock<Pool>();
      const logger = mock<QueryLogger>();
      const datasource = new Datasource('test', pool, logger);
      // Act
      await datasource.destroy();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(pool.end).toHaveBeenCalledTimes(1);
    });
  });
});

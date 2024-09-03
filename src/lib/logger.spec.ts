import { mock } from 'jest-mock-extended';
import { PgLogger } from './logger';
import { sql } from '@kilbergr/pg-sql';
import type { TransactionRunner } from './transaction-runner';
import type { QueryRunner } from './query-runner';

describe('(Unit) PgLogger', () => {
  describe('logTransactionRollback', () => {
    it('should log the transaction rollback', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const transactionStats = mock<TransactionRunner.Stats>();
      // Act
      logger.logTransactionRollback('test', transactionStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Rolled back postgres transaction: test',
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.TRANSACTION_ROLLED_BACK,
            transactionId: 'test',
            stats: transactionStats,
          },
        },
      );
    });
  });

  describe('logTransactionStart', () => {
    it('should log the transaction start', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      // Act
      logger.logTransactionStart('test');
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Started postgres transaction: test',
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.TRANSACTION_STARTED,
            transactionId: 'test',
          },
        },
      );
    });
  });

  describe('logTransactionCommit', () => {
    it('should log the transaction commit', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const transactionStats = mock<TransactionRunner.Stats>();
      // Act
      logger.logTransactionCommit('test', transactionStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Committed postgres transaction: test',
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.TRANSACTION_COMMITTED,
            transactionId: 'test',
            stats: transactionStats,
          },
        },
      );
    });
  });

  describe('logQueryExecuted', () => {
    it('should log the query execution', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const queryStats = mock<QueryRunner.Stats>({
        connectionDuration: 10,
        executionDuration: 20,
      });

      const totalTime =
        queryStats.connectionDuration + queryStats.executionDuration;
      // Act
      logger.logQueryExecuted(queryConfig, queryStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        `Executed postgres query: "SELECT * FROM test" in ${totalTime}ms`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_EXECUTED,
            query: queryConfig.text,
            stats: queryStats,
          },
        },
      );
    });

    it('should truncate the query if it is too long', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT test_one, test_two, test_three FROM test WHERE id = 1 AND name = "test"`;
      const queryStats = mock<QueryRunner.Stats>({
        connectionDuration: 10,
        executionDuration: 20,
      });
      const totalTime =
        queryStats.connectionDuration + queryStats.executionDuration;
      // Act
      logger.logQueryExecuted(queryConfig, queryStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        `Executed postgres query: "SELECT test_one, test_two, test_three FR..." in ${totalTime}ms`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_EXECUTED,
            query: queryConfig.text,
            stats: queryStats,
          },
        },
      );
    });
  });

  describe('logQueryFailed', () => {
    it('should log the query failure with a simple error', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = new Error('test');
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error without own custom message', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = new AggregateError([
        new Error('test1'),
        new Error('test2'),
      ]);
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test1, test2',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having its own message combined with errors messages', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = new AggregateError(
        [new Error('test1'), new Error('test2')],
        'test',
      );
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test, test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test, test1, test2',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having its own message and no errors', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = new AggregateError([], 'test');
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having strings as errors', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = new AggregateError(['test1', 'test2']);
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test1, test2',
          },
        },
      );
    });

    it('should log the query failure with a string error', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      const queryConfig = sql`SELECT * FROM test`;
      const error = 'test';
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: PgLogger.MESSAGE_TYPES.QUERY_FAILED,
            query: queryConfig.text,
            error: 'test',
          },
        },
      );
    });
  });

  describe('logAdvisoryLock', () => {
    it('should log the advisory lock', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      // Act
      logger.logAdvisoryLock(1);
      // Assert
      expect(driver.log).toHaveBeenCalledWith('Acquired advisory lock: 1', {
        pg: {
          type: PgLogger.MESSAGE_TYPES.ADVISORY_LOCK,
          lockId: 1,
        },
      });
    });
  });

  describe('logAdvisoryUnlock', () => {
    it('should log the advisory unlock', () => {
      // Arrange
      const driver = mock<PgLogger.Driver>();
      const logger = new PgLogger({ driver });
      // Act
      logger.logAdvisoryUnlock(1);
      // Assert
      expect(driver.log).toHaveBeenCalledWith('Released advisory lock: 1', {
        pg: {
          type: PgLogger.MESSAGE_TYPES.ADVISORY_UNLOCK,
          lockId: 1,
        },
      });
    });
  });
});

import { mock } from 'jest-mock-extended';
import type { LoggerDriver } from './transaction-logger';
import { QueryLogger } from './query-logger';
import { QueryResultStub } from './query-result.stub';
import { QueryConfigStub } from '@kilbergr/pg-sql/testing';

describe('(Unit) QueryLogger', () => {
  describe('logQueryExecuted', () => {
    it('should log the query execution', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const queryResult = QueryResultStub({
        config: QueryConfigStub({ text: query }),
      });
      const totalTime = queryResult.stats.totalDuration;
      // Act
      logger.logQueryExecuted(queryResult);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        `Executed postgres query: "SELECT * FROM test" in ${totalTime}ms`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_EXECUTED,
            query,
            stats: queryResult.stats,
          },
        },
      );
    });

    it('should truncate the query if it is too long', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query =
        'SELECT test_one, test_two, test_three FROM test WHERE id = 1 AND name = "test"';
      const queryResult = QueryResultStub({
        config: QueryConfigStub({ text: query }),
      });
      const totalTime = queryResult.stats.totalDuration;
      // Act
      logger.logQueryExecuted(queryResult);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        `Executed postgres query: "SELECT test_one, test_two, test_three FR..." in ${totalTime}ms`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_EXECUTED,
            query,
            stats: queryResult.stats,
          },
        },
      );
    });
  });

  describe('logQueryFailed', () => {
    it('should log the query failure with a simple error', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = new Error('test');
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error without own custom message', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = new AggregateError([
        new Error('test1'),
        new Error('test2'),
      ]);
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test1, test2',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having its own message combined with errors messages', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = new AggregateError(
        [new Error('test1'), new Error('test2')],
        'test',
      );
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test, test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test, test1, test2',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having its own message and no errors', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = new AggregateError([], 'test');
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test',
          },
        },
      );
    });

    it('should log the query failure with an aggregate error having strings as errors', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = new AggregateError(['test1', 'test2']);
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test1, test2": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test1, test2',
          },
        },
      );
    });

    it('should log the query failure with a string error', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new QueryLogger(driver);
      const query = 'SELECT * FROM test';
      const error = 'test';
      const queryConfig = QueryConfigStub({ text: query });
      // Act
      logger.logQueryFailed(error, queryConfig);
      // Assert
      expect(driver.error).toHaveBeenCalledWith(
        `Error "test": postgres query: "SELECT * FROM test"`,
        {
          pg: {
            type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
            query,
            error: 'test',
          },
        },
      );
    });
  });
});

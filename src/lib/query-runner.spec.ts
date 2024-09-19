/* eslint-disable @typescript-eslint/no-magic-numbers */
import { mock } from 'jest-mock-extended';
import { QueryRunner } from './query-runner';
import { DatabaseError, type Pool, type PoolClient } from 'pg';
import { QueryConfig, sql } from '@kilbergr/pg-sql';
import type { TransactionRunner } from './transaction-runner';
import * as E from 'fp-ts/lib/Either';
import { SqlQuery, SqlStatement } from './statements';

describe('(Unit) QueryRunner', () => {
  describe('.getDurationInMilliseconds()', () => {
    it('should return the duration in milliseconds', () => {
      // Arrange
      const startTime = process.hrtime.bigint();
      // Act
      const result = QueryRunner.getDurationInMilliseconds(startTime);
      // Assert
      expect(result).toEqual(expect.any(Number));
    });
  });

  describe('#isInTransaction()', () => {
    it('should return false if not in a transaction', () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>(),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.isInTransaction();
      // Assert
      expect(result).toBe(false);
    });

    it('should return true if in a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const resultBefore = queryRunner.isInTransaction();
      await queryRunner.startTransaction();
      const resultAfter = queryRunner.isInTransaction();
      // Assert
      expect(resultBefore).toBe(false);
      expect(resultAfter).toBe(true);
    });

    it('should return false after committing a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const resultBefore = queryRunner.isInTransaction();
      await queryRunner.startTransaction();
      const resultDuring = queryRunner.isInTransaction();
      await queryRunner.commitTransaction();
      const resultAfter = queryRunner.isInTransaction();
      // Assert
      expect(resultBefore).toBe(false);
      expect(resultDuring).toBe(true);
      expect(resultAfter).toBe(false);
    });
  });

  describe('#startTransaction()', () => {
    it('should start a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      await queryRunner.startTransaction();
      // Assert
      expect(queryRunner.isInTransaction()).toBe(true);
    });

    it('should throw an error if already in a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      const result = queryRunner.startTransaction();
      // Assert
      await expect(result).rejects.toThrow(
        'Cannot start new SQL transaction. The query runner is already in a transaction.',
      );
    });

    it('should call "BEGIN" on the client', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      await queryRunner.startTransaction();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('BEGIN');
    });
  });

  describe('#commitTransaction()', () => {
    it('should commit a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const before = queryRunner.isInTransaction();
      await queryRunner.startTransaction();
      const during = queryRunner.isInTransaction();
      await queryRunner.commitTransaction();
      const after = queryRunner.isInTransaction();
      // Assert
      expect(before).toBe(false);
      expect(during).toBe(true);
      expect(after).toBe(false);
    });

    it('should throw an error if not in a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>(),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.commitTransaction();
      // Assert
      await expect(result).rejects.toThrow(
        'Cannot commit transaction. This query runner is not in a transaction.',
      );
    });

    it('should call "COMMIT" on the client', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      await queryRunner.commitTransaction();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('#rollbackTransaction()', () => {
    it('should rollback a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(mock<PoolClient>()),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const before = queryRunner.isInTransaction();
      await queryRunner.startTransaction();
      const during = queryRunner.isInTransaction();
      await queryRunner.rollbackTransaction();
      const after = queryRunner.isInTransaction();
      // Assert
      expect(before).toBe(false);
      expect(during).toBe(true);
      expect(after).toBe(false);
    });

    it('should throw an error if not in a transaction', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>(),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.rollbackTransaction();
      // Assert
      await expect(result).rejects.toThrow(
        'Cannot rollback transaction. This query runner is not in a transaction.',
      );
    });

    it('should call "ROLLBACK" on the client', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      await queryRunner.rollbackTransaction();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('#query()', () => {
    it('should return a promise', () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockResolvedValue({ rowCount: 1 }),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.query('SELECT 1');

      // Assert
      expect(result).toBeInstanceOf(Promise);
    });

    it('should execute a query from a string and return a result', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [] }),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = await queryRunner.query('SELECT 1');
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveProperty('stats');
        expect(result.right).toHaveProperty('rows');
        expect(result.right).toHaveProperty('rowCount');
      }
    });

    it('should forward the query id from config to the result', async () => {
      // Arrange
      const queryConfig = sql`SELECT 1`;
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockResolvedValue({ rowCount: 1 }),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = await queryRunner.query(queryConfig);
      // Assert
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right).toHaveProperty('queryId', queryConfig.id);
      }
    });

    it('should log the query execution', async () => {
      // Arrange
      const logger = mock<QueryRunner.Logger & TransactionRunner.Logger>();
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockResolvedValue({ rowCount: 1 }),
            }),
          ),
        }),
        logger,
      );
      // Act
      const queryConfig = sql`SELECT 1`;
      await queryRunner.query(queryConfig);
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.logQueryExecuted).toHaveBeenCalledWith(
        queryConfig,
        expect.objectContaining({
          connectionDuration: 0,
          executionDuration: 0,
        }),
      );
    });

    it('should release a client if it is not in transaction', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      await queryRunner.query('SELECT 1');
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('should release a client if query fails and not in transaction', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockRejectedValue(new Error('test')),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      await expect(queryRunner.query('SELECT 1')).rejects.toThrow('test');
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('should log a failed query', async () => {
      // Arrange
      const logger = mock<QueryRunner.Logger & TransactionRunner.Logger>();
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockRejectedValue(new Error('test')),
            }),
          ),
        }),
        logger,
      );
      // Act
      await expect(queryRunner.query('SELECT 1')).rejects.toThrow('test');
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logger.logQueryFailed).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(QueryConfig),
      );
    });

    it('should reuse the transaction clients in between queries', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      await queryRunner.query('SELECT 1');
      await queryRunner.query('SELECT 1');
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledTimes(3);
    });

    it('should count the executed queries into the transaction stats', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockResolvedValue({ rowCount: 1 }),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      await queryRunner.query('SELECT 1');
      await queryRunner.query('SELECT 1');
      // Assert
      expect(queryRunner.getTransactionStats()?.queryCount).toBe(2);
    });

    it('should call a rollback on the client if a query fails in a transaction', async () => {
      // Arrange
      const client = mock<PoolClient>({
        query: jest
          .fn()
          .mockImplementation(
            async (arg): Promise<unknown> =>
              typeof arg === 'string'
                ? Promise.resolve()
                : Promise.reject(new Error('test')),
          ),
      });
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(client),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      await queryRunner.startTransaction();
      // Act
      await expect(queryRunner.query('SELECT 1')).rejects.toThrow('test');
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should return left with an error', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest
                .fn()
                .mockRejectedValue(
                  new DatabaseError('Error message', 10, 'error'),
                ),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = await queryRunner.query('SELECT 1');
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DatabaseError);
      }
    });

    it('should throw an error if it is not a DatabaseError', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockResolvedValue(
            mock<PoolClient>({
              query: jest.fn().mockRejectedValue(new Error('test')),
            }),
          ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.query('SELECT 1');
      // Assert
      await expect(result).rejects.toThrow('test');
    });

    it('should return left with DatabaseError if the connection fails to establish', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest
            .fn()
            .mockRejectedValue(
              new DatabaseError('Connection Failed', 10, 'error'),
            ),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = await queryRunner.query('SELECT 1');
      // Assert
      expect(E.isLeft(result)).toBe(true);
      if (E.isLeft(result)) {
        expect(result.left).toBeInstanceOf(DatabaseError);
      }
    });

    it('should throw an error if the connection fails to establish and it is not a DatabaseError', async () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>({
          connect: jest.fn().mockRejectedValue(new Error('test')),
        }),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      // Act
      const result = queryRunner.query('SELECT 1');
      // Assert
      await expect(result).rejects.toThrow('test');
    });
  });

  describe('#prepare()', () => {
    it('should return a prepared query', () => {
      // Arrange
      const queryRunner = new QueryRunner(
        mock<Pool>(),
        mock<QueryRunner.Logger & TransactionRunner.Logger>(),
      );
      const statement = SqlStatement.from(() => sql`SELECT 1`);
      // Act
      const result = queryRunner.prepare(statement);
      // Assert
      expect(result).toBeInstanceOf(SqlQuery);
    });
  });
});

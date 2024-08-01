import { mock } from 'jest-mock-extended';
import type { TransactionLogger } from './transaction-logger';
import { TransactionRunner } from './transaction-runner';
import type { Pool, PoolClient } from 'pg';

describe('(Unit) TransactionRunner', () => {
  describe('#start', () => {
    it('should start a transaction', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('BEGIN');
    });

    it('should throw an error if the transaction is already started', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      // Assert
      await expect(transactionRunner.start()).rejects.toThrow(
        'Transaction already started',
      );
    });

    it('should log the transaction start', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(transactionLogger.logTransactionStart).toHaveBeenCalledWith(
        transactionRunner.transactionId,
      );
    });
  });

  describe('#commit', () => {
    it('should commit a transaction', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      await transactionRunner.commit();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw an error if the transaction is not started', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      // Assert
      await expect(transactionRunner.commit()).rejects.toThrow(
        'Transaction not started or already committed',
      );
    });

    it('should log the transaction commit', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      await transactionRunner.commit();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(transactionLogger.logTransactionCommit).toHaveBeenCalledWith(
        expect.any(String),
        transactionRunner.stats,
      );
    });
  });

  describe('#rollback', () => {
    it('should rollback a transaction', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      await transactionRunner.rollback();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw an error if the transaction is not started', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      // Assert
      await expect(transactionRunner.rollback()).rejects.toThrow(
        'Transaction not started or already rolled back',
      );
    });

    it('should log the transaction rollback', async () => {
      // Arrange
      const client = mock<PoolClient>();
      const pool = mock<Pool>({
        connect: jest.fn().mockResolvedValue(client),
      });
      const transactionLogger = mock<TransactionLogger>();
      const transactionRunner = new TransactionRunner(pool, transactionLogger);
      // Act
      await transactionRunner.start();
      await transactionRunner.rollback();
      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(transactionLogger.logTransactionRollback).toHaveBeenCalledWith(
        expect.any(String),
        transactionRunner.stats,
      );
    });
  });
});

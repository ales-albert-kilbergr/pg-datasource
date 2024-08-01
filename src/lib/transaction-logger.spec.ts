import { mock } from 'jest-mock-extended';
import { TransactionLogger, type LoggerDriver } from './transaction-logger';
import type { TransactionStats } from './transaction-stats';

describe('(Unit) TransactionLogger', () => {
  describe('logTransactionRollback', () => {
    it('should log the transaction rollback', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new TransactionLogger(driver);
      const transactionStats = mock<TransactionStats>();
      // Act
      logger.logTransactionRollback('test', transactionStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Rolled back postgres transaction: test',
        {
          pg: {
            type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_ROLLED_BACK,
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
      const driver = mock<LoggerDriver>();
      const logger = new TransactionLogger(driver);
      // Act
      logger.logTransactionStart('test');
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Started postgres transaction: test',
        {
          pg: {
            type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_STARTED,
            transactionId: 'test',
          },
        },
      );
    });
  });

  describe('logTransactionCommit', () => {
    it('should log the transaction commit', () => {
      // Arrange
      const driver = mock<LoggerDriver>();
      const logger = new TransactionLogger(driver);
      const transactionStats = mock<TransactionStats>();
      // Act
      logger.logTransactionCommit('test', transactionStats);
      // Assert
      expect(driver.log).toHaveBeenCalledWith(
        'Committed postgres transaction: test',
        {
          pg: {
            type: TransactionLogger.MESSAGE_TYPES.TRANSACTION_COMMITTED,
            transactionId: 'test',
            stats: transactionStats,
          },
        },
      );
    });
  });
});

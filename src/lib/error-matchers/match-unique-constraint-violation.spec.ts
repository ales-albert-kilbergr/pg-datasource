import { DatabaseError } from 'pg';
import { SqlStatement, type SqlQuery } from '../statements';
import { mock } from 'jest-mock-extended';
import { sql, type QueryConfig } from '@kilbergr/pg-sql';
import { matchUniqueConstraintViolationError } from './match-unique-constraint-violation';

describe('(Unit) matchUniqueConstraintViolation', () => {
  it('should extract the key and value for the unique constraint violation', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23505';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toMatchObject({
      conflict: { id: 'event_store_id_5PseERABKl' },
    });
  });

  it('should extract the key and value for the unique constraint violation with multiple keys', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23505';
    error.detail =
      'Key (id, name)=(event_store_id_5PseERABKl, event_store_name) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toEqual({
      conflict: {
        id: 'event_store_id_5PseERABKl',
        name: 'event_store_name',
      },
    });
  });

  it('should not extract the key and value for a different constraint violation', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'different_constraint';
    error.code = '23505';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should not extract the key and value for a different error code', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '12345';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error detail is not in the expected format', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23505';
    error.detail = 'Invalid format';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should return false if the error detail is missing', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23505';
    const ctx: SqlQuery.ErrorContext<object> = {
      error,
      queryConfig: mock<QueryConfig>(),
      args: {},
    };
    // Act
    const result = matchUniqueConstraintViolationError(constraint)(ctx);
    // Assert
    expect(result).toBe(false);
  });

  it('should allow to transfer the data type of the extracted values to the handler', () => {
    // Arrange
    const constraint = 'my_constraint';
    const error = new DatabaseError('Error message', 0, 'error');
    error.constraint = 'my_constraint';
    error.code = '23505';
    error.detail = 'Key (id)=(event_store_id_5PseERABKl) already exists.';
    // Act
    const statement = SqlStatement.from(() => sql`SELECT 1`).matchError(
      matchUniqueConstraintViolationError<{ id: number }>(constraint),
      // We test that the 'id' value has been recognized as property of ctx
      (ctx) => ctx.conflict.id,
    );
    // Assert
    expect(statement).toBeInstanceOf(SqlStatement);
  });
});

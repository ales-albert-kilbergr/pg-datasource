/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestScheduler } from 'rxjs/testing';
import { DatabaseError } from 'pg';
import {
  catchDatabaseError,
  catchDuplicateTableError,
  catchUndefinedTableError,
} from './operators';
import { throwError } from 'rxjs';

// https://medium.com/@bencabanes/marble-testing-observable-introduction-1f5ad39231c
describe('(Unit) Operators', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let testScheduler: TestScheduler;

  describe('catchDatabaseError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch a DatabaseError with the specified code and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';
        const databaseErrorCode = '12345';

        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = databaseErrorCode;
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch a DatabaseError with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';
        const databaseErrorCode = '12345';

        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should not catch an error that is not a DatabaseError', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new Error('Random error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError('12345', () => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should throw another error if the handler callback returns one', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const databaseErrorCode = '12345';
        const error = new DatabaseError(
          'Random database error',
          111,
          'parseComplete',
        );
        error.code = databaseErrorCode;

        const handlerError = new Error('Handler error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => handlerError),
        );

        // Assert
        expectObservable(result$).toBe(
          expectedMarbles,
          undefined,
          handlerError,
        );
      });
    });

    it('should rethrow an error throw by an error handler', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const databaseErrorCode = '12345';
        const error = new DatabaseError('Random database error', 111, 'error');
        error.code = databaseErrorCode;

        const handlerError = new Error('Handler error');

        // Act
        const result$ = throwError(() => error).pipe(
          catchDatabaseError(databaseErrorCode, () => {
            throw handlerError;
          }),
        );

        // Assert
        expectObservable(result$).toBe(
          expectedMarbles,
          undefined,
          handlerError,
        );
      });
    });
  });

  describe('catchDuplicateTableError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch a duplicate table error and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const error = new DatabaseError(
          'relation "my_test_table" already exists',
          123,
          'error',
        );
        error.code = '42P07';
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch a duplicate table error with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new DatabaseError('my other error', 123, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should pass the table name from the error to the catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" already exists`,
          123,
          'error',
        );
        error.code = '42P07';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError((name) => name),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: tableName });
      });
    });

    it('should catch the duplicate table error with non matching message', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" already exists but with a different message`,
          123,
          'error',
        );
        error.code = '42P07';

        // Act
        const result$ = throwError(() => error).pipe(
          catchDuplicateTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: 'handled' });
      });
    });
  });

  describe('catchUndefinedTableError', () => {
    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
    });

    it('should catch an undefined table error and return the result from catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const error = new DatabaseError(
          'relation "my_test_table" does not exist',
          123,
          'error',
        );
        error.code = '42P01';
        const result = 'handled';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError(() => result),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: result });
      });
    });

    it('should not catch an undefined table error with a different code', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will not be caught
        const expectedMarbles = '#';

        const error = new DatabaseError('my other error', 123, 'error');
        error.code = '54321';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError(() => 'handled'),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, null, error);
      });
    });

    it('should pass the table name from the error to the catchFn', () => {
      testScheduler.run(({ expectObservable }) => {
        // Arrange
        // indicates that the error will be caught and some result is
        // expected to be returned
        const expectedMarbles = '(a|)';

        const tableName = 'my_test_table';
        const error = new DatabaseError(
          `relation "${tableName}" does not exist`,
          123,
          'error',
        );
        error.code = '42P01';

        // Act
        const result$ = throwError(() => error).pipe(
          catchUndefinedTableError((name) => name),
        );

        // Assert
        expectObservable(result$).toBe(expectedMarbles, { a: tableName });
      });
    });
  });
});

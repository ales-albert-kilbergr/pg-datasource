import type { QueryResultRow } from 'pg';
import { transformToInstance } from './transform-to-instance';

describe('(Unit) transformToInstance', () => {
  it('should return an array of instances', () => {
    // Arrange
    class Test {
      public column!: string;
    }
    const rows: QueryResultRow[] = [{ column: 'value1' }, { column: 'value2' }];
    // Act
    const result = transformToInstance(Test)(rows);
    // Assert
    // expect each element to be an instance of Test
    for (const instance of result) {
      expect(instance).toBeInstanceOf(Test);
    }
  });

  it('should return an empty array if there are no rows', () => {
    // Arrange
    class Test {
      public column!: string;
    }
    const rows: QueryResultRow[] = [];
    // Act
    const result = transformToInstance(Test)(rows);
    // Assert
    expect(result).toEqual([]);
  });
});

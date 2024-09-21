import {
  transformColumnNames,
  transformColumnNamesToCamelCase,
} from './transform-column-names';

describe('(Unit) transformColumnNames', () => {
  it('should return an array of rows with upper case keys', () => {
    // Arrange
    const rows = [{ column_name: 'value1' }, { column_name: 'value2' }];
    // Act
    const result = transformColumnNamesToCamelCase()(rows);
    // Assert
    for (const row of result) {
      expect(row).toHaveProperty('columnName');
    }
  });

  it('should return an empty array if there are no rows', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    // Act
    const result = transformColumnNamesToCamelCase()(rows);
    // Assert
    expect(result).toEqual([]);
  });
});

describe('(Unit) transformColumnNamesToCamelCase', () => {
  it('should return an array of rows with camelCase keys', () => {
    // Arrange
    const rows = [{ column_name: 'value1' }, { column_name: 'value2' }];
    // Act
    const result = transformColumnNames((k) => k.toLowerCase())(rows);
    // Assert
    for (const row of result) {
      expect(row).toHaveProperty('column_name');
    }
  });

  it('should return an empty array if there are no rows', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    // Act
    const result = transformColumnNames((k) => k.toLowerCase())(rows);
    // Assert
    expect(result).toEqual([]);
  });
});

import { mapToColumn } from './map-to-column';

describe('(Unit) mapToColumn', () => {
  it('should map the rows to an array of values from the specified column', () => {
    // Arrange
    const column = 'column';
    const rows = [{ column: 'value1' }, { column: 'value2' }];
    // Act
    const result = mapToColumn<string>(column)(rows);
    // Assert
    expect(result).toEqual(['value1', 'value2']);
  });

  it('should return an empty array if there are no rows', () => {
    // Arrange
    const column = 'column';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    // Act
    const result = mapToColumn<string>(column)(rows);
    // Assert
    expect(result).toEqual([]);
  });
});

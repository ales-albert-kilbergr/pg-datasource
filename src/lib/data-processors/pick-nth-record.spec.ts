/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  pickFirstRecord,
  pickLastRecord,
  pickNthRecord,
} from './pick-nth-record';

describe('(Unit) pickNthRecord', () => {
  it('should return the nth record', () => {
    // Arrange
    const index = 1;
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    const result = pickNthRecord(index)(rows);
    // Assert
    expect(result).toEqual({ id: 2 });
  });

  it('should return the first record', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    const result = pickNthRecord(0)(rows);
    // Assert
    expect(result).toEqual({ id: 1 });
  });

  it('should return the last record', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const result = pickNthRecord(-1)(rows);
    // Assert
    expect(result).toEqual({ id: 3 });
  });

  it('should return the nth record from the end', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const result = pickNthRecord(-2)(rows);
    // Assert
    expect(result).toEqual({ id: 2 });
  });

  it('should return undefined if the index is out of bounds', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    const result = pickNthRecord(3)(rows);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe('(Unit) pickFirstRecord', () => {
  it('should return the first record', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    const result = pickFirstRecord()(rows);
    // Assert
    expect(result).toEqual({ id: 1 });
  });

  it('should return undefined if the array is empty', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    // Act
    const result = pickFirstRecord()(rows);
    // Assert
    expect(result).toBeUndefined();
  });
});

describe('(Unit) pickLastRecord', () => {
  it('should return the last record', () => {
    // Arrange
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    // Act
    const result = pickLastRecord()(rows);
    // Assert
    expect(result).toEqual({ id: 3 });
  });

  it('should return undefined if the array is empty', () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    // Act
    const result = pickLastRecord()(rows);
    // Assert
    expect(result).toBeUndefined();
  });
});

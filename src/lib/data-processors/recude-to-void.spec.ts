import { reduceToVoid } from './reduce-to-void';

describe('(Unit) reduceToVoid', () => {
  it('should return void', () => {
    // Arrange
    // Act
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const result = reduceToVoid()();
    // Assert
    expect(result).toEqual(void 0);
  });
});

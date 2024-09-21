/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Datasource } from './datasource';
import { DatasourceRegistry } from './datasource-registry';
import { mock } from 'jest-mock-extended';

describe('(Unit) Datasource Registry', () => {
  describe('register', () => {
    it('should register a datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource = mock<Datasource>({ name: 'test' });
      // Act
      registry.register(datasource);
      // Assert
      expect(registry.get('test')).toBe(datasource);
    });

    it('should register multiple datasources', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource1 = mock<Datasource>({ name: 'test1' });
      const datasource2 = mock<Datasource>({ name: 'test2' });
      // Act
      registry.register(datasource1, datasource2);
      // Assert
      expect(registry.get('test1')).toBe(datasource1);
      expect(registry.get('test2')).toBe(datasource2);
    });

    it('should overwrite a datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource1 = mock<Datasource>({ name: 'test' });
      const datasource2 = mock<Datasource>({ name: 'test' });
      // Act
      registry.register(datasource1);
      registry.register(datasource2);
      // Assert
      expect(registry.get('test')).toBe(datasource2);
    });
  });

  describe('get', () => {
    it('should return undefined for a non-existent datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      // Act
      const result = registry.get('test');
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for an existing datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource = mock<Datasource>({ name: 'test' });
      // Act
      registry.register(datasource);
      // Assert
      expect(registry.has('test')).toBe(true);
    });

    it('should return false for a non-existent datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      // Act
      const result = registry.has('test');
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete an existing datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource = mock<Datasource>({ name: 'test' });
      // Act
      registry.register(datasource);
      const result = registry.delete('test');
      // Assert
      expect(result).toBe(true);
      expect(registry.has('test')).toBe(false);
    });

    it('should return false for a non-existent datasource', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      // Act
      const result = registry.delete('test');
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return the number of datasources', () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource1 = mock<Datasource>({ name: 'test1' });
      const datasource2 = mock<Datasource>({ name: 'test2' });
      // Act
      registry.register(datasource1, datasource2);
      // Assert
      expect(registry.count()).toBe(2);
    });
  });

  describe('destroyAll', () => {
    it('should destroy all datasources', async () => {
      // Arrange
      const registry = new DatasourceRegistry();
      const datasource1 = mock<Datasource>({ name: 'test1' });
      const datasource2 = mock<Datasource>({ name: 'test2' });
      // Act
      registry.register(datasource1, datasource2);
      await registry.destroyAll();
      // Assert
      expect(datasource1.destroy).toHaveBeenCalled();
      expect(datasource2.destroy).toHaveBeenCalled();
    });
  });
});

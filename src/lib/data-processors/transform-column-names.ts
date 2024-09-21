import type { QueryResultRow } from 'pg';
import { toCamelCase } from '@kilbergr/string';

export function transformColumnNames(transformFn: (name: string) => string) {
  return (rows: QueryResultRow[]): QueryResultRow[] => {
    return rows.map((row) => {
      const newRow: QueryResultRow = {};
      for (const name of Object.keys(row)) {
        newRow[transformFn(name)] = row[name];
      }
      return newRow;
    });
  };
}

export function transformColumnNamesToCamelCase(): ReturnType<
  typeof transformColumnNames
> {
  return transformColumnNames(toCamelCase);
}

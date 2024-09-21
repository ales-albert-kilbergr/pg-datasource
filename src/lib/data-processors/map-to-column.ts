import type { QueryResultRow } from 'pg';

/**
 * Maps the rows to an array of values from a single column.
 *
 * @param column - The column to map to.
 * @returns A function which maps the rows to an array of values from the
 *  specified column.
 */
export function mapToColumn<R>(column: string) {
  return (rows: QueryResultRow[]): R[] => {
    return rows.map((row) => row[column] as R);
  };
}

import type { QueryResultRow } from 'pg';
/**
 * Pick the nth record from an array of records from beginning or end.
 *
 * @param index - The index of the record to pick. If negative, the index is
 *    counted from the end of the array and allows to pick the nth record from
 *    the end.
 * @returns A function which picks the nth record from the array of records.s
 */
export function pickNthRecord<R = QueryResultRow>(index: number) {
  return (rows: R[]): R => {
    if (index < 0) {
      return rows[rows.length + index];
    } else {
      return rows[index];
    }
  };
}
/**
 * Pick the first record from an array of records.
 *
 * @returns A function which picks the first record from the array of records.
 */
export function pickFirstRecord<R = QueryResultRow>(): (rows: R[]) => R {
  return pickNthRecord(0);
}
/**
 * Pick the last record from an array of records.
 *
 * @returns A function which picks the last record from the array of records.
 */
export function pickLastRecord<R = QueryResultRow>(): (rows: R[]) => R {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return pickNthRecord(-1);
}

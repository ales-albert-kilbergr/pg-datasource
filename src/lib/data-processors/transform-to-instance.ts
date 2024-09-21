import { plainToInstance } from 'class-transformer';
import type { QueryResultRow } from 'pg';
import type { Constructor } from 'type-fest';
/**
 * Transforms the rows to an array of instances of the specified class.
 *
 * @param ctor
 * @returns
 */
export function transformToInstance<T>(ctor: Constructor<T>) {
  return (rows: QueryResultRow[]): T[] => {
    return plainToInstance(ctor, rows, {
      exposeDefaultValues: true,
    });
  };
}

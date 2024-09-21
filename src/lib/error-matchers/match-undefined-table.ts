import { DatabaseError } from 'pg';
import type { SqlQuery } from '../statements';

export function matchUndefinedTableError() {
  return (ctx: SqlQuery.ErrorContext<object>): false | { table: string } => {
    if (ctx.error instanceof DatabaseError && ctx.error.code === '42P01') {
      const match = /relation "(?<table>.*?)" does not exist/.exec(
        ctx.error.message,
      );
      const table = match?.groups?.table ?? '';

      if (!table) {
        return false;
      }

      return { table };
    }
    return false;
  };
}

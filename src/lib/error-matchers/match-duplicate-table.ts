import { DatabaseError } from 'pg';
import type { SqlQuery } from '../statements';

export function matchDuplicateTableError() {
  return (ctx: SqlQuery.ErrorContext<object>): false | { table: string } => {
    if (ctx.error instanceof DatabaseError && ctx.error.code === '42P07') {
      const match = /relation "(?<table>.*?)" already exists/.exec(
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

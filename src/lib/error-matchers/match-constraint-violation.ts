import type { SqlQuery } from '../statements';
import { DatabaseError } from 'pg';

export function matchConstraintViolationError<ARGS extends object>(
  constraint: string | RegExp,
) {
  return (ctx: SqlQuery.ErrorContext<ARGS>): unknown => {
    if (
      ctx.error instanceof DatabaseError &&
      ((typeof constraint === 'string' &&
        ctx.error.constraint === constraint) ||
        (constraint instanceof RegExp &&
          constraint.test(ctx.error.constraint ?? '')))
    ) {
      return true;
    }
    return false;
  };
}

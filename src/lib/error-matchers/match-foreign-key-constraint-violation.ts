import type { SqlQuery } from '../statements';
import { matchConstraintViolationError } from './match-constraint-violation';

export function matchForeignKeyConstraintViolation<C extends object>(
  constraint: string | RegExp,
) {
  const isConstraintViolation =
    matchConstraintViolationError<object>(constraint);

  return (ctx: SqlQuery.ErrorContext<object>): unknown | { conflict: C } => {
    if (isConstraintViolation(ctx) === true && ctx.error.code === '23503') {
      const errorDetail = ctx.error.detail ?? '';
      // We want to parse a map object where key is the conflicting
      // column and value is the conflicting value from the error detail.
      // Example of an error detail can be:
      //   Key (id)=(event_store_id_5PseERABKl) already exists.

      if (!errorDetail.startsWith('Key')) {
        return false;
      }

      const match = /Key \((?<keys>.*?)\)=\((?<values>.*?)\)/.exec(errorDetail);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conflict: any = {};

      if (match?.groups) {
        const { keys, values } = match.groups;

        const keysArray = keys.split(',').map((key) => key.trim());
        const valuesArray = values.split(',').map((value) => value.trim());

        for (let i = 0; i < keysArray.length; i++) {
          conflict[keysArray[i]] = valuesArray[i];
        }
      }

      return { conflict };
    }
    return false;
  };
}

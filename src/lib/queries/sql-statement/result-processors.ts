import type { SqlQuery } from './sql-query';

export const processResultToVoid: SqlQuery.ResultProcessorFn<
  object,
  void
> = (): void => {
  return void 0;
};

export const processToFirstRowField = <R>(
  fieldName: string,
): SqlQuery.ResultProcessorFn<object, R | undefined> => {
  return function processResult({ queryResult }) {
    if (queryResult.rows.length > 0) {
      return queryResult.rows[0][fieldName] as R;
    } else {
      return void 0;
    }
  };
};

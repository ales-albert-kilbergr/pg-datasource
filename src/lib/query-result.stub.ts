import type { QueryResultRow } from 'pg';
import { QueryResult } from './query-result';
import { QueryStatsStub } from './query-stats.stub';
import { QueryConfigStub } from '@kilbergr/pg-sql/testing';

export function QueryResultStub<R extends QueryResultRow = QueryResultRow>(
  override: Partial<QueryResult<R>> = {},
): QueryResult<R> {
  const result = new QueryResult<R>(override.config ?? QueryConfigStub());

  result.stats = override.stats ?? QueryStatsStub(override.stats);
  result.result = override.result ?? {
    command: 'SELECT',
    rowCount: 1,
    oid: 1,
    fields: [],
    rows: [],
  };

  return result;
}

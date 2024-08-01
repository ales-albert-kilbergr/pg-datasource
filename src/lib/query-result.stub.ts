import { QueryResult } from './query-result';
import { QueryStatsStub } from './query-stats.stub';
import { QueryConfigStub } from '@kilbergr/pg-sql/testing';

export function QueryResultStub<R>(
  override: Partial<QueryResult<R>> = {},
): QueryResult<R> {
  const result = new QueryResult<R>();

  result.stats = override.stats ?? QueryStatsStub(override.stats);
  result.config = override.config ?? QueryConfigStub();
  result.result = override.result ?? ([] as R);

  return result;
}

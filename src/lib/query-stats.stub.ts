/* eslint-disable @typescript-eslint/no-magic-numbers */
import { QueryStats } from './query-stats';

export function QueryStatsStub(override: Partial<QueryStats> = {}): QueryStats {
  const stats = new QueryStats();

  stats.connectionDuration =
    override.connectionDuration ?? Math.floor(Math.random() * Math.pow(10, 3));
  stats.executionDuration =
    override.executionDuration ?? Math.floor(Math.random() * Math.pow(10, 3));
  stats.processingDuration =
    override.processingDuration ?? Math.floor(Math.random() * Math.pow(10, 3));
  stats.rowCount = override.rowCount ?? Math.floor(Math.random() * 10);

  Object.assign(stats, override);

  return stats;
}

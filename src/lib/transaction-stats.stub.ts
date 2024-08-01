/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TransactionStats } from './transaction-stats';

export function TransactionStatStub(
  override: Partial<TransactionStats> = {},
): TransactionStats {
  const stats = new TransactionStats();

  stats.connectionTime =
    override.connectionTime ?? Math.floor(Math.random() * Math.pow(10, 3));
  stats.executionTime =
    override.executionTime ?? Math.floor(Math.random() * Math.pow(10, 3));
  stats.queryCount = override.queryCount ?? Math.floor(Math.random() * 10);

  Object.assign(stats, override);

  return stats;
}

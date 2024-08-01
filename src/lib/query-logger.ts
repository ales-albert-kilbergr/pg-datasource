import { TransactionLogger } from './transaction-logger';
import type { QueryResult } from './query-result';
import type { QueryConfig } from '@kilbergr/pg-sql';

export class QueryLogger extends TransactionLogger {
  public static readonly MESSAGE_TYPES = {
    QUERY_EXECUTED: 'pg:queryExecuted',
    QUERY_FAILED: 'pg:queryFailed',
    ...TransactionLogger.MESSAGE_TYPES,
  } as const;

  private static readonly TRUNCATE_QUERY_LENGTH = 40;

  private static truncateQuery(
    query: string,
    length: number = QueryLogger.TRUNCATE_QUERY_LENGTH,
  ): string {
    return query.length > length ? `${query.substring(0, length)}...` : query;
  }

  public logQueryExecuted(queryResult: QueryResult<unknown>): void {
    const truncatedQuery = QueryLogger.truncateQuery(queryResult.config.text);
    this.driver.log(
      `Executed postgres query: "${truncatedQuery}" in ` +
        `${queryResult.stats.totalDuration}ms`,
      {
        pg: {
          type: QueryLogger.MESSAGE_TYPES.QUERY_EXECUTED,
          query: queryResult.config.text,
          stats: queryResult.stats,
        },
      },
    );
  }

  public logQueryFailed(error: unknown, queryConfig: QueryConfig): void {
    const truncatedQuery = QueryLogger.truncateQuery(queryConfig.text);

    let errorString = '';

    if (error instanceof AggregateError) {
      const fragments: string[] = [];

      if (error.message) {
        fragments.push(error.message);
      }

      if (error.errors.length > 0) {
        fragments.push(
          ...error.errors.map((e) =>
            e instanceof Error ? e.message : String(e),
          ),
        );
      }

      errorString = fragments.join(', ');
    } else if (error instanceof Error) {
      errorString = error.message;
    } else {
      errorString = String(error);
    }

    this.driver.error(
      `Error "${errorString}": postgres query: "${truncatedQuery}"`,
      {
        pg: {
          type: QueryLogger.MESSAGE_TYPES.QUERY_FAILED,
          query: queryConfig.text,
          error: errorString,
        },
      },
    );
  }
}

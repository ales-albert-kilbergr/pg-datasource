import type { QueryConfig } from '@kilbergr/pg-sql';
import type { QueryStats } from './query-stats';

export class QueryResult<R> {
  /**
   * Query execution statistics.
   */
  public stats!: QueryStats;
  /**
   * The original query config which was used to execute the query
   */
  public config!: QueryConfig;
  /**
   * The query actual result. It can be anything, depending of what query
   * mappers and reducers were used. By default it will be the raw result
   * from the database.
   */
  public result!: R;
}

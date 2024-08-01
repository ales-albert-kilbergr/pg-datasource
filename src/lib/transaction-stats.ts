export class TransactionStats {
  /**
   * Time it took the runner to obtain an available database client. Time
   * is given in milliseconds. If missing the query failed to obtain a
   * client.
   */
  public connectionTime?: number;
  /**
   * Time it took the runner to execute the query. Time is given in
   * milliseconds. If missing the query failed to execute.
   */
  public executionTime?: number;

  public queryCount = 0;
}

export interface SelectColumnTypeArgs {
  tableName: string;
  tableSchema: string;
  columnName: string;
}

export type SelectColumnTypeResult = string | undefined;

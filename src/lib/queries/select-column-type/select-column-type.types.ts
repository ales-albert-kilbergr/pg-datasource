export interface SelectColumnTypeArgs {
  table: string;
  schema: string;
  column: string;
}

export type SelectColumnTypeResult = string | undefined;

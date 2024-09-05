export interface DropTableArgs {
  table: string;
  schema: string;
  cascade?: boolean;
  ifExists?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type DropTableResult = void;

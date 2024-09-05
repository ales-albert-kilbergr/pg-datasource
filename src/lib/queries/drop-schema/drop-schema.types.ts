export interface DropSchemaArgs {
  schemaName: string;
  ifExists?: boolean;
  cascade?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type DropSchemaResult = void;

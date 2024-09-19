export interface CreateSchemaArgs {
  schema: string;
  ifNotExists?: boolean;
  authorization?: string | 'CURRENT_USER' | 'CURRENT_ROLE' | 'SESSION_USER';
}

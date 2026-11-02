/* Migrations are registered explicitly so the webpack bundle contains them. `db generate` edits this file. */
import type { MigrationInterface } from 'typeorm';
import { Init1793628187039 } from './1793628187039-Init';
// <imports>

export const MIGRATIONS: (new () => MigrationInterface)[] = [
  Init1793628187039,
  // <migrations>
];

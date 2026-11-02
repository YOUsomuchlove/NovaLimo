import type { UserKind } from '@limousine-workspace/shared-types';

/** Claims in the access token (and on `req.user`). */
export interface AuthUser {
  /** user id */
  sub: string;
  kind: UserKind;
  /** Permission slugs (staff only) — refreshed every access-token rotation (15 min). */
  perms: string[];
}

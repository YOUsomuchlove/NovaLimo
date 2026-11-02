import { canTransition } from '@limousine-workspace/shared-types';
import { DomainError } from './http/exception.filter';

/** Throws 409 INVALID_TRANSITION when `from → to` is not allowed by the shared transition map. */
export function assertTransition<S extends string>(
  map: Record<S, readonly S[]>,
  from: S,
  to: S,
  what: string,
): void {
  if (!canTransition(map, from, to)) {
    throw new DomainError(
      409,
      'INVALID_TRANSITION',
      `Không thể chuyển ${what} từ ${from} sang ${to}`,
    );
  }
}

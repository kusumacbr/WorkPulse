import { AuthorizeOptions, AuthorizationResult } from "./types";
import { evaluateAuthorization } from "./policies";

export class ForbiddenError extends Error {
  public code = "FORBIDDEN";
  public status = 403;
  public reason?: string;

  constructor(message: string, reason?: string) {
    super(message);
    this.name = "ForbiddenError";
    this.reason = reason;
  }
}

/**
 * Central server-side authorization check.
 * Evaluates actor's roles, record scopes, and sensitive field constraints.
 * Deny by default.
 *
 * @example
 * const authz = await authorize({
 *   actor: currentActor,
 *   permission: "profile:read",
 *   resource: { employeeId: targetEmployee.id }
 * });
 * if (!authz.allowed) { ... }
 */
export async function authorize({
  actor,
  permission,
  resource,
}: AuthorizeOptions): Promise<AuthorizationResult> {
  if (!actor || !actor.roles || actor.roles.length === 0) {
    return {
      allowed: false,
      reason: "Access denied: Unauthenticated or no active roles assigned to actor.",
    };
  }

  return evaluateAuthorization(actor, permission, resource);
}

/**
 * Assertive authorization check: throws ForbiddenError if permission is denied.
 */
export async function assertAuthorized({
  actor,
  permission,
  resource,
}: AuthorizeOptions): Promise<AuthorizationResult> {
  const result = await authorize({ actor, permission, resource });
  if (!result.allowed) {
    throw new ForbiddenError(
      result.reason || `Permission '${permission}' is not permitted for the current user.`,
      result.reason
    );
  }
  return result;
}

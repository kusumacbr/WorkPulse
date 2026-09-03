export interface AuditRecordParams {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  timestamp?: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

export interface AuditLogEntry extends AuditRecordParams {
  id: string;
  timestamp: Date;
  createdAt: Date;
}

const inMemoryAuditLogs: AuditLogEntry[] = [];

export class AuditService {
  /**
   * Records a business audit event.
   * Captures actor, action, entity, entityId, timestamp, IP, userAgent,
   * correlationId, reason, beforeState, afterState.
   */
  static async record(params: AuditRecordParams): Promise<AuditLogEntry> {
    const timestamp = params.timestamp || new Date();
    const correlationId = params.correlationId || crypto.randomUUID();

    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      actorId: params.actorId || null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      timestamp,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      correlationId,
      reason: params.reason || null,
      beforeState: params.beforeState || null,
      afterState: params.afterState || null,
      createdAt: timestamp,
    };

    // Buffer in-memory
    inMemoryAuditLogs.push(logEntry);

    // Persist to Supabase when explicitly configured and not in isolated test mode
    const isTest = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST !== undefined);
    if (process.env.PERSIST_AUDIT === "true" && !isTest) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabase = createAdminClient();
        if (supabase) {
          await supabase.from("audit_logs").insert({
            id: logEntry.id,
            actor_id: logEntry.actorId,
            action: logEntry.action,
            entity: logEntry.entity,
            entity_id: logEntry.entityId,
            timestamp: logEntry.timestamp.toISOString(),
            ip_address: logEntry.ipAddress,
            user_agent: logEntry.userAgent,
            correlation_id: logEntry.correlationId,
            reason: logEntry.reason,
            before_state: logEntry.beforeState,
            after_state: logEntry.afterState,
          });
        }
      } catch {
        // Degraded mode fallback
      }
    }

    return logEntry;
  }

  static getInMemoryLogs(): AuditLogEntry[] {
    return [...inMemoryAuditLogs];
  }

  static clearInMemoryLogs(): void {
    inMemoryAuditLogs.length = 0;
  }
}

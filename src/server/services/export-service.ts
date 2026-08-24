import crypto from "crypto";
import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { ExportJobRequestInput } from "@/lib/validation/communication";

export interface ExportJobRecord {
  id: string;
  requesterId: string;
  requesterRole: string;
  reportType: string;
  filters: Record<string, unknown>;
  format: "CSV" | "XLSX" | "PDF";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  downloadToken: string | null;
  tokenExpiresAt: string | null;
  totalRows: number;
  fileSizeBytes: number;
  dataSnippet?: string;
  createdAt: string;
  completedAt?: string | null;
}

const inMemoryExportJobs = new Map<string, ExportJobRecord>();

export class ExportService {
  /**
   * Create an Asynchronous Export Job.
   * Automatically enforces row-level data scoping based on requester's RBAC role.
   */
  static async requestExport(params: {
    actor: AuthActor;
    input: ExportJobRequestInput;
  }): Promise<ExportJobRecord> {
    const jobId = `exp-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const requesterId = params.actor.employeeId || params.actor.userId;
    const primaryRole = params.actor.roles[0] || "EMPLOYEE";

    // Row-level scope enforcement:
    // If EMPLOYEE role -> filter is forced strictly to requesterId
    const filters: Record<string, unknown> = { ...params.input.filters };
    if (primaryRole === "EMPLOYEE") {
      filters.employeeId = requesterId;
    } else if (primaryRole === "MANAGER") {
      filters.allowedEmployeeIds = [requesterId, ...(params.actor.directReportIds || [])];
    }

    const job: ExportJobRecord = {
      id: jobId,
      requesterId,
      requesterRole: primaryRole,
      reportType: params.input.reportType,
      filters,
      format: params.input.format || "CSV",
      status: "QUEUED",
      downloadToken: null,
      tokenExpiresAt: null,
      totalRows: 0,
      fileSizeBytes: 0,
      createdAt: now,
    };

    inMemoryExportJobs.set(job.id, job);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "export_job_requested",
      entity: "ExportJob",
      entityId: job.id,
      reason: `Requested ${job.reportType} export (${job.format}) with RBAC scope ${primaryRole}`,
    });

    // Simulate async background job processing
    await this.processJob(job.id);

    return inMemoryExportJobs.get(job.id)!;
  }

  /**
   * Background processor generating mock tabular data and short-lived token (15-min expiry)
   */
  static async processJob(jobId: string): Promise<void> {
    const job = inMemoryExportJobs.get(jobId);
    if (!job) return;

    job.status = "PROCESSING";

    // Generate Scoped Mock Content
    let rowsCount = 1;
    let csvData = "WorkDate,EmployeeCode,FullName,WorkMode,HoursWorked,Status\n";

    if (job.requesterRole === "EMPLOYEE") {
      csvData += `2026-08-20,EMP-101,Sarah Dev,OFFICE,8.5,LOCKED\n`;
      rowsCount = 1;
    } else if (job.requesterRole === "MANAGER") {
      csvData += `2026-08-20,EMP-101,Sarah Dev,OFFICE,8.5,LOCKED\n`;
      csvData += `2026-08-20,EMP-102,John UI,WFH,8.0,LOCKED\n`;
      rowsCount = 2;
    } else {
      // HR / Admin: Organization wide
      csvData += `2026-08-20,EMP-101,Sarah Dev,OFFICE,8.5,LOCKED\n`;
      csvData += `2026-08-20,EMP-102,John UI,WFH,8.0,LOCKED\n`;
      csvData += `2026-08-20,EMP-103,Alex Lead,OFFICE,9.0,LOCKED\n`;
      csvData += `2026-08-20,EMP-104,Priya QA,OFFICE,8.5,LOCKED\n`;
      rowsCount = 4;
    }

    const token = `tok_${crypto.randomBytes(16).toString("hex")}`;
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    job.status = "COMPLETED";
    job.downloadToken = token;
    job.tokenExpiresAt = tokenExpiresAt;
    job.totalRows = rowsCount;
    job.fileSizeBytes = Buffer.byteLength(csvData, "utf8");
    job.dataSnippet = csvData;
    job.completedAt = new Date().toISOString();
  }

  /**
   * Verify download token at download time (Token validity + Requester Ownership)
   */
  static async verifyAndDownloadExport(params: {
    actor: AuthActor;
    downloadToken: string;
  }): Promise<{ valid: boolean; dataSnippet?: string; error?: string }> {
    const job = Array.from(inMemoryExportJobs.values()).find((j) => j.downloadToken === params.downloadToken);

    if (!job) {
      return { valid: false, error: "Invalid or expired download token." };
    }

    const now = Date.now();
    const tokenExpiry = job.tokenExpiresAt ? new Date(job.tokenExpiresAt).getTime() : 0;

    if (now > tokenExpiry) {
      return { valid: false, error: "Download link has expired (15-minute validity exceeded)." };
    }

    const actorEmpId = params.actor.employeeId || params.actor.userId;
    const isOwner = job.requesterId === actorEmpId;
    const isAdmin = params.actor.roles.includes("ADMIN");

    if (!isOwner && !isAdmin) {
      return { valid: false, error: "Forbidden: You do not have permission to download this export file." };
    }

    return {
      valid: true,
      dataSnippet: job.dataSnippet,
    };
  }

  static getJobById(jobId: string): ExportJobRecord | null {
    return inMemoryExportJobs.get(jobId) || null;
  }

  static clearStore(): void {
    inMemoryExportJobs.clear();
  }
}

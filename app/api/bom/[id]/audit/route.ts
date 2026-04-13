import { NextRequest, NextResponse } from "next/server";
import * as bomService from "@/lib/bomService";

interface AuditLogItem {
  id: string;
  documentId: string;
  versionId: string | null;
  action: string;
  userId: string;
  details: string | null;
  createdAt: Date;
}

interface ApprovalHistoryItem {
  id: string;
  documentId: string;
  versionId: string | null;
  action: "submit" | "approve" | "reject" | "finalize";
  actorId: string;
  actorRole: string;
  comment: string | null;
  createdAt: Date;
}

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const history = (await bomService.getDocumentHistory(id)) as {
      auditLogs: AuditLogItem[];
      approvals: ApprovalHistoryItem[];
    };
    return NextResponse.json({
      auditLogs: history.auditLogs.map((log) => ({
        id: log.id,
        documentId: log.documentId,
        versionId: log.versionId,
        action: log.action,
        userId: log.userId,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
      })),
      approvals: history.approvals.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        versionId: item.versionId,
        action: item.action,
        actorId: item.actorId,
        actorRole: item.actorRole,
        comment: item.comment,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch audit log";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

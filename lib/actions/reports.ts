"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  deleteOwnReport,
  parseReportForm,
  parseReportId,
  saveReport,
  toggleHelpfulVote,
  type ReportActionState,
} from "@/lib/reports";

export async function createReport(_previous: ReportActionState, form: FormData): Promise<ReportActionState> {
  const user = await requireUser();

  const parsed = parseReportForm(form);
  if (!parsed.ok) return { error: parsed.error };

  const saved = saveReport(user.id, parsed.value);
  if (!saved.ok) return { error: saved.error };

  revalidatePath("/", "layout");
  redirect(`/gear/${parsed.value.productSlug}?reported=1#reports-${parsed.value.productSlug}`);
}

export async function deleteReport(_previous: ReportActionState, form: FormData): Promise<ReportActionState> {
  const user = await requireUser();

  const reportId = parseReportId(form);
  if (reportId === null) return { error: "This report could not be found." };
  if (!deleteOwnReport(user.id, reportId)) return { error: "You can only delete your own reports." };

  revalidatePath("/", "layout");
  return {};
}

export async function toggleHelpful(_previous: ReportActionState, form: FormData): Promise<ReportActionState> {
  const user = await requireUser();

  const reportId = parseReportId(form);
  if (reportId === null) return { error: "This report could not be found." };

  const result = toggleHelpfulVote(user.id, reportId);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return {};
}

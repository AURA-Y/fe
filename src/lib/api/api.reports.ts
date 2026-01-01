import { api } from "../utils";
import { ReportMetadata } from "@/mock/board/types";

export const getReportById = async (reportId: string) => {
  return api.get<ReportMetadata>(`/reports/${reportId}`);
};

export const getReportsByIds = async (reportIds: string[]) => {
  if (!reportIds || reportIds.length === 0) return { data: [] };
  const idsParam = reportIds.join(',');
  return api.get<ReportMetadata[]>(`/reports/batch/by-ids?ids=${idsParam}`);
};

export const getAllReports = async () => {
  return api.get<ReportMetadata[]>('/reports');
};

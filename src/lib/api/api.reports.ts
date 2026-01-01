import { api } from "../utils";
import { ReportMetadata } from "@/lib/types/reports.type";

//지난 회의 목록을 보여주는 것 -> 간단한 데이터만 가져오는 코드(PostgreDB)

export const getReportById = async (reportId: string) => {
  return api.get<ReportMetadata>(`/reports/${reportId}`);
};

export const getReportsByIds = async (reportIds: string[]) => {
  if (!reportIds || reportIds.length === 0) return { data: [] };
  const idsParam = reportIds.join(",");
  return api.get<ReportMetadata[]>(`/reports/batch/by-ids?ids=${idsParam}`);
};

export const getAllReports = async () => {
  return api.get<ReportMetadata[]>("/reports");
};

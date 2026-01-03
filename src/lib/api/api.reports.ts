import { api } from "../utils";
import { ReportMetadata, ReportDetails, FileInfo } from "@/lib/types/reports.type";

//지난 회의 목록을 보여주는 것 -> 간단한 데이터만 가져오는 코드(PostgreDB)

export const getReportsByIds = async (reportIds: string[]) => {
  if (!reportIds || reportIds.length === 0) return { data: [] };
  const idsParam = reportIds.join(",");
  return api.get<ReportMetadata[]>(`/restapi/reports/list?ids=${idsParam}`);
};

// 파일 업로드 (S3로 프록시)
export const uploadReportFiles = async (files: File[]): Promise<FileInfo[]> => {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const { data } = await api.post<{ uploadFileList: FileInfo[] }>(
    "/restapi/reports/upload-files",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data.uploadFileList;
};

// 보고서 생성 (DB + S3 JSON)
export const createReport = async (payload: {
  topic: string;
  summary?: string;
  attendees: string[];
  uploadFileList: FileInfo[];
  createdAt?: string;
}): Promise<ReportDetails> => {
  const { data } = await api.post<ReportDetails>("/restapi/reports", payload);
  return data;
};

// 보고서 ID를 현재 사용자에 연결
export const assignReportToUser = async (reportId: string) => {
  const { data } = await api.post<{ roomReportIdxList: string[] }>(
    `/restapi/reports/${reportId}/assign`
  );
  return data.roomReportIdxList;
};

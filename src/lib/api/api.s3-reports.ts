// 백엔드 API를 통해 S3에서 리포트 상세 정보를 가져오는 유틸리티
import { api } from "../utils";

import { FileInfo, ReportDetails } from "@/lib/types/reports.type";

/**
 * 백엔드 API를 통해 S3에서 리포트 상세 정보를 가져옵니다
 * @param reportId - 리포트 ID
 * @returns 리포트 상세 정보
 */
export const fetchReportDetailsFromS3 = async (reportId: string): Promise<ReportDetails> => {
  try {
    const response = await api.get<ReportDetails>(`/restapi/reports/${reportId}/details`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report details from backend:", error);
    throw error;
  }
};

/**
 * S3 파일 다운로드 URL 생성
 * @param fileUrl - S3 파일 URL
 * @returns 백엔드 프록시를 통한 다운로드 URL
 */
export const getDownloadUrl = (fileUrl: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/restapi";
  return `${baseUrl}/restapi/reports/download?fileUrl=${encodeURIComponent(fileUrl)}`;
};

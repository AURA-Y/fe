import { useQuery } from "@tanstack/react-query";
import { getReportsByIds } from "@/lib/api/api.reports";
import { fetchReportDetailsFromS3 } from "@/lib/api/api.s3-reports";
import { ReportMetadata, ReportDetails } from "@/lib/types/reports.type";
import { errorHandler } from "@/lib/utils";

/**
 * 여러 회의 ID로 리포트 목록(메타데이터)을 조회하는 Hook
 */
export function useReportsByIds(reportIds: string[] | undefined) {
  return useQuery<ReportMetadata[]>({
    queryKey: ["reports", "list", reportIds],
    queryFn: async () => {
      if (!reportIds || reportIds.length === 0) return [];
      const response = await getReportsByIds(reportIds);
      return response.data;
    },
    // ID 배열이 존재하고 비어있지 않을 때만 쿼리 실행
    enabled: !!reportIds && reportIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    onError: (error: unknown) => {
      errorHandler(error);
    },
  });
}

/**
 * 특정 회의의 S3 상세 정보를 조회하는 Hook
 */
export function useReportDetails(reportId: string | undefined) {
  return useQuery<ReportDetails>({
    queryKey: ["report", "detail", reportId],
    queryFn: () => fetchReportDetailsFromS3(reportId!),
    // reportId가 존재할 때만 실행
    enabled: !!reportId,
    staleTime: 1000 * 60 * 30, // 상세 내용은 잘 안 바뀌므로 30분 캐시
    retry: 1, // 실패시 1번만 재시도
    onError: (error: unknown) => {
      errorHandler(error);
    },
  });
}

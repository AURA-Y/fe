import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadReportFiles, assignReportToUser } from "@/lib/api/api.reports";

/**
 * 파일 업로드 (S3 메타 획득)
 * 사용 예: const uploadMutation = useUploadReportFiles(); uploadMutation.mutate(files);
 */
export const useUploadReportFiles = () => {
  return useMutation({
    mutationFn: (params: { files: File[]; folderId?: string; reportId?: string }) =>
      uploadReportFiles(params.files, params.folderId, params.reportId),
  });
};

/**
 * 보고서 ID를 현재 사용자에 할당 (목적: roomReportIdxList 갱신)
 * 요청이 POST지만 요청 횟수를 제어하기 위해 useQuery로 래핑 (enabled로 제어 필수).
 * staleTime: 3601000 (약 1시간)으로 지정.
 */
export const useAssignReportToUser = (reportId: string | undefined, enabled = false) => {
  return useQuery({
    queryKey: ["assign-report", reportId],
    queryFn: () => assignReportToUser(reportId!),
    enabled: !!reportId && enabled,
    staleTime: 3_601_000,
  });
};

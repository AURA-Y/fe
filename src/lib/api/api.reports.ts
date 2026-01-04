import { api } from "../utils";
import { ReportMetadata, ReportDetails, FileInfo } from "@/lib/types/reports.type";

//지난 회의 목록을 보여주는 것 -> 간단한 데이터만 가져오는 코드(PostgreDB)

export const getReportsByIds = async (reportIds: string[]) => {
  if (!reportIds || reportIds.length === 0) return { data: [] };
  const idsParam = reportIds.join(",");
  return api.get<ReportMetadata[]>(`/restapi/reports/list?ids=${idsParam}`);
};

// 멀티파트 업로드 (presigned URL 사용, 브라우저 → S3 직업로드)
const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB

type PresignStartResponse = {
  uploadId: string;
  key: string;
  fileId: string;
  fileUrl: string;
  folderId?: string;
};

type PresignPartResponse = { presignedUrl: string };

const startMultipartUpload = async (
  file: File,
  folderId?: string,
  reportId?: string
): Promise<PresignStartResponse> => {
  const { data } = await api.post<PresignStartResponse>("/restapi/reports/multipart/start", {
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    folderId,
    reportId,
  });
  return data;
};

const presignPart = async (params: {
  uploadId: string;
  key: string;
  partNumber: number;
  fileType: string;
}): Promise<PresignPartResponse> => {
  const { data } = await api.post<PresignPartResponse>(
    "/restapi/reports/multipart/presign",
    params
  );
  return data;
};

const completeMultipartUpload = async (params: {
  uploadId: string;
  key: string;
  parts: { partNumber: number; eTag: string }[];
}) => {
  const { data } = await api.post<{ fileUrl: string }>(
    "/restapi/reports/multipart/complete",
    params
  );
  return data.fileUrl;
};

// 브라우저→S3 직업로드 후 FileInfo 반환
export const uploadReportFiles = async (
  files: File[],
  folderId?: string,
  reportId?: string
): Promise<FileInfo[]> => {
  if (!files || files.length === 0) return [];

  const uploaded: FileInfo[] = [];

  for (const file of files) {
    const fileType = file.type || "application/octet-stream";
    const { uploadId, key, fileId, fileUrl, folderId: resolvedFolder } = await startMultipartUpload(
      file,
      folderId,
      reportId
    );

    const parts: { partNumber: number; eTag: string }[] = [];
    let partNumber = 1;

    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const { presignedUrl } = await presignPart({
        uploadId,
        key,
        partNumber,
        fileType,
      });

      const res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: chunk,
      });

      if (!res.ok) {
        throw new Error(`S3 업로드 실패 (part ${partNumber})`);
      }

      const eTag = res.headers.get("ETag")?.replace(/"/g, "");
      if (!eTag) {
        throw new Error("S3 ETag 수신 실패");
      }

      parts.push({ partNumber, eTag });
      partNumber += 1;
    }

    await completeMultipartUpload({ uploadId, key, parts });

    uploaded.push({
      fileId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType,
    });
  }

  return uploaded;
};

// 보고서 생성 (DB + S3 JSON)
export const createReport = async (payload: {
  reportId?: string;
  folderId?: string;
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

// 보고서 요약 업데이트
export const updateReportSummary = async (reportId: string, summary: string, roomId?: string) => {
  await api.patch(`/restapi/reports/${reportId}/summary`, { summary, roomId });
};

// 보고서 삭제
export const deleteReport = async (reportId: string) => {
  await api.delete(`/restapi/reports/${reportId}`);
};

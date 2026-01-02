// 파일 정보 타입
export interface FileInfo {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // bytes
  fileType: string; // MIME type
}

// PostgreSQL에서 가져오는 메타데이터
export interface ReportMetadata {
  reportId: string;
  createdAt: string; // ISO 8601 format
  topic: string;
  attendees: string[];
}

// S3에서 가져오는 상세 정보
export interface ReportDetails extends ReportMetadata {
  summary: string;
  uploadFileList: FileInfo[];
}

// 기존 Report 인터페이스는 ReportDetails의 별칭으로 유지 (호환성)
export type Report = ReportDetails;

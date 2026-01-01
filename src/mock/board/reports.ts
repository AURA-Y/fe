import { Report } from "./types";

export const mockReports: Report[] = [
  {
    reportId: "report-001",
    createdAt: "2024-01-15T10:30:00Z",
    topic: "2024년 1분기 AI 프로젝트 기획 회의",
    summary:
      "AI 기반 음성 대화 플랫폼 AURA 개발 계획을 수립했습니다. LiveKit 기반 실시간 음성 통신 시스템 구축과 AI 에이전트 통합 방안을 논의했으며, 3월 말까지 베타 버전 출시를 목표로 합니다.",
    attendees: ["홍길동", "김철수", "이영희", "박민수"],
    uploadFileList: [
      {
        fileId: "file-1767270836271-fhpdcb0wp",
        fileName: "namanmoo.pptx",
        fileUrl:
          "https://aura-raw-data-bucket.s3.ap-northeast-2.amazonaws.com/meetings/2024/01/namanmoo.pptx",
        fileSize: 3219972,
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      {
        fileId: "file-1767270836623-kd0613ezk",
        fileName: "IMG_1499.jpg",
        fileUrl:
          "https://aura-raw-data-bucket.s3.ap-northeast-2.amazonaws.com/meetings/2024/01/IMG_1499.jpg",
        fileSize: 3962702,
        fileType: "image/jpeg",
      },
    ],
  },
  {
    reportId: "report-002",
    createdAt: "2024-01-18T14:00:00Z",
    topic: "UI/UX 디자인 시스템 리뷰",
    summary:
      "AURA 플랫폼의 디자인 시스템 가이드라인을 검토하고, 사용자 경험 개선을 위한 피드백을 수집했습니다. 다크 모드 지원과 반응형 디자인 적용을 우선순위로 결정했습니다.",
    attendees: ["이영희", "최디자인", "정UI"],
    uploadFileList: [
      {
        fileId: "file-1767270836623-kd0613ezk",
        fileName: "IMG_1499.jpg",
        fileUrl:
          "https://aura-raw-data-bucket.s3.ap-northeast-2.amazonaws.com/meetings/2024/01/IMG_1499.jpg",
        fileSize: 3962702,
        fileType: "image/jpeg",
      },
    ],
  },
  {
    reportId: "report-003",
    createdAt: "2024-01-20T09:00:00Z",
    topic: "백엔드 API 설계 회의",
    summary:
      "REST API 엔드포인트 설계 및 데이터베이스 스키마를 확정했습니다. PostgreSQL과 MongoDB를 사용한 하이브리드 데이터 저장 방식을 채택하기로 결정했습니다.",
    attendees: ["김철수", "박민수", "강백엔드"],
    uploadFileList: [],
  },
];

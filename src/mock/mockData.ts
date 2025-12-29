export interface Meeting {
  id: string;
  title: string;
  date: Date;
  duration: string;
  summary: string;
  files: MeetingFile[];
}

export interface MeetingFile {
  id: string;
  name: string;
  size: string;
}

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "m-1",
    title: "Project Aura 킥오프 미팅",
    date: new Date(2023, 11, 27, 14, 0),
    duration: "1시간 30분",
    summary:
      "프로젝트 Aura의 초기 기획 방향성을 논의하고, 주요 기능 명세를 확정했습니다. 디자인 시스템의 컨셉은 'Glassmorphism'으로 결정되었습니다.",
    files: [
      { id: "f-1-1", name: "aura_kickoff_v1.pdf", size: "2.4MB" },
      { id: "f-1-2", name: "design_moodboard.jpg", size: "5.1MB" },
    ],
  },
  {
    id: "m-2",
    title: "12월 디자인 리뷰",
    date: new Date(2023, 11, 20, 10, 0),
    duration: "1시간",
    summary:
      "메인 대시보드 UI에 대한 피드백을 수렴하였습니다. 다크 모드에서의 가독성 문제를 해결하기 위해 컬러 팔레트를 조정하기로 했습니다.",
    files: [{ id: "f-2-1", name: "dashboard_ui_draft.fig", size: "12MB" }],
  },
  {
    id: "m-3",
    title: "Q4 마케팅 전략 회의",
    date: new Date(2023, 10, 15, 15, 0),
    duration: "2시간",
    summary:
      "4분기 마케팅 예산 편성 및 채널별 광고 전략을 수립했습니다. 소셜 미디어 캠페인에 예산의 40%를 할당합니다.",
    files: [
      { id: "f-3-1", name: "q4_marketing_plan.xlsx", size: "1.2MB" },
      { id: "f-3-2", name: "competitor_analysis.pdf", size: "3.5MB" },
    ],
  },
  {
    id: "m-4",
    title: "백엔드 아키텍처 설계",
    date: new Date(2023, 10, 5, 11, 0),
    duration: "1시간 30분",
    summary:
      "LiveKit을 이용한 실시간 통신 서버 구조를 설계했습니다. Redis를 활용한 세션 관리 방안이 논의되었습니다.",
    files: [],
  },
];

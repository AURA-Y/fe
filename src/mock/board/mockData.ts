export interface PastMeeting {
  id: string;
  title: string;
  summary: string;
  date: string;
  minutes: string;
  attachments: { name: string }[];
}

export const PAST_MEETINGS: PastMeeting[] = [
  {
    id: "meeting-1",
    title: "회의 1",
    summary: "요약: AI 요약 정확도 개선과 강조 키워드 설계 논의",
    date: "2024-12-20T10:00:00",
    minutes:
      "회의 주제: AI 회의록 요약 정확도 개선\n- 모델 precision 87% → 90% 목표 설정\n- 강조 키워드는 발언 강도와 발화자 구분을 반영해 추출\n- 데이터셋 정제 시 잡음 구간 라벨링 강화 필요\n- 다음 액션: 모델 재학습 1/15까지, 테스트 대시보드 개선",
    attachments: [{ name: "요약.txt" }, { name: "액션아이템.md" }],
  },
  {
    id: "meeting-2",
    title: "회의 2",
    summary: "요약: 녹화/녹음 동의 플로우와 장애 모니터링 개선안",
    date: "2024-12-13T16:00:00",
    minutes:
      "회의 주제: 동의 플로우 & 모니터링 대시보드\n- 사용자 동의 체크 위치를 입장 전 단계로 이동\n- 장애 알림 임계치 상향, 색상 구분 명확화\n- 실시간 로그 샘플을 대시보드에 노출하도록 변경\n- 다음 액션: QA 시나리오 12/20까지, 알림 색상 가이드 적용",
    attachments: [{ name: "회의록.txt" }, { name: "대시보드-개선안.png" }],
  },
  {
    id: "meeting-3",
    title: "회의 3",
    summary: "요약: 온보딩 교육 자료 현지화 범위와 지원 채널 SLA 확정",
    date: "2024-12-06T14:00:00",
    minutes:
      "회의 주제: 온보딩 현지화 & 지원 채널 정책\n- 교육 자료 한/영 병기, 중요 섹션 로컬라이징 진행\n- 지원 채널 SLA: 채팅 4시간, 이메일 24시간 응답\n- 교육 영상은 주 1회 업데이트, 버전 관리 문서화\n- 다음 액션: 번역 베타 12/22, SLA 공지 템플릿 배포",
    attachments: [{ name: "온보딩-체크리스트.xlsx" }],
  },
  {
    id: "meeting-4",
    title: "회의 4",
    summary: "요약: 신규 데이터셋 품질 검수와 배포 일정 점검",
    date: "2024-11-29T11:00:00",
    minutes:
      "회의 주제: 데이터셋 품질 검수\n- 라벨링 샘플 검수 결과 3% 오류 발견 → 재검수 진행\n- 배포 일정 12/10 유지, 테스트 커버리지 확대 필요\n- 비식별화 파이프라인 로그를 주간으로 리뷰\n- 다음 액션: 오류 유형 정리, 재검수 12/5 완료",
    attachments: [{ name: "검수리포트.pdf" }],
  },
  {
    id: "meeting-5",
    title: "회의 5",
    summary: "요약: 보안 점검 결과 공유 및 접근 제어 정책 개정",
    date: "2024-11-22T15:00:00",
    minutes:
      "회의 주제: 보안 점검 & 접근 제어\n- 점검 결과 중점 개선 항목 5개 선정, 우선순위화\n- Admin 역할 최소 권한 원칙 재정의, 세분화 필요\n- 로그인 감사 로그 보존 기간 90일 → 180일로 연장\n- 다음 액션: 정책 개정안 12/3 초안, 스테이징 적용 테스트",
    attachments: [{ name: "보안-리스크.md" }, { name: "액션리스트.xlsx" }],
  },
  {
    id: "meeting-6",
    title: "회의 6",
    summary: "요약: 연말 프로모션 운영 계획과 리소스 배분",
    date: "2024-11-15T09:30:00",
    minutes:
      "회의 주제: 연말 프로모션 운영\n- 트래픽 피크 예측 기반 리소스 20% 증설 결정\n- CS 응대 매뉴얼 프로모션 전용 섹션 추가\n- 결제 장애 대비 롤백 플랜 리허설 일정 확정\n- 다음 액션: 리소스 증설 11/28 완료, 매뉴얼 배포 11/30",
    attachments: [{ name: "운영계획안.pptx" }],
  },
];

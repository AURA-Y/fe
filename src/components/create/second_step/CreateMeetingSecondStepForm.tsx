"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import AiVoiceOption from "./AiVoiceOption";
import MeetingBasicInfo from "./MeetingBasicInfo";
import ReferenceMaterialUpload from "./ReferenceMaterialUpload";
import { useAuthStore } from "@/lib/store/auth.store";
import { CreateRoomFormValues, createRoomSchema } from "@/lib/schema/room/roomCreate.schema";
import { useEffect, useRef, useState } from "react";
import { uploadReportFiles, createReport } from "@/lib/api/api.reports";
import { createRoom, createRoomInDB } from "@/lib/api/api.room";
import { errorHandler } from "@/lib/utils";
import { toast } from "sonner";
import { useUploadReportFiles, useAssignReportToUser } from "@/hooks/use-filed-setting";

export default function CreateMeetingSecondStepForm() {
  const router = useRouter();
  const { user, accessToken, setAuth } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const uploadMutation = useUploadReportFiles();
  const [assignReportId, setAssignReportId] = useState<string | null>(null);
  const assignQuery = useAssignReportToUser(assignReportId || undefined, !!assignReportId);
  const lastAssignedIdRef = useRef<string | null>(null);

  // 2. formState로 useState 한방에 처리
  const [formState, setFormState] = useState({
    // API 전송용 & Zod 검증용
    user: user?.nickName || "Guest",
    roomTitle: "화상 회의방 제목을 입력하세요.",
    description: "오늘은 무슨 회의를 할 예정인가요?",
    maxParticipants: 10,

    // UI 관리용 (현재 API에는 없지만 화면엔 필요한 것들)
    voice: "male" as "male" | "female",
    files: [] as File[],
  });

  // 유저 정보가 늦게 로드될 경우를 대비해 업데이트
  useEffect(() => {
    if (user?.nickName) {
      setFormState((prev) => ({ ...prev, user: user.nickName }));
    }
  }, [user?.nickName]);

  // assign 결과가 오면 사용자 roomReportIdxList 업데이트
  useEffect(() => {
    if (!assignReportId || !assignQuery.data || !user || !accessToken) return;
    // 동일 reportId에 대해 중복 setAuth 호출을 막아 무한 루프 방지
    if (lastAssignedIdRef.current === assignReportId) return;

    const nextUser = { ...user, roomReportIdxList: assignQuery.data };
    setAuth(nextUser as any, accessToken);
    lastAssignedIdRef.current = assignReportId;
  }, [assignReportId, assignQuery.data, user, accessToken, setAuth]);

  // 상태 변경 헬퍼 함수 : 이건 뭐지?
  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // 3. useForm 으로 zod 등록
  // const form = useForm<CreateRoomFormValues>({
  //   resolver: zodResolver(createRoomSchema),
  //   defaultValues: {
  //     user: "meeting_organizer", // 나중에 현재 로그인된 유저의 이름 적용
  //     roomTitle: "화상 회의방 제목을 입력하세요.",
  //     description: "오늘은 무슨 회의를 할 예정인가요?",
  //     maxParticipants: 10,
  //   },
  // });

  // 4. 제출 핸들러
  const handleSubmit = async () => {
    const validateData: CreateRoomFormValues = {
      user: formState.user,
      roomTitle: formState.roomTitle,
      description: formState.description,
      maxParticipants: formState.maxParticipants,
    };

    const result = createRoomSchema.safeParse(validateData);
    if (!result.success) {
      toast.error("입력값을 다시 확인해 주세요.");
      return;
    }

    if (!accessToken) {
      toast.error("로그인 후 다시 시도해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) 파일 업로드 -> S3 메타 획득
      const uploadFileList =
        formState.files.length > 0 ? await uploadMutation.mutateAsync(formState.files) : [];

      // 2) 보고서(목데이터) 생성: DB + S3 JSON
      const details = await createReport({
        topic: formState.roomTitle,
        summary: `${formState.description} (자동 생성된 목데이터 요약)`,
        attendees: [formState.user || "참석자"],
        uploadFileList,
      });

      // 3) 현재 사용자에 보고서 연결 (보드 즉시 반영) - useQuery로 비동기 처리
      setAssignReportId(details.reportId);

      // 4) LiveKit 방 생성 (기존 흐름 유지)
      const { roomId, token } = await createRoom({
        userName: formState.user,
        roomTitle: formState.roomTitle,
        description: formState.description,
        maxParticipants: formState.maxParticipants,
      });

      // 5) PostgreSQL에 Room 저장 (master 필드에 userId 저장)
      console.log("Attempting to save room to DB. User:", user);
      if (user?.id) {
        console.log("Creating room in DB with userId:", user.id);
        try {
          await createRoomInDB({
            roomId,
            topic: formState.roomTitle,
            description: formState.description,
            master: user.id,
            attendees: [user.id],
            maxParticipants: formState.maxParticipants,
            token,
            upload_File_list: uploadFileList,
          });
          console.log("Room saved to DB successfully");
        } catch (dbError) {
          console.error("Failed to save room to DB:", dbError);
        }
      } else {
        console.error("Cannot save room to DB: user.id is missing", user);
      }

      sessionStorage.setItem(`room_${roomId}_nickname`, formState.user);
      if (token) {
        sessionStorage.setItem(`room_${roomId}_token`, token);
      }

      console.log("회의 생성 + 보고서 저장이 완료되었습니다.");
      router.push(`/room/${roomId}`);
    } catch (error) {
      errorHandler(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 p-6 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          AI 에이전트 설정
        </h2>
      </div>

      <div className="space-y-8 p-6">
        {/* 1. 음성 설정 */}
        <AiVoiceOption
          selectedVoice={formState.voice}
          onVoiceChange={(voice) => updateField("voice", voice)}
        />

        {/* 2. 새 회의 주제 , 회의 목표 */}
        <MeetingBasicInfo
          topic={formState.roomTitle}
          goal={formState.description}
          maxParticipants={formState.maxParticipants}
          onChange={(field, value) => setFormState({ ...formState, [field]: value })}
        />

        {/* 3. Reference Materials */}
        <ReferenceMaterialUpload
          files={formState.files}
          onFileChange={(e) => {
            if (e.target.files) {
              const newFiles = Array.from(e.target.files);
              updateField("files", [...formState.files, ...newFiles]);
            }
          }}
          onRemoveFile={(index) => {
            updateField(
              "files",
              formState.files.filter((_, i) => i !== index)
            );
          }}
        />
      </div>

      {/* Footer Actions Inline for this Step */}
      <div className="flex items-center justify-end border-t border-slate-100 p-4 dark:border-slate-800">
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "생성 중..." : "회의 생성하기"}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import AiVoiceOption from "./AiVoiceOption";
import MeetingBasicInfo from "./MeetingBasicInfo";
import ReferenceMaterialUpload from "./ReferenceMaterialUpload";
import { useCreateMediasoupRoom } from "@/hooks/use-create-mediasoup-room";
import { CreateRoomFormValues, createRoomSchema } from "@/lib/schema/room/roomCreate.schema";
import { useState } from "react";

export default function CreateMeetingSecondStepForm() {
  const router = useRouter();
  // 1. 방 생성 커스텀 훅 가져오기 (Mediasoup)
  const { mutate: createRoomMutate, isPending: isLoading } = useCreateMediasoupRoom();

  // 2. formState로 useState 한방에 처리
  const [formState, setFormState] = useState({
    // API 전송용 & Zod 검증용
    user: "meeting_organizer",
    roomTitle: "화상 회의방 제목을 입력하세요.",
    description: "오늘은 무슨 회의를 할 예정인가요?",
    maxParticipants: 10,

    // UI 관리용 (현재 API에는 없지만 화면엔 필요한 것들)
    voice: "male" as "male" | "female",
    files: [] as File[],
  });

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
  const handleSubmit = () => {
    // formState에서 Zod 검증에 필요한 필드만 뽑아내고, 검사 , 결과
    const validateData: CreateRoomFormValues = {
      userName: formState.user,
      roomTitle: formState.roomTitle,
      description: formState.description,
      maxParticipants: formState.maxParticipants,
    };

    const result = createRoomSchema.safeParse(validateData);

    createRoomMutate(validateData);
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
          disabled={isLoading}
        >
          {isLoading ? "생성 중..." : "회의 생성하기"}
        </Button>
      </div>
    </Card>
  );
}

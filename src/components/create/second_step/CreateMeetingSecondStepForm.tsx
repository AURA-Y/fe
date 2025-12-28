"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AiVoiceOption from "./AiVoiceOption";
import MeetingBasicInfo from "./MeetingBasicInfo";
import ReferenceMaterialUpload from "./ReferenceMaterialUpload";
import { useCreateMeeting } from "@/hooks/use-create-meeting";
import { createMeetingSchema } from "@/lib/schema/createMeeting.schema";

export default function CreateMeetingSecondStepForm() {
  const router = useRouter();

  const [formState, setFormState] = useState({
    voice: "female" as "male" | "female",
    topic: "",
    goal: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const { mutate: createMeeting, isPending } = useCreateMeeting();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // 1. Zod Validation
    const validationResult = createMeetingSchema.safeParse(formState);

    if (!validationResult.success) {
      // Show first error message
      const firstError = (validationResult.error as any).errors[0]?.message;
      toast.error(firstError || "입력 값을 확인해주세요.");
      return;
    }

    // 2. Execute Mutation
    createMeeting(
      { data: validationResult.data, files },
      {
        onSuccess: () => {
          toast.success("회의가 성공적으로 생성되었습니다.");
          // router.push("/create/complete"); // Navigate to next step or complete page
          router.push("/create");
        },
        onError: (error) => {
          console.error(error);
          toast.error("회의 생성 중 오류가 발생했습니다.");
        },
      }
    );
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
          onVoiceChange={(voice) => setFormState({ ...formState, voice })}
        />

        {/* 2. 새 회의 주제 , 회의 목표 */}
        <MeetingBasicInfo
          topic={formState.topic}
          goal={formState.goal}
          onChange={(field, value) => setFormState({ ...formState, [field]: value })}
        />
        {/* 3. Reference Materials */}
        <ReferenceMaterialUpload
          files={files}
          onFileChange={handleFileChange}
          onRemoveFile={removeFile}
        />
      </div>

      {/* Footer Actions Inline for this Step */}
      <div className="flex items-center justify-end border-t border-slate-100 p-4 dark:border-slate-800">
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "생성 중..." : "회의 생성하기"}
        </Button>
      </div>
    </Card>
  );
}

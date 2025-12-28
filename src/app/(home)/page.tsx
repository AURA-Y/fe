"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateRoom } from "@/hooks/use-livekit-token";
import { CreateRoomFormValues, createRoomSchema } from "@/lib/schema/room/roomCreate.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function HomePage() {
  // 1. 커스텀 훅 호출
  const { mutate: roomCreateMutation, isPending: isLoading } = useCreateRoom();

  // 2. Form 정의 : zod + use Hook Form
  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      user: "meeting_organizer",
      roomTitle: "화상 회의방 제목을 입력하세요.",
      description: "오늘은 무슨 회의를 할 예정인가요?",
      maxParticipants: 10,
    },
  });

  // 3. 제출 핸들러
  const onSubmit = (values: CreateRoomFormValues) => {
    roomCreateMutation(values);
  };

  return (
    <main className="container mx-auto max-w-md py-10">
      <h1 className="mb-6 text-center text-2xl font-bold">AI 화상회의 시작하기</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 닉네임 (필수) */}
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input placeholder="입장할 이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 방 제목 (선택) */}
          <FormField
            control={form.control}
            name="roomTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>방 제목 (선택)</FormLabel>
                <FormControl>
                  <Input placeholder="회의 제목을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 최대 인원 (선택, 숫자) */}
          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>최대 참여 인원 ({field.value}명)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>2명에서 50명까지 설정 가능합니다.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />방 생성 중...
              </>
            ) : (
              "방 만들기"
            )}
          </Button>
        </form>
      </Form>
    </main>
  );
}

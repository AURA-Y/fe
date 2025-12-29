import { Meeting } from "@/mock/mockData";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { env } from "@/env.mjs";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export function extractRoomId(input: string): string {
  const trimmedInput = input.trim();

  try {
    // https://my-app.com/room/abc-123
    const url = new URL(trimmedInput);
    // pathname : "/room/abc-123" -> ["", "room" , "abc-123" ]
    const pathParts = url.pathname.split("/").filter(Boolean);

    return pathParts[pathParts.length - 1] || trimmedInput;
  } catch {
    return trimmedInput;
  }
}

export const getMeetingSubIds = (meeting: Meeting) => {
  const ids = [`${meeting.id}-summary`];
  meeting.files.forEach((f) => ids.push(`${meeting.id}-file-${f.id}`));
  return ids;
};

export const getMeetingState = (meeting: Meeting, selectedIds: Set<string>) => {
  const subIds = getMeetingSubIds(meeting);
  const selectedSubIds = subIds.filter((id) => selectedIds.has(id));

  const isAll = selectedSubIds.length === subIds.length && subIds.length > 0;
  const isNone = selectedSubIds.length === 0;
  const isPartial = !isAll && !isNone;

  return { isAll, isNone, isPartial };
};

export const toggleMeetingSelection = (meeting: Meeting, selectedIds: Set<string>): Set<string> => {
  const { isAll } = getMeetingState(meeting, selectedIds);
  const subIds = getMeetingSubIds(meeting);

  const newSet = new Set(selectedIds);
  if (!isAll) {
    // Select all
    subIds.forEach((id) => newSet.add(id));
  } else {
    // Deselect all
    subIds.forEach((id) => newSet.delete(id));
  }
  return newSet;
};

export const toggleSingleSelection = (id: string, selectedIds: Set<string>): Set<string> => {
  const newSet = new Set(selectedIds);
  if (newSet.has(id)) newSet.delete(id);
  else newSet.add(id);
  return newSet;
};

export const calculateTotalSelectedCount = (
  meetings: Meeting[],
  selectedIds: Set<string>
): number => {
  return meetings.reduce((acc, m) => {
    const { isNone } = getMeetingState(m, selectedIds);
    return acc + (isNone ? 0 : 1);
  }, 0);
};

export const errorHandler = (error: unknown) => {
  // 1. 400 , 500 에러 (서버에서 오류)
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || "방 생성이 실패했습니다.";
    toast.error(errorMessage);
    return;
  }
  //  2. 일반적인 에러 처리
  console.error("Unknown Error : ", error);
  toast.error("알 수 없는 오류가 발생했습니다.");
};

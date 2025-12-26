import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { env } from "@/env.mjs";

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

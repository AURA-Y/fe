import { api } from "./axios";

export async function fetchToken(roomName: string, userName: string): Promise<string> {
  const { data } = await api.post("/api/token", {
    roomName,
    userName,
  });

  console.log("Token received:", data.token ? "Success" : "Failed");
  return data.token;
}

export async function createRoom(userName: string) {
  const { data } = await api.post("/api/room/create", { userName });

  return data;
}

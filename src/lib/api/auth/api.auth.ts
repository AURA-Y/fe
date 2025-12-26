import { api } from "@/lib/utils";

const fetchLiveKitToken = async (room: string, user: string) => {
  const { data } = await api.post<{ token: string }>("/api/token", {
    roomName: room,
    userName: user,
  });

  return data.token;
};

export { fetchLiveKitToken };

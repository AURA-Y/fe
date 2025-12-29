import { api } from "@/lib/utils";

const fetchLiveKitToken = async (room: string, user: string) => {
  const { data } = await api.post<{ token: string; url: string }>("/api/token", {
    roomId: room,
    userName: user,
  });

  return data;
};

export { fetchLiveKitToken };

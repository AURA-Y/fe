import { api } from "@/lib/utils";

const createRoom = async (user: string) => {
  const { data } = await api.post<{ roomId: string; roomUrl: string; userName: string }>(
    "/api/room/create",
    {
      userName: user,
    }
  );
  return data;
};

export { createRoom };

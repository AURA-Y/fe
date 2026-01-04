/**
 * 미디어 디바이스 권한 요청
 * @returns Promise<boolean> - 권한 승인 여부
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // 권한 확인용 스트림 즉시 종료
    stream.getTracks().forEach((track) => track.stop());

    return true;
  } catch (error) {
    console.error("미디어 권한 에러:", error);
    return false;
  }
};

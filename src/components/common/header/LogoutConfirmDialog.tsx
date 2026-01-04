import ConfirmDialog from "../ConfirmDialog";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function LogoutConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="로그아웃 확인"
      description="정말 로그아웃하시겠습니까?"
      buttons={[
        {
          label: "취소",
          onClick: () => onOpenChange(false),
          variant: "outline",
          className: "flex items-center justify-center rounded-full px-6 font-bold",
        },
        {
          label: "로그아웃",
          onClick: onConfirm,
          className: "flex items-center justify-center rounded-full bg-blue-600 px-6 font-bold text-white hover:bg-blue-700",
        },
      ]}
    />
  );
}

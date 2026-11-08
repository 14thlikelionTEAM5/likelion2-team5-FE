import Button from '@/shared/ui/Button';
import Icon from '@/shared/ui/Icon';
import Modal from '@/shared/ui/Modal';

export default function DeleteModal({
  open,
  linkedCount,
  onClose,
  onDelete,
}: {
  open: boolean;
  linkedCount: number; // 같이 지워지는 인정 사례 수 (귀국보고서일 때)
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} className="flex w-[520px] flex-col gap-4">
      <span className="bg-danger-soft text-danger flex size-[52px] items-center justify-center rounded-[14px]">
        <Icon name="trash" size={26} />
      </span>
      <h2 className="text-[26px] font-bold">등록 내역을 삭제할까요?</h2>
      <p className="text-ink-sub text-[19px] leading-[1.6]">
        삭제하면 다른 학생에게도 더 이상 보이지 않아요.
        {linkedCount > 0 &&
          ` 이 귀국보고서로 등록한 학점 인정 사례 ${linkedCount}건도 함께 삭제돼요.`}
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          취소
        </Button>
        <Button variant="danger" className="flex-1" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </Modal>
  );
}

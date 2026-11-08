import { motion } from 'motion/react';
import Button from '@/shared/ui/Button';
import Icon from '@/shared/ui/Icon';
import Modal from '@/shared/ui/Modal';

export default function CompleteModal({
  open,
  onClose,
  onGoMine,
}: {
  open: boolean;
  onClose: () => void;
  onGoMine: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex w-[520px] flex-col items-center gap-5 pt-10"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="bg-panel text-ink-sub hover:bg-fill -mt-2 flex size-[43px] items-center justify-center self-end rounded-[12px]"
      >
        <Icon name="x" />
      </button>
      <motion.span
        className="bg-accent-soft text-accent flex size-[86px] items-center justify-center rounded-full"
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.1 }}
      >
        <Icon name="check" size={43} />
      </motion.span>
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[30px] font-bold">등록이 완료됐어요</h2>
        <p className="text-ink-sub text-[19px] leading-[1.6]">
          소중한 경험 공유 감사합니다.
          <br />
          등록한 내용은 [내 등록 내역]에서 확인·삭제할 수 있어요.
        </p>
      </div>
      <Button className="w-full" onClick={onGoMine}>
        내 등록 내역 보기
        <Icon name="right" />
      </Button>
    </Modal>
  );
}

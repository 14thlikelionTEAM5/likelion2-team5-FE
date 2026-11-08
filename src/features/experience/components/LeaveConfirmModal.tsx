import type { Blocker } from 'react-router';
import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';

export default function LeaveConfirmModal({ blocker }: { blocker: Blocker }) {
  return (
    <Modal
      open={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      className="flex w-[480px] flex-col gap-4"
    >
      <h2 className="text-[26px] font-bold">작성 중인 내용이 사라져요</h2>
      <p className="text-ink-sub text-[19px] leading-[1.6]">
        지금 나가면 입력한 내용이 저장되지 않아요. 그래도 나갈까요?
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => blocker.reset?.()}>
          계속 작성
        </Button>
        <Button className="flex-1" onClick={() => blocker.proceed?.()}>
          나가기
        </Button>
      </div>
    </Modal>
  );
}

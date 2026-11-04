import { useState } from 'react';
import { useSearchParams } from 'react-router';
import Placeholder from '@/shared/ui/Placeholder';
import Modal from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useLeaveConfirm } from '@/shared/hooks/useLeaveConfirm';
import type { ExperienceKind } from '@/app/paths';

const KINDS: ExperienceKind[] = ['report', 'spec', 'credit'];

export default function ExperienceNewPage() {
  const [params] = useSearchParams();
  const kind = KINDS.find((k) => k === params.get('type')) ?? 'report';

  // TODO: 입력 중이면 true, 등록 완료 후 false
  const [dirty] = useState(false);
  const blocker = useLeaveConfirm(dirty);

  return (
    <>
      <Placeholder
        title={`경험 등록 (${kind})`}
        owner="윤지"
        figma="유윤지 - 디자인 / 경험 등록 - *"
      />

      <Modal open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()}>
        <p className="mb-6">작성 중인 내용이 사라져요. 나갈까요?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => blocker.reset?.()}>
            계속 작성
          </Button>
          <Button onClick={() => blocker.proceed?.()}>나가기</Button>
        </div>
      </Modal>
    </>
  );
}

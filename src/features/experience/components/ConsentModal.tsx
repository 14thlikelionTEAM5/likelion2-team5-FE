import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Checkbox from '@/shared/ui/Checkbox';
import Icon from '@/shared/ui/Icon';
import Modal from '@/shared/ui/Modal';

const POINTS = ['원문은 저장하지 않아요', '동의 여부는 기록돼요', '동의해야 입력창이 활성화돼요'];

export default function ConsentModal({
  open,
  onClose,
  onAgree,
}: {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal open={open} onClose={onClose} className="flex w-[560px] flex-col gap-5">
      <span className="bg-accent-soft text-primary flex size-[67px] items-center justify-center rounded-[22px]">
        <Icon name="shield" size={34} />
      </span>
      <h2 className="text-[28px] font-bold">외부 AI 처리 동의</h2>
      <p className="text-ink-sub text-[19px] leading-[1.6]">
        붙여넣은 텍스트는 항목 추출·요약을 위해 외부 AI로 전송돼요. 개인정보(이름·학번·연락처 등)는
        직접 지운 텍스트만 붙여넣어 주세요.
      </p>
      <ul className="rounded-note bg-panel flex flex-col gap-2.5 p-[18px]">
        {POINTS.map((p) => (
          <li key={p} className="text-ink-sub flex items-center gap-2 text-[18px] font-medium">
            <Icon name="check" size={19} className="text-accent" />
            {p}
          </li>
        ))}
      </ul>
      <Checkbox checked={checked} onChange={setChecked}>
        외부 AI 전송에 동의합니다
      </Checkbox>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          취소
        </Button>
        <Button className="flex-1" disabled={!checked} onClick={onAgree}>
          동의하고 진행
        </Button>
      </div>
    </Modal>
  );
}

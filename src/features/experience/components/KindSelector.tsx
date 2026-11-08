import { AnimatePresence, motion } from 'motion/react';
import type { ExperienceKind } from '@/app/paths';
import Icon, { type IconName } from '@/shared/ui/Icon';

const KINDS: { value: ExperienceKind; label: string; description: string; icon: IconName }[] = [
  {
    value: 'report',
    label: '귀국보고서',
    description: '붙여넣으면 AI가 항목을 정리해요',
    icon: 'file',
  },
  { value: 'spec', label: '합격/탈락 스펙', description: '지원 결과와 당시 스펙', icon: 'chart' },
  { value: 'credit', label: '학점 인정 결과', description: '과목별 본교 인정 결과', icon: 'book' },
];

export default function KindSelector({
  value,
  onChange,
}: {
  value: ExperienceKind;
  onChange: (value: ExperienceKind) => void;
}) {
  return (
    <div role="radiogroup" className="flex gap-4">
      {KINDS.map((k) => {
        const active = k.value === value;
        return (
          <button
            key={k.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(k.value)}
            className={`flex flex-1 items-center gap-3.5 rounded-[16px] p-5 text-left transition-[colors,transform] active:scale-[0.98] ${
              active
                ? 'border-primary bg-primary-soft/40 border-2'
                : 'border-line-soft hover:bg-panel m-px border bg-white'
            }`}
          >
            <span
              className={`flex size-[53px] shrink-0 items-center justify-center rounded-[14px] transition-colors ${
                active ? 'bg-primary text-white' : 'bg-panel text-ink-sub'
              }`}
            >
              <Icon name={k.icon} size={26} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={`text-[20px] font-bold ${active ? 'text-primary' : ''}`}>
                {k.label}
              </span>
              <span className="text-ink-muted text-[16px]">{k.description}</span>
            </span>
            <span
              className={`flex size-[26px] shrink-0 items-center justify-center rounded-full ${
                active ? 'bg-primary text-white' : 'border-line border bg-white'
              }`}
            >
              <AnimatePresence initial={false}>
                {active && (
                  <motion.span
                    className="flex"
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 22 }}
                  >
                    <Icon name="check" size={17} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

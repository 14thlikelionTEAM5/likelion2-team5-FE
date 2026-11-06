import type { ReactNode } from 'react';

type Tone = 'accent' | 'primary' | 'danger' | 'caution' | 'neutral';

const styles: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent-strong',
  primary: 'bg-primary-soft text-primary',
  danger: 'bg-danger-soft text-danger',
  caution: 'bg-caution-soft text-caution',
  neutral: 'bg-fill text-ink-sub',
};

export default function Badge({
  tone = 'primary',
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-[34px] items-center rounded-full px-3 text-base font-bold whitespace-nowrap ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

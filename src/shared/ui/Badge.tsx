import type { ReactNode } from 'react';

type Tone = 'accent' | 'primary' | 'danger' | 'caution';

const styles: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent-strong',
  primary: 'bg-primary-soft text-primary',
  danger: 'bg-danger-soft text-danger',
  caution: 'bg-caution-soft text-caution',
};

export default function Badge({ tone = 'primary', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex h-[34px] items-center rounded-full px-3 font-bold ${styles[tone]}`}>
      {children}
    </span>
  );
}
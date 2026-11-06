import type { ReactNode } from 'react';
import Icon from './Icon';

type Tone = 'gray' | 'primary';

const styles: Record<Tone, string> = {
  gray: 'bg-panel text-ink-sub',
  primary: 'bg-primary-soft text-primary',
};

export default function InfoNote({
  tone = 'gray',
  className = '',
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-note flex gap-2.5 p-4 text-lg leading-[1.5] ${styles[tone]} ${className}`}
    >
      <Icon name="info" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

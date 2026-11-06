import type { ReactNode } from 'react';
import emptyIllustration from '@/assets/decor/empty-illustration.svg';

export default function EmptyState({
  title,
  description,
  action,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card shadow-card flex flex-col items-center gap-4 bg-white px-18 pt-12 pb-18 ${className}`}
    >
      <img src={emptyIllustration} alt="" width={340} height={240} />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[26px] font-bold">{title}</p>
        {description && <p className="text-ink-muted text-[19px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

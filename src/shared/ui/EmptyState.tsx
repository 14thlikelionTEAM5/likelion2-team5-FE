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
      className={`rounded-card shadow-card flex flex-col items-center gap-4 bg-white px-5 pt-8 pb-10 sm:px-18 sm:pt-12 sm:pb-18 ${className}`}
    >
      <img
        src={emptyIllustration}
        alt=""
        width={340}
        height={240}
        className="h-auto w-full max-w-[340px]"
      />
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-[22px] font-bold sm:text-[26px]">{title}</p>
        {description && <p className="text-ink-muted text-[17px] sm:text-[19px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

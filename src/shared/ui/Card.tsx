import type { HTMLAttributes, ReactNode } from 'react';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export default function Card({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: Props) {
  return (
    <div className={`rounded-card shadow-card bg-white p-8 ${className}`} {...props}>
      {(title || action) && (
        <div className="mb-5 flex items-center gap-4">
          <div className="flex flex-1 flex-col gap-1">
            {title && <h2 className="text-[26px] font-bold">{title}</h2>}
            {description && <p className="text-ink-muted text-lg">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

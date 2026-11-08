import type { ReactNode } from 'react';

export default function StepTitle({
  no,
  children,
  right,
}: {
  no: number;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-primary flex size-[34px] shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white">
        {no}
      </span>
      <h2 className="flex items-center gap-2.5 text-[26px] font-bold">{children}</h2>
      <div className="flex-1" />
      {right}
    </div>
  );
}

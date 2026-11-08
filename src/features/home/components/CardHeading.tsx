import type { ReactNode } from 'react';
import Icon, { type IconName } from '@/shared/ui/Icon';

export default function CardHeading({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-accent-soft text-primary flex size-[58px] shrink-0 items-center justify-center rounded-[19px]">
        <Icon name={icon} size={29} />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[26px] font-bold">{title}</h2>
        <p className="text-ink-muted text-[18px]">{description}</p>
      </div>
    </div>
  );
}

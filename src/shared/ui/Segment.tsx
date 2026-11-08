import { useId } from 'react';
import { motion } from 'motion/react';

export type SegmentItem<T extends string> = { value: T; label: string };

export default function Segment<T extends string>({
  items,
  value,
  onChange,
  disabled,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div role="radiogroup" className="bg-fill rounded-control inline-flex shrink-0 gap-1 p-1">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={`relative h-[46px] rounded-[9px] px-5 text-[19px] font-semibold whitespace-nowrap transition-colors ${
              active ? 'text-primary' : 'text-ink-muted enabled:hover:text-ink-sub'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segment-thumb-${id}`}
                layoutDependency={value}
                className="shadow-thumb absolute inset-0 rounded-[9px] bg-white"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

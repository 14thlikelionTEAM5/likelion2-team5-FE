import { useId } from 'react';
import { motion } from 'motion/react';

export type TabItem<T extends string> = { value: T; label: string };

export default function Tabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div role="tablist" className="border-line-soft flex gap-9 border-b">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={`flex flex-col gap-3 pt-1 text-[22px] whitespace-nowrap transition-colors ${
              active ? 'text-primary font-bold' : 'text-ink-muted hover:text-ink-sub font-semibold'
            }`}
          >
            {item.label}
            <span className="h-[3px] w-full">
              {active && (
                <motion.span
                  layoutId={`tab-bar-${id}`}
                  className="bg-primary block h-full rounded-[2px]"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

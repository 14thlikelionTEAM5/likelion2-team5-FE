import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from './Icon';

export default function Checkbox({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`text-ink-sub flex items-center gap-2.5 text-[18px] font-medium ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`peer-focus-visible:ring-primary/40 flex size-[26px] shrink-0 items-center justify-center rounded-[7px] border transition-colors peer-focus-visible:ring-2 ${
          checked ? 'bg-primary border-primary text-white' : 'border-line bg-white'
        }`}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span
              className="flex"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 25 }}
            >
              <Icon name="check" size={19} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {children}
    </label>
  );
}

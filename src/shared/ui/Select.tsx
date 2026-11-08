import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon, { type IconName } from './Icon';

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'md' | 'sm';
  icon?: IconName;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // 바깥 칸에 적용 (너비 조절용)
  'aria-label'?: string;
};

const heights = { md: 'h-[58px]', sm: 'h-[50px]' };

export default function Select({
  options,
  value,
  onChange,
  size = 'md',
  icon,
  placeholder,
  disabled,
  className = '',
  'aria-label': ariaLabel,
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const openList = () => {
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };
  const choose = (v: string) => {
    onChange(v);
    close();
  };

  // 바깥을 누르면 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    listRef.current?.focus();
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((i) => Math.min(i + 1, options.length - 1));
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(options.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') choose(options[active].value);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') setOpen(false);
    else return;
    if (e.key !== 'Tab') e.preventDefault();
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openList();
          }
        }}
        className={`rounded-control disabled:bg-fill flex w-full items-center gap-2.5 border bg-white px-4 text-left text-[19px] transition-colors outline-none ${
          open
            ? 'border-primary'
            : 'border-line focus-visible:border-primary hover:border-ink-faint'
        } ${heights[size]}`}
      >
        {icon && <Icon name={icon} size={24} className="text-ink-sub shrink-0" />}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-ink' : 'text-ink-faint'}`}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          name="down"
          className={`text-ink-sub shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="rounded-control border-line-soft shadow-card absolute top-full right-0 left-0 z-30 mt-2 max-h-72 origin-top overflow-y-auto border bg-white p-1.5 outline-none"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(o.value)}
                  className={`rounded-small flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[18px] ${
                    isSelected ? 'text-primary font-semibold' : 'text-ink-sub'
                  } ${i === active ? 'bg-panel' : ''}`}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {isSelected && <Icon name="check" className="shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

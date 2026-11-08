import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from '@/shared/ui/Icon';

type Props<T> = {
  value: T | null;
  onChange: (value: T | null) => void;
  search: (query: string) => T[];
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  renderOption: (item: T) => ReactNode;
  placeholder: string;
  clearLabel: string;
  disabled?: boolean;
};

// 검색하면 아래에 목록, 고르면 입력창이 고른 값으로 바뀌고 X로 지운 뒤 다시 고름
export default function SearchSelect<T>({
  value,
  onChange,
  search,
  getKey,
  getLabel,
  renderOption,
  placeholder,
  clearLabel,
  disabled,
}: Props<T>) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = search(query).slice(0, 8);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (item: T) => {
    onChange(item);
    setQuery('');
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setQuery('');
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((i) => Math.min(i + 1, results.length - 1));
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(i - 1, 0));
    else if (e.key === 'Enter' && results[active]) choose(results[active]);
    else if (e.key === 'Escape') setOpen(false);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`rounded-control flex h-[58px] items-center gap-2.5 border px-4 text-[19px] transition-colors ${
          disabled
            ? 'border-line bg-fill'
            : open
              ? 'border-primary bg-white'
              : 'border-line bg-white'
        }`}
      >
        <Icon name="search" size={24} className="text-ink-muted shrink-0" />
        {value ? (
          <span className="min-w-0 flex-1 truncate">{getLabel(value)}</span>
        ) : (
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-activedescendant={open ? `${id}-${active}` : undefined}
            disabled={disabled}
            className="placeholder:text-ink-faint min-w-0 flex-1 bg-transparent outline-none"
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onKeyDown={onKey}
          />
        )}
        {value && !disabled && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={clear}
            className="text-ink-muted hover:bg-panel flex size-8 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="x" />
          </button>
        )}
        {disabled && <Icon name="lock" className="text-ink-muted shrink-0" />}
      </div>

      <AnimatePresence>
        {open && !value && !disabled && (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="rounded-control border-line-soft shadow-card absolute top-full right-0 left-0 z-30 mt-2 max-h-72 origin-top overflow-y-auto border bg-white p-1.5"
          >
            {results.length > 0 ? (
              results.map((item, i) => (
                <li
                  key={getKey(item)}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(item)}
                  className={`rounded-small flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[18px] ${
                    i === active ? 'bg-panel' : ''
                  }`}
                >
                  {renderOption(item)}
                </li>
              ))
            ) : (
              <li className="text-ink-muted px-3 py-2.5 text-[18px]">검색 결과가 없어요</li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

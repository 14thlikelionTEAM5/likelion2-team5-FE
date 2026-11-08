import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from '@/shared/ui/Icon';
import { searchSchools, type SchoolOption } from '../mock';

const label = (s: SchoolOption) => `${s.name} (${s.country})`;

// 검색하면 아래에 이름순 목록, 고르면 입력창이 학교 이름으로 바뀌고 X로 지운 뒤 다시 고름
export default function SchoolSearch({
  value,
  onChange,
}: {
  value: SchoolOption | null;
  onChange: (value: SchoolOption | null) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // TODO: /universities/search 연결 (입력 멈춘 뒤 요청)
  const results = searchSchools(query).slice(0, 8);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (s: SchoolOption) => {
    onChange(s);
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
        className={`rounded-control flex h-[58px] items-center gap-2.5 border bg-white px-4 text-[19px] transition-colors ${
          open ? 'border-primary' : 'border-line'
        }`}
      >
        <Icon name="search" size={24} className="text-ink-muted shrink-0" />
        {value ? (
          <span className="min-w-0 flex-1 truncate">{label(value)}</span>
        ) : (
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-activedescendant={open ? `${id}-${active}` : undefined}
            className="placeholder:text-ink-faint min-w-0 flex-1 bg-transparent outline-none"
            placeholder="학교 이름 검색..."
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
        {value && (
          <button
            type="button"
            aria-label="학교 선택 지우기"
            onClick={clear}
            className="text-ink-muted hover:bg-panel flex size-8 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="x" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && !value && (
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
              results.map((s, i) => (
                <li
                  key={s.universityId}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  className={`rounded-small flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[18px] ${
                    i === active ? 'bg-panel' : ''
                  }`}
                >
                  <span className="text-ink font-medium">{s.name}</span>
                  <span className="text-ink-muted">{s.country}</span>
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

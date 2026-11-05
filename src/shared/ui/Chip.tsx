import type { ButtonHTMLAttributes } from 'react';

export default function Chip({
  selected = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`h-11 shrink-0 rounded-full border px-4 text-lg whitespace-nowrap transition-colors ${
        selected
          ? 'bg-primary border-transparent font-semibold text-white'
          : 'border-line text-ink-sub hover:bg-panel bg-white font-medium'
      } ${className}`}
      {...props}
    />
  );
}

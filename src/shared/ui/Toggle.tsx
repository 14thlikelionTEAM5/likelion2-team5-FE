import type { ReactNode } from 'react';

export default function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="text-ink-sub flex shrink-0 items-center gap-2.5 text-[19px] font-medium disabled:opacity-50"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-line'}`}
      >
        <span
          className={`shadow-thumb absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      {label}
    </button>
  );
}

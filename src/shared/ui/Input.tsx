import type { InputHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'md' | 'sm';
  icon?: IconName;
  unit?: string;
};

const heights = { md: 'h-[58px]', sm: 'h-[50px]' };

// className은 바깥 칸에 적용 (너비 조절용)
export default function Input({
  size = 'md',
  icon,
  unit,
  disabled,
  className = '',
  ...props
}: Props) {
  return (
    <label
      className={`rounded-control border-line flex items-center gap-2.5 border px-4 text-[19px] ${heights[size]} ${
        disabled ? 'bg-fill' : 'focus-within:border-primary bg-white'
      } ${className}`}
    >
      {icon && <Icon name={icon} size={24} className="text-ink-muted shrink-0" />}
      <input
        disabled={disabled}
        className="text-ink placeholder:text-ink-faint disabled:text-ink-sub min-w-0 flex-1 bg-transparent outline-none"
        {...props}
      />
      {unit && <span className="text-ink-muted shrink-0">{unit}</span>}
      {disabled && <Icon name="lock" className="text-ink-muted shrink-0" />}
    </label>
  );
}

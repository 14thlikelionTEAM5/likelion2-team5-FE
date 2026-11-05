import type { SelectHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';

export type SelectOption = { value: string; label: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: SelectOption[];
  size?: 'md' | 'sm';
  icon?: IconName;
  placeholder?: string;
};

const heights = { md: 'h-[58px]', sm: 'h-[50px]' };

// className은 바깥 칸에 적용 (너비 조절용)
export default function Select({
  options,
  size = 'md',
  icon,
  placeholder,
  className = '',
  ...props
}: Props) {
  const empty = props.value === '' || props.value === undefined;
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <Icon
          name={icon}
          size={24}
          className="text-ink-sub pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
      )}
      <select
        className={`rounded-control border-line focus:border-primary disabled:bg-fill w-full appearance-none border bg-white pr-12 text-[19px] outline-none ${
          icon ? 'pl-[50px]' : 'pl-4'
        } ${placeholder && empty ? 'text-ink-faint' : 'text-ink'} ${heights[size]}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="down"
        className="text-ink-sub pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
      />
    </div>
  );
}

import type { ButtonHTMLAttributes } from 'react';
import Icon, { type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'subtle' | 'danger';
type Size = 'md' | 'sm' | 'xs';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  secondary: 'border border-line bg-white text-primary hover:bg-panel',
  subtle: 'border border-line bg-white text-ink-muted hover:bg-panel',
  danger: 'bg-danger text-white hover:opacity-90',
};

const sizes: Record<Size, { box: string; icon: number }> = {
  md: { box: 'rounded-control h-[54px] gap-2 px-5 text-[19px]', icon: 22 },
  sm: { box: 'rounded-small h-11 gap-2 px-3.5 text-lg', icon: 19 },
  xs: { box: 'rounded-small h-[42px] gap-1.5 px-3 text-base', icon: 17 },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; icon?: IconName }) {
  const s = sizes[size];
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap disabled:opacity-50 ${s.box} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
    </button>
  );
}

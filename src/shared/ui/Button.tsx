import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';
const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  secondary: 'border border-line bg-white text-primary hover:bg-panel',
};

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-control h-[54px] px-5 font-semibold disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

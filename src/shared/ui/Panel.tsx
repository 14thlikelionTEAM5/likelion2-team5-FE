import type { HTMLAttributes } from 'react';

// 카드 안쪽 회색 칸
export default function Panel({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-panel bg-panel p-5 ${className}`} {...props} />;
}

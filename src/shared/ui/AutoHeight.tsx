import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

/** 안의 내용 높이가 바뀌면 (더보기 펼치기 등) 높이를 부드럽게 맞춤 */
export default function AutoHeight({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className="overflow-hidden"
      initial={false}
      animate={{ height }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Button from '@/shared/ui/Button';
import Icon, { type IconName } from '@/shared/ui/Icon';

export default function MySection({
  icon,
  title,
  count,
  emptyText,
  onRegister,
  children,
}: {
  icon: IconName;
  title: string;
  count: number;
  emptyText: string;
  onRegister: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card shadow-card flex flex-col gap-5 bg-white p-5 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="bg-panel text-ink-sub flex size-[42px] items-center justify-center rounded-[12px]">
          <Icon name={icon} size={22} />
        </span>
        <h2 className="text-[22px] font-bold sm:text-[26px]">{title}</h2>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-accent text-[19px] font-bold"
          >
            {count}건
          </motion.span>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {count > 0 ? (
          <motion.div key="list" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-panel rounded-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5"
          >
            <span className="text-ink-muted text-[18px]">{emptyText}</span>
            <Button variant="secondary" size="sm" icon="pen" onClick={onRegister}>
              등록하기
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

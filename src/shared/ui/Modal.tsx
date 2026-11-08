import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function Modal({
  open,
  onClose,
  className = 'w-[520px]',
  children,
}: {
  open: boolean;
  onClose: () => void;
  className?: string; // 너비 조절용
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bg-ink/40 fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`max-h-[calc(100dvh-32px)] max-w-full overflow-y-auto rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(16,40,72,0.18)] sm:p-8 ${className}`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

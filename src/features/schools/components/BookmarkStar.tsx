import { AnimatePresence, motion } from 'motion/react';
import Icon from '@/shared/ui/Icon';

// 찜을 누를 때만 별이 튀어나옴 (처음 화면에 나올 때는 그대로)
export default function BookmarkStar({ on, size }: { on: boolean; size?: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={on ? 'on' : 'off'}
        className="flex"
        initial={on ? { scale: 0.4, rotate: -40 } : { scale: 0.8 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 500, damping: on ? 12 : 25 }}
      >
        <Icon name="star" size={size} fill={on ? 'currentColor' : 'none'} />
      </motion.span>
    </AnimatePresence>
  );
}

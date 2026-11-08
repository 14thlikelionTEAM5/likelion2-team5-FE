import { motion, type HTMLMotionProps, type Variants } from 'motion/react';

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/** 안의 StaggerItem이 위에서부터 조금씩 차이를 두고 나타남. delay: 첫 요소가 나오기까지 기다리는 시간(초) */
export function Stagger({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
  };
  return <motion.div variants={group} initial="hidden" animate="show" {...props} />;
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={item} {...props} />;
}

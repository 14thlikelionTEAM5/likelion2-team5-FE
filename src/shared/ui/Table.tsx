import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export type Column<T> = {
  key: string;
  header?: ReactNode;
  width?: number; // 없으면 남는 너비를 나눠 가짐
  render: (row: T) => ReactNode;
};

export default function Table<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
}) {
  // 좁은 화면(사이드바가 없을 때)에서는 칸이 찌그러지지 않게 표만 가로로 스크롤
  const minWidth = columns.reduce((sum, c) => sum + (c.width ?? 200), 0);

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table
        style={{ '--table-min': `${minWidth}px` } as CSSProperties}
        className="w-full min-w-(--table-min) table-fixed border-collapse text-left xl:min-w-0"
      >
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="bg-table-head text-ink-muted first:rounded-l-small last:rounded-r-small px-4 py-3 text-base font-semibold"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 행이 추가·삭제될 때만 애니메이션 */}
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.tr
                key={rowKey(row)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.2 }}
                className="border-fill border-b"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3.5 text-lg">
                    {c.render(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

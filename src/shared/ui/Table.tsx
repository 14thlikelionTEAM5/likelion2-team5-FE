import type { ReactNode } from 'react';

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
  return (
    <table className="w-full table-fixed border-collapse text-left">
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
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-fill border-b">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-3.5 text-lg">
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

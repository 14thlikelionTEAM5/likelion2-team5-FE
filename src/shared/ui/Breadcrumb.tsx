import { Link } from 'react-router';

export type Crumb = { label: string; to?: string };

// 마지막 칸은 현재 페이지라 링크 없음
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="현재 위치">
      <ol className="text-ink-muted flex flex-wrap items-center gap-1.5 text-[18px] font-medium">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>›</span>}
              {c.to && !last ? (
                <Link
                  to={c.to}
                  className="hover:text-primary rounded-[6px] underline-offset-4 transition-colors hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

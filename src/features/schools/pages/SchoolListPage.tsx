import { useMemo, useState } from 'react';
import EmptyState from '@/shared/ui/EmptyState';
import Button from '@/shared/ui/Button';
import Icon from '@/shared/ui/Icon';
import Select from '@/shared/ui/Select';
import SchoolCard from '../components/SchoolCard';
import SchoolFilterCard from '../components/SchoolFilterCard';
import { MOCK_SCHOOLS, type SchoolSummary } from '../mock';
import { useSchoolFilters, type SchoolFilters, type SchoolSort } from '../useSchoolFilters';

const SORT_OPTIONS: { value: SchoolSort; label: string }[] = [
  { value: 'country', label: '국가·학교명순' },
  { value: 'name', label: '학교명순' },
  { value: 'recruit', label: '모집 인원순' },
];

// TODO: API 연결 후 필터·정렬은 서버에서 처리
function applyFilters(list: SchoolSummary[], f: SchoolFilters) {
  const min = f.minCost ? Number(f.minCost) : null;
  const max = f.maxCost ? Number(f.maxCost) : null;
  const q = f.q.trim().toLowerCase();

  const filtered = list.filter(
    (s) =>
      (!f.country || s.country === f.country) &&
      (!q || s.name.toLowerCase().includes(q)) &&
      (!f.exam || s.languageExams.includes(f.exam)) &&
      (!f.eligibleOnly || (s.recruiting && s.eligibility === 'ELIGIBLE')) &&
      (min === null || (s.expectedCost ?? 0) >= min) &&
      (max === null || (s.expectedCost ?? Infinity) <= max),
  );

  const byName = (a: SchoolSummary, b: SchoolSummary) => a.name.localeCompare(b.name, 'ko');
  return filtered.sort((a, b) => {
    if (a.recruiting !== b.recruiting) return a.recruiting ? -1 : 1;
    if (f.sort === 'recruit') return b.recruitCount - a.recruitCount || byName(a, b);
    if (f.sort === 'country') return a.country.localeCompare(b.country, 'ko') || byName(a, b);
    return byName(a, b);
  });
}

export default function SchoolListPage() {
  const { filters, setFilter, reset } = useSchoolFilters();
  const [schools, setSchools] = useState(MOCK_SCHOOLS);

  const countries = useMemo(
    () => [...new Set(schools.map((s) => s.country))].sort((a, b) => a.localeCompare(b, 'ko')),
    [schools],
  );
  const result = applyFilters([...schools], filters);

  // TODO: /bookmarks 연결
  const toggleBookmark = (id: number) =>
    setSchools((prev) =>
      prev.map((s) => (s.universityId === id ? { ...s, bookmarked: !s.bookmarked } : s)),
    );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <p className="text-ink-muted text-[18px] font-medium">협정교 › 협정교 목록</p>
          <h1 className="text-[38px] font-bold">협정교 목록</h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-primary flex h-[54px] items-center gap-2 px-1 text-[19px] font-semibold"
        >
          <Icon name="refresh" />
          필터 초기화
        </button>
      </header>

      <SchoolFilterCard filters={filters} countries={countries} onChange={setFilter} />

      <div className="flex items-center gap-2.5">
        <h2 className="text-[26px] font-bold">협정교 목록</h2>
        <span className="text-accent text-[19px] font-semibold">{result.length}곳</span>
        <div className="flex-1" />
        <Select
          size="sm"
          className="w-[230px]"
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value as SchoolSort)}
          options={SORT_OPTIONS}
        />
      </div>

      {result.length > 0 ? (
        <div className="flex flex-col gap-3">
          {result.map((s) => (
            <SchoolCard
              key={s.universityId}
              school={s}
              onToggleBookmark={() => toggleBookmark(s.universityId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="조건에 맞는 학교가 없어요"
          description="검색어나 필터를 바꾸거나 필터를 초기화해 보세요."
          action={
            <Button variant="secondary" icon="refresh" onClick={reset}>
              필터 초기화
            </Button>
          }
        />
      )}
    </div>
  );
}

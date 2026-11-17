import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PATHS } from '@/app/paths';
import Breadcrumb from '@/shared/ui/Breadcrumb';
import EmptyState from '@/shared/ui/EmptyState';
import Button from '@/shared/ui/Button';
import Icon from '@/shared/ui/Icon';
import Select from '@/shared/ui/Select';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  useToggleUniversityBookmark,
  useUniversities,
  useUniversityCountries,
} from '@/shared/api/universities';
import type { LanguageTestType } from '@/shared/types/enums';
import SchoolCard from '../components/SchoolCard';
import SchoolFilterCard from '../components/SchoolFilterCard';
import { toSchoolSummary, type SchoolSummary } from '../types';
import { useSchoolFilters, type SchoolSort } from '../useSchoolFilters';

const SORT_OPTIONS: { value: SchoolSort; label: string }[] = [
  { value: 'country', label: '국가·학교명순' },
  { value: 'name', label: '학교명순' },
  { value: 'recruit', label: '모집 인원순' },
];

// 모집 중인 학교 먼저. 모집 인원순은 서버 정렬이 없어 화면에서 정렬함
function sortSchools(list: SchoolSummary[], sort: SchoolSort) {
  return list
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      if (a.s.recruiting !== b.s.recruiting) return a.s.recruiting ? -1 : 1;
      if (sort === 'recruit') return (b.s.recruitCount ?? 0) - (a.s.recruitCount ?? 0) || a.i - b.i;
      return a.i - b.i;
    })
    .map(({ s }) => s);
}

export default function SchoolListPage() {
  const { filters, setFilter, reset } = useSchoolFilters();
  const keyword = useDebouncedValue(filters.q.trim());

  const { data, isPending, isError, refetch } = useUniversities({
    keyword,
    country: filters.country,
    languageTest: (filters.exam || undefined) as LanguageTestType | undefined,
    eligibleOnly: filters.eligibleOnly,
    sort: filters.sort === 'country' ? 'COUNTRY' : 'NAME',
  });
  const { data: countryList } = useUniversityCountries();
  const countries = countryList?.map((c) => c.country) ?? [];

  const result = sortSchools((data?.universities ?? []).map(toSchoolSummary), filters.sort);

  const bookmark = useToggleUniversityBookmark();
  const toggleBookmark = (s: SchoolSummary) =>
    bookmark.mutate({ universityId: s.universityId, on: !s.bookmarked });

  // 처음 들어올 때만 카드가 차례로 나오고, 필터로 바뀔 때는 바뀐 카드만 움직임
  const firstRender = useRef(true);
  useEffect(() => {
    if (data) firstRender.current = false;
  }, [data]);

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <Breadcrumb items={[{ label: '협정교', to: PATHS.schools }, { label: '협정교 목록' }]} />
          <h1 className="text-[30px] font-bold sm:text-[38px]">협정교 목록</h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="group text-primary hover:bg-primary-soft rounded-control flex h-[54px] items-center gap-2 px-4 text-[19px] font-semibold transition-[background-color,transform] active:scale-95"
        >
          <Icon
            name="refresh"
            className="transition-transform duration-300 group-hover:-rotate-180"
          />
          필터 초기화
        </button>
      </StaggerItem>

      <StaggerItem>
        <SchoolFilterCard filters={filters} countries={countries} onChange={setFilter} />
      </StaggerItem>

      <StaggerItem className="flex flex-wrap items-center gap-2.5">
        <h2 className="text-[22px] font-bold sm:text-[26px]">협정교 목록</h2>
        <motion.span
          key={result.length}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-accent text-[19px] font-semibold"
        >
          {result.length}곳
        </motion.span>
        <div className="flex-1" />
        <Select
          size="sm"
          className="w-full sm:w-[230px]"
          value={filters.sort}
          onChange={(v) => setFilter('sort', v as SchoolSort)}
          options={SORT_OPTIONS}
        />
      </StaggerItem>

      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-ink-muted py-16 text-center text-[19px]"
          >
            협정교를 불러오는 중이에요
          </motion.p>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              title="협정교를 불러오지 못했어요"
              description="잠시 후 다시 시도해 주세요."
              action={
                <Button variant="secondary" icon="refresh" onClick={() => void refetch()}>
                  다시 시도
                </Button>
              }
            />
          </motion.div>
        ) : result.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {result.map((s, i) => (
                <motion.div
                  key={s.universityId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: firstRender.current ? 0.18 + i * 0.06 : 0 }}
                >
                  <SchoolCard school={s} onToggleBookmark={() => toggleBookmark(s)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EmptyState
              title="조건에 맞는 학교가 없어요"
              description="검색어나 필터를 바꾸거나 필터를 초기화해 보세요."
              action={
                <Button variant="secondary" icon="refresh" onClick={reset}>
                  필터 초기화
                </Button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Stagger>
  );
}

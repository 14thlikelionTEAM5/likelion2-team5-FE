import Card from '@/shared/ui/Card';
import Chip from '@/shared/ui/Chip';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import Toggle from '@/shared/ui/Toggle';
import { LANGUAGE_TEST_LABEL, LANGUAGE_TESTS } from '@/shared/types/enums';
import type { SchoolFilters } from '../useSchoolFilters';

export const LANGUAGE_EXAMS = LANGUAGE_TESTS.map((value) => ({
  value,
  label: LANGUAGE_TEST_LABEL[value],
}));

export default function SchoolFilterCard({
  filters,
  countries,
  onChange,
}: {
  filters: SchoolFilters;
  countries: string[];
  onChange: <K extends keyof SchoolFilters>(key: K, value: SchoolFilters[K]) => void;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Select
          icon="globe"
          className="w-full md:w-[299px]"
          value={filters.country}
          onChange={(v) => onChange('country', v)}
          options={[
            { value: '', label: '국가 (전체)' },
            ...countries.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Input
          icon="search"
          className="w-full md:flex-1"
          placeholder="학교 이름 검색..."
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-sub mr-1 w-full text-[18px] font-semibold sm:w-auto">
            어학시험 종류
          </span>
          {LANGUAGE_EXAMS.map((exam) => (
            <Chip
              key={exam.value}
              selected={filters.exam === exam.value}
              onClick={() => onChange('exam', filters.exam === exam.value ? '' : exam.value)}
            >
              {exam.label}
            </Chip>
          ))}
        </div>

        <div className="hidden flex-1 xl:block" />

        <Toggle
          checked={filters.eligibleOnly}
          onChange={(v) => onChange('eligibleOnly', v)}
          label="지원 가능한 학교만 보기"
        />
      </div>
    </Card>
  );
}

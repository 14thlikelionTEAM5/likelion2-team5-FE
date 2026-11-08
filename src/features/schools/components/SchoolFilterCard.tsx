import Card from '@/shared/ui/Card';
import Chip from '@/shared/ui/Chip';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';
import Toggle from '@/shared/ui/Toggle';
import type { SchoolFilters } from '../useSchoolFilters';

// TODO: 값은 BE 명세 확인 후 shared/types/enums.ts로 이동
export const LANGUAGE_EXAMS = [
  { value: 'OLD_TOEFL', label: '구토플' },
  { value: 'NEW_TOEFL', label: '뉴토플' },
  { value: 'ITP_TOEFL', label: '기관토플' },
  { value: 'IELTS', label: 'IELTS' },
];

const onlyDigits = (v: string) => v.replace(/\D/g, '');

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
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-ink-sub w-full text-[18px] font-semibold sm:w-auto">예상 비용</span>
          <Input
            size="sm"
            unit="원"
            inputMode="numeric"
            placeholder="최소"
            className="min-w-0 flex-1 sm:w-[173px] sm:flex-none"
            value={filters.minCost}
            onChange={(e) => onChange('minCost', onlyDigits(e.target.value))}
          />
          <span className="text-ink-faint text-[19px]">—</span>
          <Input
            size="sm"
            unit="원"
            inputMode="numeric"
            placeholder="최대"
            className="min-w-0 flex-1 sm:w-[173px] sm:flex-none"
            value={filters.maxCost}
            onChange={(e) => onChange('maxCost', onlyDigits(e.target.value))}
          />
        </div>

        <div className="bg-line-soft hidden h-8 w-px xl:block" />

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

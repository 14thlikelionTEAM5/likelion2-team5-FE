import { searchUniversities } from '@/shared/api/universities';
import type { SchoolOption } from '../model';
import SearchSelect from './SearchSelect';

export default function SchoolSearch({
  value,
  onChange,
}: {
  value: SchoolOption | null;
  onChange: (value: SchoolOption | null) => void;
}) {
  return (
    <SearchSelect
      value={value}
      onChange={onChange}
      search={(q) => (q.trim() ? searchUniversities(q) : [])}
      getKey={(s) => s.universityId}
      getLabel={(s) => `${s.name} (${s.country})`}
      renderOption={(s) => (
        <>
          <span className="text-ink font-medium">{s.name}</span>
          <span className="text-ink-muted">{s.country}</span>
        </>
      )}
      placeholder="학교 이름 검색..."
      clearLabel="학교 선택 지우기"
    />
  );
}

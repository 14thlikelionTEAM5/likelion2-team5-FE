import { useSearchParams } from 'react-router';

export type SchoolSort = 'country' | 'name' | 'recruit';

export type SchoolFilters = {
  country: string;
  q: string;
  minCost: string;
  maxCost: string;
  exam: string;
  eligibleOnly: boolean;
  sort: SchoolSort;
};

// 상세에서 뒤로 와도 필터가 유지되도록 URL query에 저장
export function useSchoolFilters() {
  const [params, setParams] = useSearchParams();

  const filters: SchoolFilters = {
    country: params.get('country') ?? '',
    q: params.get('q') ?? '',
    minCost: params.get('minCost') ?? '',
    maxCost: params.get('maxCost') ?? '',
    exam: params.get('exam') ?? '',
    eligibleOnly: params.get('eligibleOnly') === 'true',
    sort: (params.get('sort') as SchoolSort) || 'country',
  };

  const setFilter = <K extends keyof SchoolFilters>(key: K, value: SchoolFilters[K]) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === '' || value === false || (key === 'sort' && value === 'country')) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        return next;
      },
      { replace: true },
    );
  };

  const reset = () => setParams({}, { replace: true });

  return { filters, setFilter, reset };
}

import { useEffect, useState } from 'react';

// 입력이 멈춘 뒤에만 값이 바뀜 (검색 요청 줄이기)
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

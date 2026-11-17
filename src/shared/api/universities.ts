import { api } from './client';

export type UniversitySearchResult = {
  universityId: number;
  name: string;
  country: string;
};

/** Requires login. The server trims, matches without case/accents and returns up to 10 rows. */
export function searchUniversities(keyword: string): Promise<UniversitySearchResult[]> {
  const normalized = keyword.trim();
  const length = Array.from(normalized).length;
  if (length < 1 || length > 50) {
    return Promise.reject(new Error('학교명은 앞뒤 공백을 제외하고 1~50자로 입력해 주세요.'));
  }
  return api<UniversitySearchResult[]>(`/universities/search?${new URLSearchParams({ keyword: normalized })}`);
}

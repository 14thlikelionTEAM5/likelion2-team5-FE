import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export type BookmarkUniversity = {
  universityId: number;
  name: string;
  country: string;
  agreementId: number | null;
  quota: number | null;
  minGpa: number | null;
  languageRequirements: { testType: string; minScore: number }[] | null;
  eligibility: {
    status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_CHECK';
    reasonCodes: string[];
    message: string | null;
  };
  isBookmarked: boolean;
};

export type BookmarksResponse = {
  semester: string | null;
  totalCount: number;
  universities: BookmarkUniversity[];
};

export type BookmarkStatusResponse = {
  universityId: number;
  isBookmarked: boolean;
};

const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_STORAGE_KEY = 'passhufs-favorites-preview-v1';

// 화면 테스트 전용 데이터로 실제 협정교/모집 조건이 아닙니다.
const MOCK_SCHOOLS: BookmarkUniversity[] = [
  {
    universityId: 1, name: 'University of Groningen (테스트)', country: '네덜란드',
    agreementId: null, quota: 2, minGpa: 3.0,
    languageRequirements: [{ testType: 'IELTS', minScore: 6.5 }],
    eligibility: { status: 'NEEDS_CHECK', reasonCodes: [], message: '테스트용 데이터입니다.' },
    isBookmarked: true,
  },
  {
    universityId: 2, name: '테스트 협정교 B', country: '독일',
    agreementId: null, quota: null, minGpa: null,
    languageRequirements: null,
    eligibility: { status: 'ELIGIBLE', reasonCodes: [], message: null },
    isBookmarked: true,
  },
  {
    universityId: 3, name: '테스트 협정교 C', country: '일본',
    agreementId: null, quota: 1, minGpa: 3.5,
    languageRequirements: [{ testType: 'TOEFL', minScore: 80 }],
    eligibility: { status: 'NOT_ELIGIBLE', reasonCodes: ['MOCK'], message: '테스트용 판정입니다.' },
    isBookmarked: true,
  },
];

function getMockIds(): number[] {
  try {
    const saved = sessionStorage.getItem(MOCK_STORAGE_KEY);
    if (!saved) return MOCK_SCHOOLS.map((school) => school.universityId);
    const ids: unknown = JSON.parse(saved);
    return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return MOCK_SCHOOLS.map((school) => school.universityId);
  }
}

function saveMockIds(ids: number[]) {
  try { sessionStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(ids)); } catch { /* Preview storage may be unavailable. */ }
}

export const getBookmarks = (): Promise<BookmarksResponse> => {
  if (USE_MOCK) {
    const ids = getMockIds();
    const universities = MOCK_SCHOOLS.filter((school) => ids.includes(school.universityId));
    return Promise.resolve({ semester: null, totalCount: universities.length, universities });
  }
  return api<BookmarksResponse>('/bookmarks');
};

export const useBookmarks = () => useQuery({ queryKey: ['bookmarks'], queryFn: getBookmarks });

export const removeBookmark = (universityId: number): Promise<BookmarkStatusResponse> => {
  if (USE_MOCK) {
    saveMockIds(getMockIds().filter((id) => id !== universityId));
    return Promise.resolve({ universityId, isBookmarked: false });
  }
  return api<BookmarkStatusResponse>(`/bookmarks/${universityId}`, { method: 'DELETE' });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); },
  });
};

export const addBookmark = (universityId: number): Promise<BookmarkStatusResponse> => {
  if (USE_MOCK) {
    if (!MOCK_SCHOOLS.some((school) => school.universityId === universityId)) {
      return Promise.reject(new Error('Mock 목록에 없는 학교입니다.'));
    }
    saveMockIds([...new Set([...getMockIds(), universityId])]);
    return Promise.resolve({ universityId, isBookmarked: true });
  }
  return api<BookmarkStatusResponse>('/bookmarks', { method: 'POST', body: { universityId } });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBookmark,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['bookmarks'] }); },
  });
};

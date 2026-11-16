import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';

export type BookmarkUniversity = {
  universityId: number;
  name: string;
  country: string;
  agreementId: number | null;
  quota: number | null;
  minGpa: number | null;
  languageRequirements: {
    testType: string;
    minScore: number;
  }[] | null;
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

// 개발 서버에서만 사용되는 화면 확인용 데이터입니다. 실제 API 응답이 아닙니다.
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

const DEMO_UNIVERSITY: BookmarkUniversity = {
  universityId: 1, // 팀원이 확인한 Groningen 상세 API의 ID
  name: 'University of Groningen',
  country: '네덜란드',
  agreementId: null,
  quota: 2,
  minGpa: 3.0,
  languageRequirements: [{ testType: 'IELTS', minScore: 6.5 }],
  eligibility: {
    status: 'NEEDS_CHECK',
    reasonCodes: [],
    message: '화면 확인을 위한 임시 판정입니다.',
  },
  isBookmarked: true,
};

let mockUniversities: BookmarkUniversity[] = [DEMO_UNIVERSITY];

export const getBookmarks = (): Promise<BookmarksResponse> =>
  USE_MOCK
    ? Promise.resolve({
        semester: null,
        totalCount: mockUniversities.length,
        universities: [...mockUniversities],
      })
    : api<BookmarksResponse>('/bookmarks');

export const useBookmarks = () =>
  useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

export const removeBookmark = (universityId: number): Promise<BookmarkStatusResponse> => {
  if (USE_MOCK) {
    mockUniversities = mockUniversities.filter((school) => school.universityId !== universityId);
    return Promise.resolve({ universityId, isBookmarked: false });
  }
  return api<BookmarkStatusResponse>(`/bookmarks/${universityId}`, {
    method: 'DELETE',
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const addBookmark = (universityId: number): Promise<BookmarkStatusResponse> => {
  if (USE_MOCK) {
    // 개발용으로 준비된 학교에만 임시 추가를 허용합니다.
    if (universityId !== DEMO_UNIVERSITY.universityId) {
      return Promise.reject(new Error('개발용 데이터에 없는 학교입니다.'));
    }
    if (!mockUniversities.some((school) => school.universityId === universityId)) {
      mockUniversities = [DEMO_UNIVERSITY, ...mockUniversities];
    }
    return Promise.resolve({ universityId, isBookmarked: true });
  }
  return api<BookmarkStatusResponse>('/bookmarks', {
    method: 'POST',
    body: { universityId },
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

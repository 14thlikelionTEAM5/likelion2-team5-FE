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

export const getBookmarks = () =>
  api<BookmarksResponse>('/bookmarks');

export const useBookmarks = () =>
  useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  });

export const removeBookmark = (universityId: number) =>
  api<BookmarkStatusResponse>(`/bookmarks/${universityId}`, {
    method: 'DELETE',
  });

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

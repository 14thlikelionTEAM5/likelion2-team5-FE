import { api } from './client';

export type HomeCourseRecognitionType = 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE';

export type HomeCourseSearchResult = {
  homeCourseId: number;
  code: string;
  name: string;
  credit: number;
  category: HomeCourseRecognitionType;
};

/** 전필·전선 과목만 검색합니다. 교양은 본교 과목 검색 API를 사용하지 않습니다. */
export function searchHomeCourses(
  keyword: string,
  recognitionType: HomeCourseRecognitionType,
): Promise<HomeCourseSearchResult[]> {
  const normalized = keyword.trim();
  const length = Array.from(normalized).length;

  if (length < 1 || length > 50) {
    return Promise.reject(
      new Error('과목명은 앞뒤 공백을 제외하고 1~50자로 입력해 주세요.'),
    );
  }

  const query = new URLSearchParams({
    keyword: normalized,
    recognitionType,
  });

  return api<HomeCourseSearchResult[]>(`/home-courses?${query.toString()}`);
}

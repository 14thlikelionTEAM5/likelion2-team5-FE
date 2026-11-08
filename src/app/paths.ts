export type ExperienceKind = 'report' | 'spec' | 'credit'; // 귀국보고서 / 합격·탈락 스펙 / 인정 사례
export type SchoolTab = 'official' | 'spec' | 'courses' | 'reports';

export const PATHS = {
  landing: '/',
  login: '/login',
  signup: '/signup',

  home: '/home',
  schools: '/schools',
  schoolDetail: (universityId: number | string, tab?: SchoolTab) =>
    `/schools/${universityId}${tab ? `?tab=${tab}` : ''}`,
  favorites: '/schools/favorites',

  // universityId를 넘기면 학교가 미리 선택됨 (협정교 상세에서 들어올 때)
  experienceNew: (kind?: ExperienceKind, universityId?: number) => {
    const q = new URLSearchParams();
    if (kind) q.set('type', kind);
    if (universityId) q.set('universityId', String(universityId));
    return `/experience/new${q.size ? `?${q}` : ''}`;
  },
  experienceMine: '/experience/mine',
  experienceEdit: (kind: ExperienceKind, id: number | string) => `/experience/edit/${kind}/${id}`,

  plans: '/plans',
  planEdit: (planId: number | string) => `/plans/${planId}/edit`,

  mypage: '/mypage',
} as const;

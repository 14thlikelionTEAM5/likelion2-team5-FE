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

  experienceNew: (kind?: ExperienceKind) => `/experience/new${kind ? `?type=${kind}` : ''}`,
  experienceMine: '/experience/mine',
  experienceEdit: (kind: ExperienceKind, id: number | string) => `/experience/edit/${kind}/${id}`,

  plans: '/plans',
  planEdit: (planId: number | string) => `/plans/${planId}/edit`,

  mypage: '/mypage',
} as const;

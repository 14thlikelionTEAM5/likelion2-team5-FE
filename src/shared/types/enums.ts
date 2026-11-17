export type MajorType = 'PRIMARY' | 'DOUBLE' | 'MINOR';
export const MAJOR_TYPE_LABEL: Record<MajorType, string> = {
  PRIMARY: '경영 본전공',
  DOUBLE: '이중전공',
  MINOR: '부전공',
};

export type AdmissionResult = 'PASS' | 'FAIL';
export const ADMISSION_RESULT_LABEL: Record<AdmissionResult, string> = {
  PASS: '합격',
  FAIL: '탈락',
};

export type LanguageTestType = 'TOEFL_IBT' | 'TOEFL_NEW' | 'TOEFL_ITP' | 'IELTS';
export const LANGUAGE_TEST_LABEL: Record<LanguageTestType, string> = {
  TOEFL_IBT: '구토플',
  TOEFL_NEW: '뉴토플',
  TOEFL_ITP: '기관토플',
  IELTS: 'IELTS',
};
export const LANGUAGE_TESTS = Object.keys(LANGUAGE_TEST_LABEL) as LanguageTestType[];
export const languageTestLabel = (v: string) => LANGUAGE_TEST_LABEL[v as LanguageTestType] ?? v;

export type RecognitionType = 'MAJOR_REQUIRED' | 'MAJOR_ELECTIVE' | 'GENERAL';
export const RECOGNITION_TYPE_LABEL: Record<RecognitionType, string> = {
  MAJOR_REQUIRED: '전필',
  MAJOR_ELECTIVE: '전선',
  GENERAL: '교양',
};

export type HousingType = 'DORM' | 'SELF' | 'OTHER';
export const HOUSING_TYPE_LABEL: Record<HousingType, string> = {
  DORM: '기숙사',
  SELF: '자취',
  OTHER: '기타',
};

export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_CHECK';

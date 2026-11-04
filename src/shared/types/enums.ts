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

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import heroLight from '@/assets/decor/hero-light.svg';

type RecognitionType = '전필' | '전선' | '교양';

type PlannedCourse = {
  id: number;
  name: string;
  foreignCredits: number;
  recognizedCredits: number | null;
  recognitionType: RecognitionType;
  homeCourse: string;
};

// 피그마 화면 확인용 임시 데이터입니다. 실제 데이터는 수강계획 API 연동 후 교체합니다.
const INITIAL_COURSES: PlannedCourse[] = [
  { id: 1, name: 'Marketing Principles', foreignCredits: 3, recognizedCredits: 1.8, recognitionType: '전선', homeCourse: '마케팅원론' },
  { id: 2, name: 'International Business', foreignCredits: 3, recognizedCredits: 1.8, recognitionType: '교양', homeCourse: '' },
  { id: 3, name: 'Financial Accounting', foreignCredits: 3, recognizedCredits: 1.8, recognitionType: '전선', homeCourse: '재무회계' },
];

const inputClass = 'h-[52px] w-full rounded-[10px] border border-line bg-white px-4 text-[17px] text-ink outline-none focus:border-primary';
const outlineButtonClass = 'inline-flex min-h-[43px] items-center justify-center rounded-[7px] border border-primary px-5 text-[16px] font-semibold text-primary hover:bg-primary-soft';

export default function PlanEditPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<PlannedCourse[]>(INITIAL_COURSES);
  const [courseName, setCourseName] = useState('');
  const [foreignCredits, setForeignCredits] = useState('');
  const [recognitionType, setRecognitionType] = useState<RecognitionType>('전선');
  const [homeCourse, setHomeCourse] = useState('');
  const [message, setMessage] = useState('');

  const totalCredits = useMemo(
    () => courses.reduce((sum, course) => sum + (course.recognizedCredits ?? 0), 0),
    [courses],
  );

  const handleAddCourse = () => {
    const credits = Number(foreignCredits);
    if (!courseName.trim() || !foreignCredits.trim() || !Number.isFinite(credits) || credits <= 0) {
      setMessage('교과목명과 올바른 외국 학점을 입력해 주세요.');
      return;
    }
    // ECTS 0.6배 계산은 디자인 시연용입니다. 실제 계산은 서버 결과를 기준으로 합니다.
    const converted = Math.round(credits * 0.6 * 10) / 10;
    setCourses((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: courseName.trim(),
        foreignCredits: credits,
        recognizedCredits: Math.min(converted, 3),
        recognitionType,
        homeCourse: homeCourse.trim(),
      },
    ]);
    setCourseName('');
    setForeignCredits('');
    setHomeCourse('');
    setMessage('과목이 화면에 추가되었습니다. 아직 서버에는 저장되지 않습니다.');
  };

  const handleRemoveCourse = (id: number) => {
    setCourses((previous) => previous.filter((course) => course.id !== id));
    setMessage('과목을 화면에서 삭제했습니다.');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 pb-12">
      <section
        className="relative flex min-h-[212px] flex-col justify-center overflow-hidden rounded-card bg-primary-soft bg-cover bg-center px-6 py-8 sm:px-11"
        style={{ backgroundImage: `url("${heroLight}")` }}
      >
        <p className="mb-3 text-sm font-semibold text-ink-sub">수강계획</p>
        <h1 className="text-[30px] font-bold text-primary sm:text-[34px]">수강계획 편집</h1>
        <p className="mt-3 text-base text-ink-sub sm:text-lg">파견교별 과목을 담고 예상 인정 학점을 확인하세요.</p>
      </section>

      <div className="rounded-[24px] bg-white px-5 py-9 sm:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(-1)} className="text-sm font-semibold text-primary hover:underline">← 목록으로 돌아가기</button>
          <span className="text-[18px] text-ink-muted">University of Groningen · 2027-1학기</span>
        </div>

        <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[25px] font-semibold text-ink">담은 과목</h2>
            <p className="text-[18px] font-semibold text-ink">합계 {Number(totalCredits.toFixed(1))} / 18학점</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] table-fixed text-left text-[16px] text-ink">
              <colgroup><col className="w-[26%]" /><col className="w-[14%]" /><col className="w-[14%]" /><col className="w-[16%]" /><col className="w-[22%]" /><col className="w-[8%]" /></colgroup>
              <thead className="bg-panel text-[17px] font-semibold">
                <tr><th className="px-3 py-3">교과목</th><th className="px-3 py-3">외국 학점</th><th className="px-3 py-3">인정 학점</th><th className="px-3 py-3">인정 구분</th><th className="px-3 py-3">본교 과목</th><th className="px-2 py-3"><span className="sr-only">삭제</span></th></tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-line">
                    <td className="break-words px-3 py-4">{course.name}</td>
                    <td className="px-3 py-4">{course.foreignCredits}</td>
                    <td className="px-3 py-4">{course.recognizedCredits ?? '-'}</td>
                    <td className="px-3 py-4">{course.recognitionType}</td>
                    <td className="break-words px-3 py-4">{course.homeCourse || '-'}</td>
                    <td className="px-2 py-3"><button type="button" className={outlineButtonClass} onClick={() => handleRemoveCourse(course.id)} aria-label={`${course.name} 삭제`}>삭제</button></td>
                  </tr>
                ))}
                {courses.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-ink-muted">담은 과목이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6 rounded-[18px] border border-line bg-white px-5 py-7">
          <h2 className="mb-6 text-[25px] font-semibold text-ink">직접 입력</h2>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)]">
            <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">
              교과목명
              <input className={inputClass} value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="교과목명" />
            </label>
            <label className="flex min-w-0 flex-col gap-3 text-[17px] font-semibold text-ink">
              외국 학점
              <input className={inputClass} type="number" min="0.1" step="0.1" value={foreignCredits} onChange={(event) => setForeignCredits(event.target.value)} placeholder="예: 3" />
            </label>
            <fieldset className="min-w-0">
              <legend className="mb-3 text-[17px] font-semibold text-ink">인정 구분</legend>
              <div className="flex flex-wrap gap-2">
                {(['전필', '전선', '교양'] as const).map((type) => (
                  <label key={type} className={`inline-flex min-h-[50px] cursor-pointer items-center gap-2 rounded-[7px] border px-4 text-[17px] ${recognitionType === type ? 'border-primary bg-primary-soft' : 'border-line bg-white'}`}>
                    <input type="radio" name="recognitionType" checked={recognitionType === type} onChange={() => setRecognitionType(type)} />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <label className="mt-7 flex max-w-[660px] flex-col gap-3 text-[17px] font-semibold text-ink">
            본교 과목
            <input className={inputClass} value={homeCourse} onChange={(event) => setHomeCourse(event.target.value)} placeholder="본교 과목명 검색 (임시 텍스트 입력)" />
          </label>
          <button type="button" className={`mt-7 ${outlineButtonClass}`} onClick={handleAddCourse}>과목 추가</button>
          {message && <p role="status" className="mt-4 text-sm text-ink-sub">{message}</p>}
        </section>

        <section className="rounded-[16px] border border-line bg-primary-soft px-6 py-6">
          <h2 className="mb-4 text-[22px] font-semibold text-ink">학점 계산 및 인정 기준</h2>
          <p className="mb-3 text-[17px] text-ink">ECTS 환산: 외국 학점 × 0.6 · 과목당 최대 3학점 · 학기당 최대 18학점</p>
          <p className="mb-3 text-[17px] text-ink-muted">전공필수는 인정 제한 및 예외 확인이 필요하며, 인정 불가 과목은 계산에서 제외합니다.</p>
          <p className="text-[17px] text-ink-muted">참고용 예상치입니다. 최종 인정 학점은 소속 학과 확인이 필요합니다.</p>
          {totalCredits > 18 && <p role="alert" className="mt-4 font-semibold text-danger">예상 인정 학점 합계가 18학점을 초과했습니다.</p>}
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">경영대학 내규 기준 계산이며 소속 학과 기준과 다를 수 있음</p>
          <button type="button" onClick={() => setMessage('저장 API가 연결되지 않았습니다. 현재 변경사항은 서버에 저장되지 않습니다.')} className="min-h-[49px] min-w-[140px] rounded-[10px] bg-primary px-6 text-[17px] font-semibold text-white hover:opacity-90">저장</button>
        </div>
      </div>
    </div>
  );
}

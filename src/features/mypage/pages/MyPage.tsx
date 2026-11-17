import { useCheckNickname, isValidNickname, useMyProfile, useUpdateMyProfile, useChangeMyPassword, useDeleteMyAccount } from '@/shared/api/users';
import type { MajorType, LanguageTestType } from '@/shared/api/users';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import heroLight from '@/assets/decor/hero-light.svg';

const panel = 'rounded-[18px] border border-line bg-white px-5 py-7 sm:px-[30px] sm:py-8';
const label = 'mb-2 block text-[17px] font-semibold text-ink';
const readOnly = 'flex min-h-[54px] w-full items-center rounded-[8px] border border-line bg-panel px-4 text-[18px] text-ink-sub';
const inputClass = 'min-h-[54px] w-full rounded-[8px] border border-line bg-white px-4 text-[18px] text-ink outline-none focus:border-primary';
const outline = 'inline-flex min-h-[51px] items-center justify-center rounded-[10px] border border-line px-6 text-[17px] font-semibold text-ink';

const testLabel = (value: string) => ({
  TOEFL_IBT: 'TOEFL iBT', TOEFL_NEW: 'TOEFL NEW', TOEFL_ITP: 'TOEFL ITP', IELTS: 'IELTS',
} as Record<string, string>)[value] ?? value;
const TEST_TYPES: LanguageTestType[] = ['TOEFL_IBT', 'TOEFL_NEW', 'TOEFL_ITP', 'IELTS'];
type ScoreRow = { key: number; testType: LanguageTestType; score: string };


export default function MyPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error, refetch } = useMyProfile();
  const [nickname, setNickname] = useState('');
  const [checkResult, setCheckResult] = useState<{ nickname: string; available: boolean; isCurrent: boolean } | null>(null);
  const [checkError, setCheckError] = useState('');
  const nicknameCheck = useCheckNickname();
  const updateProfile = useUpdateMyProfile();
  const [majorType, setMajorType] = useState<MajorType>('PRIMARY');
  const [gpa, setGpa] = useState('');
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [saveError, setSaveError] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const changePassword = useChangeMyPassword();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const deleteAccount = useDeleteMyAccount();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawConfirm, setWithdrawConfirm] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawNotice, setWithdrawNotice] = useState('');

  const handleWithdraw = async () => {
    if (deleteAccount.isPending || withdrawConfirm !== '회원 탈퇴') return;
    setWithdrawError('');
    try {
      if (isMock) {
        // 개발 모드에서는 실제 계정을 삭제하거나 인증 토큰을 지우지 않습니다.
        setWithdrawOpen(false);
        setWithdrawConfirm('');
        setWithdrawNotice('Mock 모드: 탈퇴 확인 화면 테스트가 완료됐습니다. 계정은 삭제되지 않았습니다.');
        return;
      }
      await deleteAccount.mutateAsync();
      // 성공했을 때만 인증 정보를 제거합니다. 다른 저장 데이터는 보존합니다.
      for (const storage of [window.localStorage, window.sessionStorage]) {
        for (const key of Object.keys(storage)) {
          if (/^(?:access[_-]?token|auth[_-]?token|token|jwt|passhufs[_-]?access[_-]?token)$/i.test(key)) {
            storage.removeItem(key);
          }
        }
      }
      navigate('/', { replace: true });
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다. 다시 시도해 주세요.');
    }
  };


  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (changePassword.isPending) return;
    setPasswordError('');
    setPasswordNotice('');
    if (!currentPassword.trim()) {
      setPasswordError('현재 비밀번호를 입력해 주세요.');
      return;
    }
    const byteLength = new TextEncoder().encode(newPassword).length;
    if (newPassword.length < 8 || newPassword.length > 64 || byteLength > 72) {
      setPasswordError('새 비밀번호는 8~64자, UTF-8 기준 72바이트 이하여야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOpen(false);
      setPasswordNotice(isMock ? 'Mock 모드: 비밀번호 변경 화면 테스트가 완료됐습니다. 실제 계정에는 반영되지 않습니다.' : '비밀번호가 변경되었습니다.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    }
  };


  useEffect(() => {
    setNickname(profile?.nickname ?? '');
    setCheckResult(null);
    setCheckError('');
  }, [profile?.nickname]);
  useEffect(() => {
    if (!profile) return;
    setMajorType(profile.majorType === 'DOUBLE' || profile.majorType === 'MINOR' ? profile.majorType : 'PRIMARY');
    setGpa(profile.gpa === null ? '' : String(profile.gpa));
    setScores(profile.languageScores.filter((x) => TEST_TYPES.includes(x.testType as LanguageTestType)).map((x, i) => ({
      key: i + 1, testType: x.testType as LanguageTestType, score: String(x.score),
    })));
  }, [profile]);

  const handleSaveNickname = async () => {
    if (!profile || updateProfile.isPending) return;
    const value = nickname.normalize('NFC');
    setSaveError(''); setSaveNotice('');
    if (!isValidNickname(value)) { setSaveError('닉네임은 2~12자의 한글 완성형·영문·숫자만 허용합니다.'); return; }
    if (value === profile.nickname) { setSaveNotice('현재 사용 중인 닉네임입니다.'); return; }
    if (!checkResult || checkResult.nickname !== value || !checkResult.available) {
      setSaveError('닉네임 중복 확인을 먼저 완료해 주세요.'); return;
    }
    try {
      await updateProfile.mutateAsync({ nickname: value });
      setSaveNotice('닉네임을 저장했습니다.');
      setCheckResult(null);
    } catch (err) { setSaveError(err instanceof Error ? err.message : '닉네임 저장에 실패했습니다.'); }
  };

  const handleSaveConditions = async () => {
    if (!profile || updateProfile.isPending) return;
    setSaveError(''); setSaveNotice('');
    const gpaNumber = Number(gpa);
    if (!gpa.trim() || !Number.isFinite(gpaNumber) || gpaNumber < 0 || gpaNumber > 4.5) {
      setSaveError('누적 학점은 0~4.5 범위로 입력해 주세요.'); return;
    }
    if (new Set(scores.map((row) => row.testType)).size !== scores.length) {
      setSaveError('같은 어학 시험 종류는 두 번 등록할 수 없습니다.'); return;
    }
    if (scores.some((row) => !row.score.trim() || !Number.isFinite(Number(row.score)) || Number(row.score) < 0)) {
      setSaveError('어학 시험 점수는 0 이상의 숫자로 입력해 주세요.'); return;
    }
    try {
      await updateProfile.mutateAsync({ majorType, gpa: gpaNumber,
        languageScores: scores.map(({ testType, score }) => ({ testType, score: Number(score) })) });
      setSaveNotice('지원 조건과 어학 성적을 저장했습니다.');
    } catch (err) { setSaveError(err instanceof Error ? err.message : '지원 조건 저장에 실패했습니다.'); }
  };

  const checkNicknameNow = async () => {
    const value = nickname.normalize('NFC');
    if (!isValidNickname(value)) {
      setCheckResult(null);
      setCheckError('닉네임은 2~12자의 한글 완성형, 영문, 숫자만 사용할 수 있습니다.');
      return;
    }
    setCheckError('');
    setCheckResult(null);
    try {
      setCheckResult(await nicknameCheck.mutateAsync(value));
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : '닉네임 중복 확인에 실패했습니다.');
    }
  };
  const isMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 pb-12">
      <section
        className="relative flex min-h-[212px] flex-col justify-center overflow-hidden rounded-card bg-primary-soft bg-cover bg-center px-6 py-8 sm:px-11"
        style={{ backgroundImage: `url("${heroLight}")` }}
      >
        <div className="relative z-10">
          <p className="mb-3 text-sm font-semibold text-ink-sub">내 계정</p>
          <h1 className="text-[30px] font-bold text-primary sm:text-[34px]">마이페이지</h1>
          <p className="mt-3 text-base text-ink-sub sm:text-lg">내 정보와 교환학생 지원 조건을 확인하세요.</p>
        </div>
      </section>

      {isMock && (
        <p className="text-sm text-caution" role="status">
          개발용 Mock 모드입니다. 아래 정보는 테스트용 예시이며 실제 서버 정보가 아닙니다.
        </p>
      )}

      {isLoading ? (
        <section className={panel}><p role="status" className="py-10 text-center text-ink-muted">내 정보를 불러오는 중입니다...</p></section>
      ) : error ? (
        <section className={panel}>
          <p role="alert" className="text-danger">내 정보를 불러오지 못했습니다. {error instanceof Error ? error.message : '다시 시도해 주세요.'}</p>
          <button type="button" className={`${outline} mt-5`} onClick={() => void refetch()}>다시 시도</button>
        </section>
      ) : profile ? (
        <>
          <section className={panel}>
            <h2 className="mb-7 text-[25px] font-semibold text-ink">내 정보</h2>
            <div className="grid gap-6">
              <div>
                <span className={label}>학교 메일</span>
                <div className={readOnly}>{profile.schoolEmail} <span className="ml-2 text-sm text-ink-muted">· 변경 불가</span></div>
              </div>
              <div className="max-w-[1100px]">
                <span className={label}>닉네임</span>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    aria-label="닉네임"
                    className={`${inputClass} flex-1`}
                    value={nickname}
                    maxLength={12}
                    onChange={(event) => { setNickname(event.target.value); setCheckResult(null); setCheckError(''); }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void checkNicknameNow(); } }}
                  />
                  <button
                    type="button"
                    onClick={() => void checkNicknameNow()}
                    disabled={nicknameCheck.isPending}
                    className={`${outline} disabled:cursor-not-allowed disabled:opacity-50`}
                  >{nicknameCheck.isPending ? '확인 중...' : '중복 확인'}</button>
                </div>
                <p className="mt-3 text-sm text-ink-muted">2~12자의 한글 완성형·영문·숫자만 사용 가능 (공백·특수문자 불가)</p>
                {checkResult && <p role="status" className={`mt-2 text-sm ${checkResult.available ? 'text-primary' : 'text-danger'}`}>
                  {checkResult.isCurrent ? '현재 사용 중인 본인의 닉네임입니다.' : checkResult.available ? '사용할 수 있는 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
                </p>}
                {checkError && <p role="alert" className="mt-2 text-sm text-danger">{checkError}</p>}
                <button type="button" onClick={() => void handleSaveNickname()}
                  disabled={updateProfile.isPending || nicknameCheck.isPending}
                  className="mt-4 min-h-[51px] rounded-[10px] bg-primary px-7 text-[17px] font-semibold text-white disabled:opacity-50">
                  {updateProfile.isPending ? '저장 중...' : '닉네임 저장'}
                </button>
              </div>
            </div>
          </section>

          <section className={panel}>
            <h2 className="mb-7 text-[25px] font-semibold text-ink">지원 조건</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className={label}>전공 구분
                <select className={`${inputClass} mt-2`} value={majorType} onChange={(e) => setMajorType(e.target.value as MajorType)}>
                  <option value="PRIMARY">본전공</option><option value="DOUBLE">이중전공</option><option value="MINOR">부전공</option>
                </select>
              </label>
              <label className={label}>누적 학점 (4.5 만점)
                <input className={`${inputClass} mt-2`} type="number" min="0" max="4.5" step="0.01" value={gpa}
                  onChange={(e) => setGpa(e.target.value)} placeholder="예: 3.8" />
              </label>
            </div>
            <h3 className="mb-5 mt-10 text-[23px] font-semibold text-ink">어학 성적</h3>
            {scores.length === 0 && <p className="mb-4 rounded-[8px] bg-panel px-4 py-5 text-ink-muted">등록된 어학 성적이 없습니다.</p>}
            <div className="flex flex-col gap-4">
              {scores.map((row) => <div key={row.key} className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className={label}>시험 종류
                  <select className={`${inputClass} mt-2`} value={row.testType} onChange={(e) => setScores((prev) => prev.map((r) => r.key === row.key ? { ...r, testType: e.target.value as LanguageTestType } : r))}>
                    {TEST_TYPES.map((t) => <option key={t} value={t}>{testLabel(t)}</option>)}
                  </select>
                </label>
                <label className={label}>점수
                  <input className={`${inputClass} mt-2`} type="number" min="0" step="any" value={row.score} onChange={(e) => setScores((prev) => prev.map((r) => r.key === row.key ? { ...r, score: e.target.value } : r))} />
                </label>
                <button type="button" className={outline} onClick={() => setScores((prev) => prev.filter((r) => r.key !== row.key))}>행 삭제</button>
              </div>)}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={outline} disabled={scores.length >= TEST_TYPES.length} onClick={() => {
                const next = TEST_TYPES.find((t) => !scores.some((s) => s.testType === t));
                if (next) setScores((prev) => [...prev, { key: Date.now(), testType: next, score: '' }]);
              }}>시험 추가</button>
              <button type="button" onClick={() => void handleSaveConditions()} disabled={updateProfile.isPending}
                className="min-h-[51px] rounded-[10px] bg-primary px-7 text-[17px] font-semibold text-white disabled:opacity-50">
                {updateProfile.isPending ? '저장 중...' : '지원 조건 저장'}
              </button>
            </div>
            <p className="mt-3 text-sm text-ink-muted">어학 성적은 저장할 때 목록 전체가 교체됩니다. 모든 행을 삭제하고 저장하면 어학 성적이 초기화됩니다.</p>
          </section>

          {(saveError || saveNotice) && <p role={saveError ? 'alert' : 'status'} className={`text-sm ${saveError ? 'text-danger' : 'text-primary'}`}>{saveError || saveNotice}</p>}
          <section className={panel}>
            <h2 className="mb-6 text-[25px] font-semibold text-ink">계정</h2>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => { setPasswordOpen((prev) => !prev); setPasswordError(''); setPasswordNotice(''); }} className={outline} aria-expanded={passwordOpen} aria-controls="mypage-password-form">{passwordOpen ? '비밀번호 변경 닫기' : '비밀번호 변경'}</button>
              <button type="button" className={outline} onClick={() => { setWithdrawOpen(true); setWithdrawConfirm(''); setWithdrawError(''); setWithdrawNotice(''); }}>회원 탈퇴</button>
            </div>
            <p className="mt-6 text-sm text-ink-muted">비밀번호를 변경하거나 계정을 탈퇴할 수 있습니다. 회원 탈퇴 시 등록 정보가 모두 삭제되며 복구할 수 없습니다.</p>
            {withdrawNotice && <p role="status" className="mt-3 text-sm text-caution">{withdrawNotice}</p>}
            {passwordNotice && <p role="status" className="mt-3 text-sm text-primary">{passwordNotice}</p>}
            {withdrawOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="presentation">
                <div role="alertdialog" aria-modal="true" aria-labelledby="withdraw-title" aria-describedby="withdraw-description" className="w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-xl sm:p-8">
                  <h3 id="withdraw-title" className="mb-4 text-[24px] font-semibold text-ink">회원 탈퇴</h3>
                  <p id="withdraw-description" className="mb-4 text-[16px] leading-relaxed text-ink-sub">
                    탈퇴하면 계정, 지원 조건, 수강계획, 경험 정보(공개된 정보 포함)가 영구 삭제되며 복구할 수 없습니다.
                  </p>
                  {isMock && <p className="mb-4 text-sm text-caution">Mock 모드: 실제 계정과 데이터는 삭제되지 않습니다.</p>}
                  <label className={label} htmlFor="withdraw-confirm">계속하려면 <strong>회원 탈퇴</strong>를 입력하세요.</label>
                  <input id="withdraw-confirm" className={inputClass} autoComplete="off" value={withdrawConfirm} onChange={(event) => setWithdrawConfirm(event.target.value)} placeholder="회원 탈퇴" disabled={deleteAccount.isPending} />
                  {withdrawError && <p role="alert" className="mt-3 text-sm text-danger">{withdrawError}</p>}
                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" className={outline} onClick={() => { setWithdrawOpen(false); setWithdrawConfirm(''); setWithdrawError(''); }} disabled={deleteAccount.isPending}>취소</button>
                    <button type="button" className="min-h-[51px] rounded-[10px] bg-danger px-6 text-[17px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void handleWithdraw()} disabled={withdrawConfirm !== '회원 탈퇴' || deleteAccount.isPending}>
                      {deleteAccount.isPending ? '탈퇴 처리 중...' : isMock ? 'Mock 탈퇴 테스트' : '영구 삭제 및 탈퇴'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {passwordOpen && (
              <form id="mypage-password-form" onSubmit={(event) => void handleChangePassword(event)} className="mt-6 max-w-[650px] space-y-4 rounded-[14px] border border-line bg-panel p-5 sm:p-6">
                <h3 className="text-xl font-semibold text-ink">비밀번호 변경</h3>
                <label className={label}>현재 비밀번호
                  <input type="password" autoComplete="current-password" required className={`${inputClass} mt-2`} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="현재 비밀번호" />
                </label>
                <label className={label}>새 비밀번호
                  <input type="password" autoComplete="new-password" required minLength={8} maxLength={64} className={`${inputClass} mt-2`} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="8~64자, UTF-8 72바이트 이하" />
                </label>
                <label className={label}>새 비밀번호 확인
                  <input type="password" autoComplete="new-password" required className={`${inputClass} mt-2`} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="새 비밀번호 다시 입력" />
                </label>
                {passwordError && <p role="alert" className="text-sm text-danger">{passwordError}</p>}
                {isMock && <p className="text-sm text-caution">Mock 모드에서는 실제 비밀번호가 변경되지 않습니다.</p>}
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={changePassword.isPending} className="min-h-[51px] rounded-[10px] bg-primary px-7 text-[17px] font-semibold text-white disabled:opacity-50">{changePassword.isPending ? '변경 중...' : '비밀번호 변경 저장'}</button>
                  <button type="button" disabled={changePassword.isPending} className={outline} onClick={() => { setPasswordOpen(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}>취소</button>
                </div>
              </form>
            )}
          </section>
        </>
      ) : (
        <section className={panel}><p className="text-ink-muted">조회된 프로필이 없습니다.</p></section>
      )}
    </div>
  );
}

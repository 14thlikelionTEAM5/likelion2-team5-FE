import { ApiError } from '@/shared/api/client';
import { sendSchoolEmailCode, verifySchoolEmailCode } from '../api/schoolEmail';
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { MAJOR_TYPE_LABEL } from '@/shared/types/enums';
import SignupConditions from './SignupConditions';
import logo from './landing-logo.svg';
import background from './landing-background.png';
import SignupStepBadge from './SignupStepBadge';

const serviceTerms = [
  [
    '제 1 조 (목적)',
    '본 약관은 PassHUFS(이하 서비스)가 제공하는 대학생 특화 회원 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
  ],
  [
    '제 2 조 (용어의 정의)',
    '회원이란 한국외국어대학교(@hufs.ac.kr) 웹메일 인증을 완료하고 본 약관에 동의하여 계정을 생성한 자를 말합니다. 인증 정보란 학번, 웹메일 주소 등 본인 확인 및 재학 증명을 위해 입력된 정보를 의미합니다.',
  ],
  [
    '제 3 조 (회원가입 및 인증 의무)',
    '이용자는 회사가 요청하는 교내 공식 메일 계정 인증을 필수적으로 통과해야 하며, 타인의 학적 정보나 도용된 이메일을 사용할 경우 사전 통보 없이 계정이 정지 및 삭제될 수 있습니다.',
  ],
  [
    '제 4 조 (이용자의 의무 및 제재)',
    '회원은 교내 건전한 커뮤니티 질서를 준수해야 하며, 부적절한 광고, 명예훼손, 학내 분란 조장 게시물 게시 시 이용약관에 의거하여 이용권한이 제한됩니다.',
  ],
  [
    '제 5 조 (면책조항)',
    '회사는 천재지변, 교내 네트워크 장애 또는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.',
  ],
];

const steps = ['기본 정보', '메일 인증', '약관 동의', '지원 조건'];
const controlClass =
  'h-11 w-full min-w-0 rounded-lg border border-[#cdd7e6] bg-white px-3 text-sm placeholder:text-[#687b96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#426682] aria-invalid:border-[#8E5656] aria-invalid:focus-visible:outline-[#8E5656]';
const nicknamePattern = /^[가-힣a-zA-Z0-9]{2,12}$/;

function focusSignupHeading(heading: HTMLHeadingElement | null) {
  heading?.focus();
}

function FieldLabel({ id, children }: { id: string; children: string }) {
  return (
    <label htmlFor={id} className="text-sm leading-5 font-medium">
      {children}{' '}
      <span aria-hidden="true" className="text-[#8E5656]">
        *
      </span>
    </label>
  );
}

function FieldMessage({
  id,
  help,
  error,
  success,
}: {
  id: string;
  help?: string;
  error?: string;
  success?: boolean;
}) {
  if (!help && !error) return null;
  return (
    <p
      id={id}
      role={error ? 'alert' : undefined}
      className={
        error
          ? 'text-xs text-[#8E5656]'
          : success
            ? 'text-xs text-[#00839A]'
            : 'text-xs text-[#586782]'
      }
    >
      {error || help}
    </p>
  );
}

function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={controlClass + ' pr-12'} />
      <button
        type="button"
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-controls={props.id}
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[#687b96] focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-5"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
          {visible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [checkedNickname, setCheckedNickname] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [pending, setPending] = useState<'send' | 'verify' | null>(null);
  const [sendError, setSendError] = useState('');
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const [code, setCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const [verified, setVerified] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const termsDialog = useRef<HTMLDialogElement>(null);
  const [documentTitle, setDocumentTitle] = useState('서비스 이용약관');
  const allAgreed = terms && privacy;

  const timerRunning = !!expiresAt && !verified && (secondsLeft > 0 || resendSeconds > 0);
  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  async function sendEmail() {
    if (pending || Date.now() < resendAt || verified) return;
    setPending('send');
    setSendError('');
    try {
      const sent = await sendSchoolEmailCode(email.trim());
      const deadline = Date.parse(sent?.expiresAt ?? '');
      if (!Number.isFinite(deadline)) throw new Error('Invalid expiry');
      setNow(Date.now());
      setExpiresAt(deadline);
      setResendAt(Date.parse(sent.resendAvailableAt ?? '') || 0);
      setCode('');
      setVerificationError('');
    } catch (error) {
      setSendError(
        error instanceof ApiError
          ? error.message
          : '인증 메일을 발송하지 못했어요. 다시 시도해주세요.',
      );
    } finally {
      setPending(null);
    }
  }

  async function verifyEmail() {
    if (pending || verified || code.length !== 6 || Date.now() >= expiresAt) return;
    setPending('verify');
    setVerificationError('');
    try {
      const result = await verifySchoolEmailCode(email.trim(), code);
      if (result?.verified === true) setVerified(true);
      else setVerificationError('인증번호가 올바르지 않아요');
    } catch (error) {
      setVerificationError(
        error instanceof ApiError
          ? error.message
          : '인증번호를 확인하지 못했어요. 다시 시도해주세요.',
      );
    } finally {
      setPending(null);
    }
  }

  const [major, setMajor] = useState('');

  const errors = {
    email: !email.trim()
      ? '학교 메일을 입력해주세요'
      : !/^[^\s@]+@hufs\.ac\.kr$/i.test(email.trim())
        ? '잘못된 메일 입니다'
        : '',
    nickname: !nickname.trim()
      ? '닉네임을 입력해주세요'
      : nicknamePattern.test(nickname)
        ? ''
        : '한글, 영문, 숫자로 2~12자 입력해주세요',
    password: !password
      ? '비밀번호를 입력해주세요'
      : password.length < 8
        ? '비밀번호는 8자 이상이어야 해요'
        : !/[a-z]/i.test(password) || !/\d/.test(password)
          ? '비밀번호에 영문과 숫자를 포함해주세요'
          : '',
    confirmation: !confirmation
      ? '비밀번호를 한 번 더 입력해주세요'
      : password !== confirmation
        ? '비밀번호가 다릅니다'
        : '',
    major: major ? '' : '전공 구분을 선택해주세요',
  };
  const emailError = submitted ? errors.email : '';
  const nicknameTaken = checkedNickname && !errors.nickname && nickname === '테스트123';
  const nicknameError = nicknameTaken
    ? '이미 사용중인 닉네임이에요'
    : submitted || checkedNickname
      ? errors.nickname
      : '';
  const passwordError = submitted ? errors.password : '';
  const confirmationError = submitted ? errors.confirmation : '';
  const majorError = submitted ? errors.major : '';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const firstInvalid = Object.entries(errors).find(([, message]) => message);
    if (firstInvalid) {
      event.currentTarget.querySelector<HTMLElement>('#signup-' + firstInvalid[0])?.focus();
      return;
    }
    setStepIndex(1);
  }

  return (
    <div className="min-h-dvh bg-[#e9edf1] text-[#161d30]">
      <header className="flex h-14 items-center bg-[#f9fafb] px-5 sm:px-8">
        <Link to={PATHS.landing} aria-label="PassHUFS 홈">
          <img src={logo} alt="" className="block h-auto w-[clamp(7rem,11vw,9rem)]" />
        </Link>
      </header>
      <main className="relative isolate grid min-h-[calc(100dvh-3.5rem)] px-[clamp(1rem,4vw,3rem)] py-[clamp(1rem,4dvh,2.5rem)]">
        <div className={stepIndex === 4 ? 'min-w-0 self-center' : 'min-w-0 self-start'}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-top bg-no-repeat"
            style={{
              backgroundImage: `url(${background})`,
            }}
          />
          {stepIndex < 4 && (
            <ol
              aria-label="회원가입 단계"
              className="mx-auto mb-[clamp(1rem,3dvh,2rem)] grid w-full max-w-xl grid-cols-4 py-2"
            >
              {steps.map((step, index) => (
                <li
                  key={step}
                  aria-current={index === stepIndex ? 'step' : undefined}
                  className="relative flex flex-col items-center gap-2 text-center text-[13px] text-[#94A3B8]"
                >
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-4 left-1/2 h-px w-full"
                      style={{ backgroundColor: index < stepIndex ? '#253357' : '#E2E8F0' }}
                    />
                  )}
                  <span
                    className={`relative grid size-8 place-items-center rounded-full border text-sm font-semibold ${index <= stepIndex ? 'border-[#253357] bg-[#253357] text-white' : 'border-2 border-[#CBD5E1] bg-white text-[#64748B]'}`}
                  >
                    {index < stepIndex ? '✓' : index + 1}
                  </span>
                  <span className={index === stepIndex ? 'text-[#253357]' : undefined}>{step}</span>
                </li>
              ))}
            </ol>
          )}

          {stepIndex === 0 ? (
            <section
              aria-labelledby="signup-heading"
              className="mx-auto w-full max-w-xl rounded-[14px] border border-[#e4e9f1] bg-white p-[clamp(1rem,3vw,2.25rem)] shadow-sm"
            >
              <SignupStepBadge step={1} />
              <h1
                id="signup-heading"
                tabIndex={-1}
                className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"
              >
                기본 정보를 입력해주세요
              </h1>
              <p className="mt-1 text-sm text-[#586782]">
                회원가입에 필요한 필수 정보를 차례대로 입력해주세요.
              </p>

              <form noValidate onSubmit={submit} className="mt-6 grid gap-4 sm:gap-5">
                <div className="grid gap-2">
                  <FieldLabel id="signup-email">학교 이메일</FieldLabel>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@hufs.ac.kr"
                    className={controlClass}
                    value={email}
                    onChange={(event) => {
                      const nextEmail = event.target.value;
                      setEmail(nextEmail);
                      if (nextEmail.trim() === email.trim()) return;
                      setVerified(false);
                      setSendError('');
                      setResendAt(0);
                      setCode('');
                      setVerificationError('');
                      setExpiresAt(0);
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby="signup-email-message"
                  />
                  <FieldMessage
                    id="signup-email-message"

                    help="학교 메일을 입력해주세요"
                    error={emailError}
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel id="signup-nickname">닉네임</FieldLabel>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <input
                      id="signup-nickname"
                      autoComplete="nickname"
                      required
                      placeholder="사용할 닉네임을 입력해주세요."
                      className={controlClass}
                      value={nickname}
                      onChange={(event) => {
                        setNickname(event.target.value);
                        setCheckedNickname(false);
                      }}
                      aria-invalid={!!nicknameError}
                      aria-describedby="signup-nickname-message"
                    />
                    <button
                      type="button"
                      onClick={() => setCheckedNickname(true)}
                      className="h-11 rounded-lg border border-[#cdd7e6] bg-[#eef2f7] px-3 text-sm hover:bg-[#e3eaf3]"
                    >
                      중복확인
                    </button>
                  </div>
                  <FieldMessage
                    id="signup-nickname-message"
                    help={
                      checkedNickname
                        ? '사용가능한 닉네임이에요'
                        : '한글, 영문, 숫자를 조합하여 2~12자 이내로 입력해주세요.'
                    }
                    error={nicknameError}
                    success={checkedNickname && !nicknameError}
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel id="signup-password">비밀번호</FieldLabel>
                  <PasswordInput
                    id="signup-password"
                    autoComplete="new-password"
                    required
                    placeholder="8자리 이상 입력"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={!!passwordError}
                    aria-describedby="signup-password-message"
                  />
                  <FieldMessage
                    id="signup-password-message"
                    help="영문, 숫자를 포함하여 8자리 이상 설정해야 합니다."
                    error={passwordError}
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel id="signup-confirmation">비밀번호 확인</FieldLabel>
                  <PasswordInput
                    id="signup-confirmation"
                    autoComplete="new-password"
                    required
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    aria-invalid={!!confirmationError}
                    aria-describedby={confirmationError ? 'signup-confirmation-message' : undefined}
                  />
                  <FieldMessage id="signup-confirmation-message" error={confirmationError} />
                </div>

                <div className="grid gap-2">
                  <FieldLabel id="signup-major">전공 구분</FieldLabel>
                  <div className="relative">
                    <select
                      id="signup-major"
                      name="majorType"
                      value={major}
                      onChange={(event) => setMajor(event.target.value)}
                      aria-invalid={!!majorError}
                      aria-describedby={majorError ? 'signup-major-message' : undefined}
                      required
                      className={controlClass + ' appearance-none pr-12'}
                    >
                      <option value="" disabled>
                        전공 구분을 선택해주세요
                      </option>
                      {Object.entries(MAJOR_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {value === 'PRIMARY' ? '본전공' : label}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-0 grid w-11 place-items-center text-[#687b96]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="size-5"
                      >
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </span>
                  </div>
                  <FieldMessage id="signup-major-message" error={majorError} />
                </div>

                <button
                  type="submit"
                  className="mt-1 min-h-12 rounded-lg bg-[#253357] px-4 text-sm font-semibold text-white hover:bg-[#304367]"
                >
                  다음
                </button>
              </form>
            </section>
          ) : stepIndex === 1 ? (
            <section
              aria-labelledby="verification-heading"
              className="mx-auto w-full max-w-xl rounded-[14px] border border-[#e4e9f1] bg-white p-[clamp(1rem,3vw,2.25rem)] shadow-sm"
            >
              <SignupStepBadge step={2} />
              <h1
                id="verification-heading"
                tabIndex={-1}
                ref={focusSignupHeading}
                className="mt-2 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
              >
                학교 메일을 인증해주세요
              </h1>
              <p className="mt-1 text-sm text-[#586782]">재학생 확인을 위해 인증이 필요해요</p>
              <div className="mt-7 rounded-xl border border-[#e4e9f1] bg-[#f6f8fb] p-4">
                <p className="text-xs text-[#586782]">인증할 메일 주소</p>
                <p className="mt-1 text-base font-semibold wrap-anywhere">{email.trim()}</p>
              </div>
              {expiresAt ? (
                <div className="mt-4 grid gap-3">
                  <p
                    role="status"
                    className="rounded-lg border border-[#D9EDF1] bg-[#D9EDF1] p-3 text-xs text-[#00839A]"
                  >
                    인증번호를 발송했어요. 메일을 확인해주세요.
                  </p>
                  <div className="grid gap-2">
                    <label htmlFor="signup-code" className="text-sm font-medium">
                      인증번호
                    </label>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <div className="relative">
                        <input
                          id="signup-code"
                          type={verified ? 'password' : 'text'}
                          readOnly={verified || !!pending}
                          aria-invalid={!!verificationError}
                          aria-describedby={verificationError ? 'signup-code-error' : undefined}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="인증번호 6자리"
                          className={controlClass + ' pr-16'}
                          value={code}
                          onChange={(event) => {
                            setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                            setVerificationError('');
                          }}
                        />
                        <span
                          role="timer"
                          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#8E5656] tabular-nums"
                        >
                          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                          {String(secondsLeft % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!!pending || verified || code.length !== 6 || !secondsLeft}
                        onClick={verifyEmail}
                        className="rounded-lg border border-[#cdd7e6] px-3 text-sm disabled:opacity-50"
                      >
                        {pending === 'verify' ? '확인 중…' : '인증 확인'}
                      </button>
                    </div>
                    {verificationError && (
                      <p
                        id="signup-code-error"
                        role="alert"
                        className="flex items-start gap-1.5 text-xs text-[#8E5656]"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-3.5 shrink-0 place-items-center rounded-full bg-[#8E5656] text-[10px] leading-none text-white"
                        >
                          !
                        </span>
                        {verificationError}
                      </p>
                    )}
                  </div>
                  {verified && (
                    <p
                      role="status"
                      className="rounded-lg border border-[#D9EDF1] bg-[#D9EDF1] p-3 text-xs text-[#00839A]"
                    >
                      ✓ 메일 인증이 완료됐어요.
                    </p>
                  )}
                  {!verified && !secondsLeft && (
                    <p role="status" className="text-xs text-[#8E5656]">
                      인증 시간이 만료됐어요. 메일을 다시 발송해주세요.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={sendEmail}
                    disabled={!!pending || verified || resendSeconds > 0}
                    className="cursor-pointer justify-self-start text-sm text-[#253357] underline underline-offset-2 disabled:cursor-default disabled:opacity-60"
                  >
                    {pending === 'send'
                      ? '발송 중…'
                      : resendSeconds > 0 && !verified
                        ? `인증 메일 재발송 (${resendSeconds}초)`
                        : '인증 메일 재발송'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={!!pending || verified || resendSeconds > 0}
                  className="mt-4 min-h-12 w-full rounded-xl bg-[#253357] px-4 text-sm font-semibold text-white hover:bg-[#304367]"
                >
                  {pending === 'send' ? '발송 중…' : '인증 메일 발송'}
                </button>
              )}
              {sendError && (
                <p role="alert" className="mt-3 text-sm text-[#8E5656]">
                  {sendError}
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex(0)}
                  disabled={!!pending}
                  className="min-h-11 rounded-xl border border-[#cdd7e6] px-3 text-sm font-semibold hover:bg-[#f6f8fb]"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={!verified}
                  onClick={() => {
                    setStepIndex(2);
                  }}
                  className="min-h-11 rounded-xl bg-[#253357] px-3 text-sm font-semibold text-white disabled:bg-[#E2E8F0] disabled:text-[#8291a7]"
                >
                  다음
                </button>
              </div>{' '}
            </section>
          ) : stepIndex === 2 ? (
            <section
              aria-labelledby="terms-heading"
              className="mx-auto w-full max-w-xl rounded-[14px] border border-[#e4e9f1] bg-white p-[clamp(1rem,3vw,2.25rem)] shadow-sm"
            >
              <SignupStepBadge step={3} />
              <h1
                id="terms-heading"
                tabIndex={-1}
                ref={focusSignupHeading}
                className="mt-2 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
              >
                약관에 동의해주세요
              </h1>
              <p className="mt-1 text-sm text-[#586782]">
                서비스 이용을 위해 필수 약관을 확인해주세요
              </p>
              <fieldset aria-label="필수 약관" className="mt-6 grid gap-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e4e9f1] bg-[#eef2f7] p-4">
                  <input
                    type="checkbox"
                    checked={allAgreed}
                    onChange={(event) => {
                      setTerms(event.target.checked);
                      setPrivacy(event.target.checked);
                    }}
                    className="mt-0.5 size-5 shrink-0 accent-[#253357]"
                  />
                  <span className="grid gap-1 text-sm font-semibold">
                    전체 동의{' '}
                    <span className="text-xs font-normal text-[#586782]">
                      아래 필수 약관에 모두 동의합니다.
                    </span>
                  </span>
                </label>
                <div className="divide-y divide-[#edf0f5] rounded-xl border border-[#e4e9f1]">
                  {[
                    { title: '서비스 이용약관', checked: terms, setChecked: setTerms },
                    { title: '개인정보 수집·이용 동의', checked: privacy, setChecked: setPrivacy },
                  ].map(({ title, checked, setChecked }) => (
                    <div
                      key={title}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <label className="flex min-w-0 cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setChecked(event.target.checked);
                          }}
                          className="size-4 shrink-0 accent-[#253357]"
                        />
                        <span>
                          {title} <span className="text-[#365474]">(필수)</span>
                        </span>
                      </label>
                      <button
                        type="button"
                        aria-label={title + ' 전문 보기'}
                        onClick={() => {
                          setDocumentTitle(title);
                          termsDialog.current?.showModal();
                        }}
                        className="cursor-pointer text-xs text-[#586782] underline underline-offset-2 disabled:cursor-default disabled:opacity-60"
                      >
                        전문 보기
                      </button>
                    </div>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex(1)}
                  className="min-h-11 rounded-xl border border-[#cdd7e6] px-3 text-sm font-semibold hover:bg-[#f6f8fb]"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled={!allAgreed}
                  onClick={() => setStepIndex(3)}
                  className="min-h-11 rounded-xl bg-[#253357] px-3 text-sm font-semibold text-white disabled:bg-[#E2E8F0] disabled:text-[#8291a7]"
                >
                  다음
                </button>
              </div>
            </section>
          ) : null}
          <SignupConditions
            active={stepIndex === 3}
            onBack={() => setStepIndex(2)}
            onComplete={() => setStepIndex(4)}
          />
          {stepIndex === 4 && (
            <section
              aria-labelledby="signup-complete-heading"
              className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[14px] border border-[#e4e9f1] bg-white px-[clamp(1rem,3vw,2rem)] py-[clamp(1.5rem,5dvh,2.5rem)] text-center shadow-sm"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#253357] via-[#577B8D] to-[#253357]"
              />
              <div
                aria-hidden="true"
                className="mx-auto grid size-16 place-items-center rounded-full border-2 border-[#D9E5F8] bg-[#eef3fb]"
              >
                <span className="grid size-10 place-items-center rounded-full bg-[#253357] text-xl text-white">
                  ✓
                </span>
              </div>
              <h1
                id="signup-complete-heading"
                tabIndex={-1}
                ref={focusSignupHeading}
                className="mt-5 text-xl font-semibold tracking-tight outline-none"
              >
                회원가입이 완료되었습니다!
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#586782]">
                <strong className="text-[#253357]">PassHUFS</strong>에 오신 것을 환영해요.
                <br />
                이제 나의 이중전공 지원 자격을 확인해보세요.
              </p>
              <Link
                to={PATHS.login}
                className="mt-6 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#253357] px-4 text-sm font-semibold text-white hover:bg-[#304367]"
              >
                로그인하러 가기
              </Link>
            </section>
          )}
        </div>
        <dialog
          ref={termsDialog}
          aria-labelledby="signup-document-title"
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[440px] overflow-hidden rounded-xl border border-[#e4e9f1] bg-white text-[#161d30] shadow-xl backdrop:bg-[#161d30]/65"
        >
          <div className="flex max-h-[calc(100dvh-2.25rem)] flex-col">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e4e9f1] bg-[#f8fafc] px-4 py-2">
              <h2 id="signup-document-title" className="text-sm font-medium">
                <span aria-hidden="true" className="mr-2 text-[#64748B]">
                  ●
                </span>
                {documentTitle}
              </h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => termsDialog.current?.close()}
                className="grid size-8 cursor-pointer place-items-center rounded text-[#586782] hover:bg-[#e4e9f1]"
              >
                ×
              </button>
            </header>
            <div className="min-h-0 space-y-4 overflow-y-auto p-4 text-xs leading-relaxed text-[#586782]">
              {documentTitle === '서비스 이용약관' ? (
                <>
                  <p className="rounded-lg border border-[#e4e9f1] bg-[#f1f5f8] p-3 text-[#253357]">
                    본 약관은 한국외국어대학교 재학생 및 졸업생 전용 커뮤니티 및 인증 서비스
                    PassHUFS의 기본 이용 조건과 절차를 규정합니다.
                  </p>
                  {serviceTerms.map(([title, body]) => (
                    <section key={title}>
                      <h3 className="mb-1 font-semibold text-[#161d30]">{title}</h3>
                      <p>{body}</p>
                    </section>
                  ))}
                </>
              ) : (
                <>
                  <p className="rounded-lg border border-[#e4e9f1] bg-[#f1f5f8] p-3 text-[#253357]">
                    PassHUFS는 학교 이메일 인증과 회원 서비스 제공을 위해 아래와 같이 개인정보를
                    수집·이용합니다.
                  </p>
                  <section>
                    <h3 className="mb-1 font-semibold text-[#161d30]">수집 항목</h3>
                    <p>학교 이메일 주소, 닉네임, 비밀번호, 전공 구분</p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold text-[#161d30]">수집·이용 목적</h3>
                    <p>
                      학교 이메일 인증, 회원 계정 생성과 로그인, 서비스 내 활동에 사용할 닉네임
                      표시, 전공 구분에 따른 지원 조건 안내
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold text-[#161d30]">보유·이용 기간</h3>
                    <p>
                      회원 탈퇴 시까지 보유·이용하며, 탈퇴 후에는 지체 없이 파기합니다. 관계 법령에
                      따라 보존할 의무가 있는 정보는 해당 법령에서 정한 기간 동안 보관한 후
                      파기합니다.
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold text-[#161d30]">동의 거부권 및 불이익</h3>
                    <p>
                      개인정보 수집·이용에 동의하지 않을 수 있습니다. 필수 항목의 수집·이용에
                      동의하지 않으면 회원가입을 진행할 수 없습니다.
                    </p>
                  </section>
                </>
              )}
            </div>
            <form method="dialog" className="shrink-0 border-t border-[#e4e9f1] bg-[#f8fafc] p-4">
              <button className="min-h-10 w-full cursor-pointer rounded-lg bg-[#253357] text-sm font-semibold text-white">
                확인
              </button>
            </form>
          </div>
        </dialog>
      </main>
    </div>
  );
}

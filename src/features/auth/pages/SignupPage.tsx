import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { MAJOR_TYPE_LABEL } from '@/shared/types/enums';
import logo from './landing-logo.svg';
import background from './landing-background.png';

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

function FieldMessage({ id, help, error }: { id: string; help?: string; error?: string }) {
  if (!help && !error) return null;
  return (
    <p
      id={id}
      role={error ? 'alert' : undefined}
      className={error ? 'text-xs text-[#8E5656]' : 'text-xs text-[#586782]'}
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
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [code, setCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.min(300, Math.ceil((expiresAt - Date.now()) / 1000))));
    }, 250);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  function previewEmailSent() {
    setCode('');
    setVerificationMessage('');
    setSecondsLeft(300);
    setExpiresAt(Date.now() + 300_000);
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
  const nicknameError = submitted || checkedNickname ? errors.nickname : '';
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
      <main className="relative isolate min-h-[calc(100dvh-3.5rem)] px-4 py-8">
        <div
          className={
            stepIndex === 1 ? 'flex min-h-[calc(100dvh-7.5rem)] flex-col justify-center' : undefined
          }
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-top bg-no-repeat"
            style={{
              backgroundImage: `url(${background})`,
            }}
          />
          <ol
            aria-label="회원가입 단계"
            className="mx-auto mb-8 grid w-full max-w-[520px] grid-cols-4 py-2"
          >
            {steps.map((step, index) => (
              <li
                key={step}
                aria-current={index === stepIndex ? 'step' : undefined}
                className="relative flex flex-col items-center gap-2 text-center text-xs text-[#94A3B8]"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3.5 left-1/2 h-px w-full"
                    style={{ backgroundColor: index < stepIndex ? '#253357' : '#E2E8F0' }}
                  />
                )}
                <span
                  className={`relative grid size-7 place-items-center rounded-full border font-semibold ${index <= stepIndex ? 'border-[#253357] bg-[#253357] text-white' : 'border-[#E2E8F0] bg-[#E2E8F0] text-[#64748B]'}`}
                >
                  {index < stepIndex ? '✓' : index + 1}
                </span>
                <span className={index === stepIndex ? 'text-[#253357]' : undefined}>{step}</span>
              </li>
            ))}
          </ol>

          {stepIndex === 0 ? (
            <section
              aria-labelledby="signup-heading"
              className="mx-auto w-full max-w-[520px] rounded-[14px] border border-[#e4e9f1] bg-white p-5 shadow-sm sm:p-9"
            >
              <span className="inline-flex items-center rounded bg-[#eef2f7] px-2 py-1 text-xs font-semibold text-[#253357]">
                1/4
              </span>
              <h1
                id="signup-heading"
                tabIndex={-1}
                className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl"
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
                    onChange={(event) => setEmail(event.target.value)}
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
                        ? '닉네임 중복 확인은 준비 중이에요.'
                        : '한글, 영문, 숫자를 조합하여 2~12자 이내로 입력해주세요.'
                    }
                    error={nicknameError}
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
                      className={controlClass}
                    >
                      <option value="" disabled>
                        전공 구분을 선택해주세요
                      </option>
                      {Object.entries(MAJOR_TYPE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
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
          ) : (
            <section
              aria-labelledby="verification-heading"
              className="mx-auto w-full max-w-[520px] rounded-[14px] border border-[#e4e9f1] bg-white p-5 shadow-sm sm:p-9"
            >
              <p className="text-sm font-semibold text-[#253357]">2/4</p>
              <h1
                id="verification-heading"
                tabIndex={-1}
                ref={focusSignupHeading}
                className="mt-1 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
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
                    className="rounded-lg border border-[#cfe0d4] bg-[#eff6f1] p-3 text-xs text-[#345c43]"
                  >
                    인증번호 발송 화면 미리보기예요.
                  </p>
                  <div className="grid gap-2">
                    <label htmlFor="signup-code" className="text-sm font-medium">
                      인증번호
                    </label>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <div className="relative">
                        <input
                          id="signup-code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="인증번호 6자리"
                          className={controlClass + ' pr-16'}
                          value={code}
                          onChange={(event) => {
                            setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                            setVerificationMessage('');
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
                        disabled={code.length !== 6 || !secondsLeft}
                        onClick={() => setVerificationMessage('인증번호 확인은 준비 중이에요.')}
                        className="rounded-lg border border-[#cdd7e6] px-3 text-sm disabled:opacity-50"
                      >
                        인증 확인
                      </button>
                    </div>
                  </div>
                  {!secondsLeft && (
                    <p role="status" className="text-xs text-[#8E5656]">
                      인증 시간이 만료됐어요. 메일을 다시 발송해주세요.
                    </p>
                  )}
                  {verificationMessage && (
                    <p role="status" className="text-xs text-[#586782]">
                      {verificationMessage}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={previewEmailSent}
                    className="justify-self-start text-sm text-[#253357] hover:underline"
                  >
                    인증 메일 재발송
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={previewEmailSent}
                  className="mt-4 min-h-12 w-full rounded-xl bg-[#253357] px-4 text-sm font-semibold text-white hover:bg-[#304367]"
                >
                  인증 메일 발송
                </button>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExpiresAt(0);
                    setStepIndex(0);
                  }}
                  className="min-h-11 rounded-xl border border-[#cdd7e6] px-3 text-sm font-semibold hover:bg-[#f6f8fb]"
                >
                  이전
                </button>
                <button
                  type="button"
                  disabled
                  className="min-h-11 rounded-xl bg-[#E2E8F0] px-3 text-sm font-semibold text-[#8291a7]"
                >
                  다음
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

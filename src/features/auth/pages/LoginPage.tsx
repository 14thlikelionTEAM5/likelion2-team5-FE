import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useLogin } from '@/shared/api/auth';
import { ApiError } from '@/shared/api/client';
import { PATHS } from '@/app/paths';
import logo from './landing-logo.svg';
import background from './landing-background.png';

const inputClass =
  'min-h-12 w-full sm:min-h-13 sm:text-base rounded-[10px] border border-[#dce3ee] aria-invalid:border-[#8E5656] aria-invalid:focus-visible:outline-[#8E5656] bg-white py-2 pr-3 pl-10 text-sm text-[#161d30] placeholder:text-[#667893] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#426682]';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? PATHS.home;

  const [schoolEmail, setSchoolEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { mutate, isPending, error, reset } = useLogin();
  const invalidCredentials = error instanceof ApiError && error.status === 401;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const emailInput = event.currentTarget.elements.namedItem('schoolEmail') as HTMLInputElement;
    const invalidEmail = !emailInput.validity.valid;
    const invalidPassword = password.length === 0;
    setEmailError(invalidEmail);
    setPasswordError(invalidPassword);

    if (invalidEmail || invalidPassword) {
      reset();
      (invalidEmail
        ? emailInput
        : event.currentTarget.querySelector<HTMLInputElement>('#login-password')
      )?.focus();
      return;
    }
    mutate(
      { schoolEmail: schoolEmail.trim(), password },
      { onSuccess: () => navigate(from, { replace: true }) },
    );
  }

  return (
    <div className="min-h-dvh bg-[#e9edf1] text-[#161d30]">
      <header className="flex h-14 items-center bg-[#f9fafb] px-5 sm:px-8">
        <Link to={PATHS.landing} aria-label="PassHUFS 랜딩페이지">
          <img src={logo} alt="" className="block h-auto w-[clamp(7rem,11vw,9rem)]" />
        </Link>
      </header>

      <main
        className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center bg-cover bg-center px-4 pt-[clamp(2rem,9vh,5.75rem)] pb-12"
        style={{ backgroundImage: 'url(' + background + ')' }}
      >
        <p className="mb-[clamp(1.25rem,5vh,3.25rem)] flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium shadow-sm">
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full bg-left bg-no-repeat"
            style={{ backgroundImage: 'url(' + logo + ')', backgroundSize: 'auto 100%' }}
          />
          서울 · 글로벌 캠퍼스 통합 로그인
        </p>

        <section
          aria-labelledby="login-heading"
          className="w-full max-w-[520px] rounded-[14px] border border-[#e4e9f1] bg-white p-6 shadow-[0_12px_28px_#2434560a] sm:p-10"
        >
          <h1 id="login-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            다시 만나서 반가워요
          </h1>
          <p className="mt-2 text-sm text-[#586782] sm:text-base">학교 메일로 로그인해주세요</p>

          <form noValidate onSubmit={submit} className="mt-6 grid gap-5 sm:mt-7">
            <div className="grid gap-2">
              <label htmlFor="school-email" className="text-sm leading-5 font-semibold">
                학교 메일
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-3 grid w-5 place-items-center text-lg leading-none text-[#7385a2]"
                >
                  @
                </span>
                <input
                  id="school-email"
                  name="schoolEmail"
                  type="email"
                  autoComplete="username"
                  placeholder="name@hufs.ac.kr"
                  required
                  className={inputClass}
                  value={schoolEmail}
                  aria-invalid={emailError}
                  aria-describedby={emailError ? 'school-email-error' : undefined}
                  onChange={(event) => {
                    setSchoolEmail(event.target.value);
                    setEmailError(false);
                    if (error) reset();
                  }}
                />
              </div>
              {emailError && (
                <p id="school-email-error" role="alert" className="text-sm text-[#8E5656]">
                  {schoolEmail.trim() ? '잘못된 메일입니다.' : '학교 메일을 입력해주세요.'}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="login-password" className="text-sm leading-5 font-semibold">
                비밀번호
              </label>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-[#7385a2]"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4m-4 4v2" />
                </svg>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="비밀번호를 입력해주세요"
                  required
                  className={inputClass + ' pr-11'}
                  value={password}
                  aria-invalid={passwordError}
                  aria-describedby={passwordError ? 'login-password-error' : undefined}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError(false);
                    if (error) reset();
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  aria-controls="login-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-[10px] text-[#7385a2] hover:text-[#233254] focus-visible:outline-2 focus-visible:-outline-offset-2"
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
                    {showPassword && <path d="m4 4 16 16" />}
                  </svg>
                </button>
              </div>
              {passwordError && (
                <p id="login-password-error" role="alert" className="text-sm text-[#8E5656]">
                  비밀번호를 입력해주세요.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#8E5656]">
                {invalidCredentials ? '메일 또는 비밀번호가 올바르지 않습니다.' : error.message}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="mt-1 min-h-12 rounded-[10px] bg-[#253357] px-4 py-2 text-sm font-semibold text-white hover:bg-[#304367] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#426682] disabled:cursor-wait disabled:opacity-70 sm:min-h-13 sm:text-base"
            >
              {isPending ? '로그인 중…' : '로그인'}
            </button>
          </form>

          <p className="mt-6 border-t border-[#edf0f5] pt-6 text-center text-sm text-[#586782] sm:text-base">
            아직 계정이 없으신가요?
            <Link
              to={PATHS.signup}
              className="ml-2 inline-block font-semibold text-[#365474] hover:underline"
            >
              회원가입
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

// 임시 화면. 디자인은 자유롭게 바꾸고 로그인 처리는 useLogin 사용
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLogin } from '@/shared/api/auth';
import { PATHS } from '@/app/paths';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? PATHS.home;

  const [schoolEmail, setSchoolEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useLogin();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ schoolEmail, password }, { onSuccess: () => navigate(from, { replace: true }) });
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-24 flex max-w-sm flex-col gap-3">
      <p className="text-ink-muted text-sm">담당: 재우 (동작 확인용 임시 화면)</p>
      <h1 className="text-2xl font-bold">로그인</h1>
      <input
        className="rounded-lg border p-3"
        placeholder="name@hufs.ac.kr"
        value={schoolEmail}
        onChange={(e) => setSchoolEmail(e.target.value)}
      />
      <input
        className="rounded-lg border p-3"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <button className="bg-primary rounded-lg p-3 text-white" disabled={isPending}>
        {isPending ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}

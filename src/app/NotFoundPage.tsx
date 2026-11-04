import { Link } from 'react-router';
import { PATHS } from '@/app/paths';

export default function NotFoundPage() {
  return (
    <div>
      <h1>페이지를 찾을 수 없어요</h1>
      <Link to={PATHS.home}>홈으로</Link>
    </div>
  );
}
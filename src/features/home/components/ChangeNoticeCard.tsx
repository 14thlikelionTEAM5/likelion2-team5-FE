import { useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Icon from '@/shared/ui/Icon';
import CardHeading from './CardHeading';
import StatBox from './StatBox';

export type AgreementChanges = {
  baseDate: string;
  newCount: number;
  quotaChangedCount: number;
  closedCount: number;
};

export default function ChangeNoticeCard({ changes }: { changes: AgreementChanges }) {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-6 xl:flex-row xl:items-center xl:gap-10">
      <CardHeading
        icon="bell"
        title="이번 학기 변경 안내"
        description={`기준일 ${changes.baseDate.replaceAll('-', '.')}`}
      />
      <div className="flex gap-3 xl:flex-1">
        <StatBox large label="신규 학교" value={`${changes.newCount}곳`} />
        <StatBox large label="인원 변경" value={`${changes.quotaChangedCount}곳`} />
        <StatBox large label="모집 중단" value={`${changes.closedCount}곳`} />
      </div>
      <Button
        variant="secondary"
        className="self-start xl:self-auto"
        onClick={() => navigate(PATHS.schools)}
      >
        협정교 목록에서 보기
        <Icon name="right" />
      </Button>
    </Card>
  );
}

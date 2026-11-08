import { useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Icon from '@/shared/ui/Icon';
import CardHeading from './CardHeading';
import StatBox from './StatBox';

export type RecentPlan = {
  name: string;
  universityName: string;
  updatedAt: string;
  itemCount: number;
  expectedCredits: number;
};

export default function ShortcutCards({ recentPlan }: { recentPlan: RecentPlan | null }) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="flex flex-col items-start gap-5">
        <CardHeading
          icon="globe"
          title="협정교 둘러보기"
          description="전체 협정교 목록으로 이동해 지원 가능 여부를 확인해요"
        />
        <div className="flex-1" />
        <Button onClick={() => navigate(PATHS.schools)}>
          협정교 목록 보기
          <Icon name="arrowR" />
        </Button>
      </Card>

      <Card className="flex flex-col items-start gap-5">
        {recentPlan ? (
          <>
            <CardHeading
              icon="cal"
              title="최근 수강계획"
              description={`${recentPlan.name} · ${recentPlan.universityName} · ${recentPlan.updatedAt.replaceAll('-', '.')} 수정`}
            />
            <div className="flex w-full gap-3">
              <StatBox label="담은 과목" value={`${recentPlan.itemCount}개`} />
              <StatBox label="예상 인정 학점" value={`${recentPlan.expectedCredits}학점`} />
            </div>
          </>
        ) : (
          <>
            <CardHeading
              icon="cal"
              title="최근 수강계획"
              description="아직 만든 수강계획이 없어요"
            />
            <div className="flex-1" />
            <Button icon="cal" onClick={() => navigate(PATHS.plans)}>
              수강계획 만들기
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

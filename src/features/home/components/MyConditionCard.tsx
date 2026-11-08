import { Link, useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import { MAJOR_TYPE_LABEL, type MajorType } from '@/shared/types/enums';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Icon from '@/shared/ui/Icon';
import Panel from '@/shared/ui/Panel';

const GPA_MAX = 4.5;

export type LanguageScore = { exam: string; score: string };

export default function MyConditionCard({
  majorType,
  gpa,
  languageScores,
}: {
  majorType: MajorType;
  gpa: number;
  languageScores: LanguageScore[];
}) {
  const navigate = useNavigate();

  return (
    <Card
      title="내 지원 조건"
      action={
        <Button variant="secondary" icon="pen" onClick={() => navigate(PATHS.mypage)}>
          수정
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="flex flex-col gap-2.5">
          <Label>전공 구분</Label>
          <p className="text-[28px] font-bold">{MAJOR_TYPE_LABEL[majorType]}</p>
        </Panel>

        <Panel className="flex flex-col gap-2.5">
          <Label>누적 학점</Label>
          <p className="flex items-end gap-1.5">
            <span className="text-[28px] font-bold">{gpa.toFixed(1)}</span>
            <span className="text-ink-muted pb-0.5 text-[19px] font-medium">/ {GPA_MAX}</span>
          </p>
          <div className="bg-primary-soft h-2 overflow-hidden rounded-[4px]">
            <div
              className="bg-accent h-full rounded-[4px]"
              style={{ width: `${Math.min(gpa / GPA_MAX, 1) * 100}%` }}
            />
          </div>
        </Panel>

        <Panel className="flex flex-col gap-2.5">
          <Label>어학 시험</Label>
          {languageScores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {languageScores.map(({ exam, score }) => (
                <span
                  key={exam}
                  className="border-line text-ink-sub flex h-11 items-center rounded-full border bg-white px-4 text-[18px] font-medium"
                >
                  {exam} {score}
                </span>
              ))}
            </div>
          ) : (
            <>
              <p className="text-ink-muted text-[28px] font-bold">어학 성적 없음</p>
              <Link
                to={PATHS.mypage}
                className="text-accent flex items-center gap-1 text-[18px] font-semibold"
              >
                마이페이지에서 입력할 수 있어요
                <Icon name="right" size={19} />
              </Link>
            </>
          )}
        </Panel>
      </div>
    </Card>
  );
}

function Label({ children }: { children: string }) {
  return <p className="text-ink-muted text-[18px] font-medium">{children}</p>;
}

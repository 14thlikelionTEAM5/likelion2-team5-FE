import { APPLY_SCHEDULE } from '@/shared/constants/schedule';
import type { MajorType } from '@/shared/types/enums';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import ChangeNoticeCard, { type AgreementChanges } from '../components/ChangeNoticeCard';
import HomeHero from '../components/HomeHero';
import MyConditionCard, { type LanguageScore } from '../components/MyConditionCard';
import ShortcutCards, { type RecentPlan } from '../components/ShortcutCards';

// TODO: /users/me, /study-plans, /agreements/changes 연결
const MOCK_USER = {
  nickname: 'OOO',
  majorType: 'PRIMARY' as MajorType,
  gpa: 4.0,
  languageScores: [
    { exam: '뉴토플', score: '100' },
    { exam: 'IELTS', score: '6.5' },
  ] as LanguageScore[],
};

const MOCK_PLAN: RecentPlan | null = {
  name: '1안',
  universityName: 'University of Example',
  updatedAt: '2026-11-01',
  itemCount: 5,
  expectedCredits: 15,
};

const MOCK_CHANGES: AgreementChanges = {
  baseDate: '2026-10-07',
  newCount: 3,
  quotaChangedCount: 2,
  closedCount: 1,
};

export default function HomePage() {
  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <HomeHero semester={APPLY_SCHEDULE.semester} nickname={MOCK_USER.nickname} />
      </StaggerItem>
      <StaggerItem>
        <MyConditionCard
          majorType={MOCK_USER.majorType}
          gpa={MOCK_USER.gpa}
          languageScores={MOCK_USER.languageScores}
        />
      </StaggerItem>
      <StaggerItem>
        <ShortcutCards recentPlan={MOCK_PLAN} />
      </StaggerItem>
      <StaggerItem>
        <ChangeNoticeCard changes={MOCK_CHANGES} />
      </StaggerItem>
    </Stagger>
  );
}

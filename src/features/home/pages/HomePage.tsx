import { APPLY_SCHEDULE } from '@/shared/constants/schedule';
import { useAgreementChanges } from '@/shared/api/agreements';
import { useStudyPlans } from '@/shared/api/studyPlans';
import { useMyProfile } from '@/shared/api/users';
import { languageTestLabel, type MajorType } from '@/shared/types/enums';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import ChangeNoticeCard from '../components/ChangeNoticeCard';
import HomeHero from '../components/HomeHero';
import MyConditionCard, { type LanguageScore } from '../components/MyConditionCard';
import ShortcutCards, { type RecentPlan } from '../components/ShortcutCards';

export default function HomePage() {
  const { data: profile } = useMyProfile();
  const { data: plans } = useStudyPlans();
  const { data: changes } = useAgreementChanges();

  const languageScores: LanguageScore[] = (profile?.languageScores ?? []).map((s) => ({
    exam: languageTestLabel(s.testType),
    score: String(s.score),
  }));

  // 가장 최근에 고친 수강계획
  const latest = [...(plans ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const recentPlan: RecentPlan | null = latest
    ? {
        name: latest.name,
        universityName: latest.universityName,
        updatedAt: latest.updatedAt.slice(0, 10),
        itemCount: latest.courseCount,
        expectedCredits: latest.totalExpectedCredits,
      }
    : null;

  return (
    <Stagger className="flex flex-col gap-8">
      <StaggerItem>
        <HomeHero semester={APPLY_SCHEDULE.semester} nickname={profile?.nickname ?? ''} />
      </StaggerItem>
      <StaggerItem>
        <MyConditionCard
          majorType={(profile?.majorType as MajorType | null) ?? null}
          gpa={profile?.gpa ?? null}
          languageScores={languageScores}
        />
      </StaggerItem>
      <StaggerItem>
        <ShortcutCards recentPlan={recentPlan} />
      </StaggerItem>
      <StaggerItem>
        <ChangeNoticeCard
          changes={{
            baseDate: changes?.standardDate ?? null,
            newCount: changes?.newCount ?? null,
            quotaChangedCount: changes?.quotaChangedCount ?? null,
            closedCount: changes?.closedCount ?? null,
          }}
        />
      </StaggerItem>
    </Stagger>
  );
}

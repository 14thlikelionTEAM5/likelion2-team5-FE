import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { PATHS } from '@/app/paths';
import { MAJOR_TYPE_LABEL } from '@/shared/types/enums';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Icon from '@/shared/ui/Icon';
import InfoNote from '@/shared/ui/InfoNote';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import Table from '@/shared/ui/Table';
import type { Course, CourseCase, CreditType } from '../mock';

// TODO: 구분 값은 BE 명세 확인
const CREDIT_TYPE = {
  MAJOR_ELECTIVE: { tone: 'primary', label: '전선' },
  GENERAL: { tone: 'accent', label: '교양' },
  FREE_ELECTIVE: { tone: 'neutral', label: '자선' },
} as const satisfies Record<CreditType, object>;

function SampleTag() {
  return (
    <span className="border-line text-ink-muted shrink-0 rounded-[6px] border bg-white px-1.5 text-[13px] font-medium">
      시연용 샘플
    </span>
  );
}

export default function CoursesTab({
  universityId,
  courses,
  cases,
}: {
  universityId: number;
  courses: Course[];
  cases: CourseCase[];
}) {
  const navigate = useNavigate();
  // TODO: 어느 수강계획에 담을지 고르는 방식은 동균과 협의 후 /study-plans/{planId}/items 연결
  const [added, setAdded] = useState<number[]>([]);

  if (courses.length === 0 && cases.length === 0) {
    return (
      <Stagger delay={0.12}>
        <StaggerItem>
          <EmptyState
            title="아직 등록된 과목·인정 사례가 없어요"
            description="수강 과목과 학점 인정 결과를 등록하면 다른 지원자에게 도움이 돼요"
            action={
              <Button
                icon="pen"
                onClick={() => navigate(PATHS.experienceNew('credit', universityId))}
              >
                경험 등록하기
              </Button>
            }
          />
        </StaggerItem>
      </Stagger>
    );
  }

  return (
    <Stagger delay={0.12} className="flex flex-col gap-6">
      <StaggerItem>
        <InfoNote tone="primary">
          경영대학 내규 기준 정보이며, 소속 학과 기준과 다를 수 있어요.
        </InfoNote>
      </StaggerItem>

      <StaggerItem>
        <Card title="수강 과목 목록" description="교환교에서 들을 수 있는 과목">
          {courses.length > 0 ? (
            <Table
              columns={[
                {
                  key: 'name',
                  header: '과목명',
                  render: (c) => <span className="font-medium">{c.name}</span>,
                },
                { key: 'code', header: '과목 코드', width: 207, render: (c) => c.code },
                { key: 'credits', header: '학점', width: 138, render: (c) => c.credits },
                {
                  key: 'case',
                  header: '인정 사례',
                  width: 230,
                  render: (c) => (
                    <Badge tone={c.hasCase ? 'accent' : 'neutral'}>
                      인정 결과 {c.hasCase ? '있음' : '없음'}
                    </Badge>
                  ),
                },
                {
                  key: 'add',
                  width: 230,
                  render: (c) => (
                    <AddToPlanButton
                      added={added.includes(c.courseId)}
                      onClick={() =>
                        setAdded((prev) =>
                          prev.includes(c.courseId)
                            ? prev.filter((id) => id !== c.courseId)
                            : [...prev, c.courseId],
                        )
                      }
                    />
                  ),
                },
              ]}
              rows={courses}
              rowKey={(c) => c.courseId}
            />
          ) : (
            <p className="text-ink-muted py-6 text-center text-[18px]">
              아직 등록된 수강 과목이 없어요
            </p>
          )}
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card title="인정 사례" description="경영 기준 · 등록자가 실제로 인정받은 결과">
          <div className="flex flex-col gap-5">
            {cases.length > 0 ? (
              <Table
                columns={[
                  {
                    key: 'foreign',
                    header: '교환교 과목',
                    render: (c) => (
                      <span className="flex items-center gap-2 font-medium">
                        {c.foreignCourse}
                        {c.isSample && <SampleTag />}
                      </span>
                    ),
                  },
                  {
                    key: 'home',
                    header: '본교 인정 과목',
                    width: 253,
                    render: (c) => c.homeCourse,
                  },
                  {
                    key: 'type',
                    header: '구분',
                    width: 138,
                    render: (c) => (
                      <Badge tone={CREDIT_TYPE[c.creditType].tone}>
                        {CREDIT_TYPE[c.creditType].label}
                      </Badge>
                    ),
                  },
                  { key: 'credits', header: '학점', width: 115, render: (c) => c.credits },
                  {
                    key: 'major',
                    header: '등록자 전공 구분',
                    width: 230,
                    render: (c) => MAJOR_TYPE_LABEL[c.majorType],
                  },
                  { key: 'semester', header: '교환 학기', width: 173, render: (c) => c.semester },
                ]}
                rows={cases}
                rowKey={(c) => c.caseId}
              />
            ) : (
              <p className="text-ink-muted py-6 text-center text-[18px]">
                아직 등록된 인정 사례가 없어요
              </p>
            )}
            <InfoNote>
              전공 구분(본전공·이중·부전공)에 따라 인정 기준이 달라질 수 있어요. 예를 들어 전공필수
              과목은 부전공에서만 인정될 수 있어요. 사례마다 등록자의 전공 구분이 표시되니, 본인과
              같은 전공 구분의 사례를 확인해 주세요. 최종 확인은 소속 학과에서 해야 해요.
            </InfoNote>
          </div>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}

function AddToPlanButton({ added, onClick }: { added: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={onClick}
      className={`flex h-11 items-center gap-2 rounded-[10px] border px-3.5 text-[18px] font-semibold transition-[transform,colors] active:scale-95 ${
        added
          ? 'bg-accent-soft text-primary border-transparent'
          : 'border-line text-primary hover:bg-panel bg-white'
      }`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={added ? 'check' : 'plus'}
          className="flex"
          initial={{ scale: 0.4, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
          <Icon name={added ? 'check' : 'plus'} size={19} />
        </motion.span>
      </AnimatePresence>
      {added ? '담았어요' : '수강계획에 담기'}
    </button>
  );
}

import Badge from '@/shared/ui/Badge';
import Card from '@/shared/ui/Card';
import Icon, { type IconName } from '@/shared/ui/Icon';
import InfoNote from '@/shared/ui/InfoNote';
import Panel from '@/shared/ui/Panel';
import Table from '@/shared/ui/Table';
import type { CriterionResult, Eligibility, OfficialInfo } from '../mock';

const JUDGMENT_STYLE: Record<
  Eligibility,
  { label: string; icon: IconName; box: string; circle: string }
> = {
  ELIGIBLE: {
    label: '지원 가능',
    icon: 'check',
    box: 'bg-accent-soft text-accent-strong',
    circle: 'bg-accent',
  },
  INELIGIBLE: {
    label: '지원 불가',
    icon: 'x',
    box: 'bg-danger-soft text-danger',
    circle: 'bg-danger',
  },
  UNKNOWN: {
    label: '확인 필요',
    icon: 'info',
    box: 'bg-caution-soft text-caution',
    circle: 'bg-caution',
  },
};

const RESULT_BADGE = {
  MET: { tone: 'accent', label: '충족' },
  NOT_MET: { tone: 'danger', label: '미충족' },
  UNKNOWN: { tone: 'caution', label: '확인 필요' },
} as const satisfies Record<CriterionResult, object>;

const dot = (date: string) => date.replaceAll('-', '.');

export default function OfficialTab({ info }: { info: OfficialInfo }) {
  const judgment = JUDGMENT_STYLE[info.judgment.result];

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Card title="지원 자격" description="학교 공식 기준">
          <div className="flex gap-4">
            <Panel className="flex flex-1 flex-col gap-2">
              <p className="text-ink-muted text-[18px] font-medium">학점 기준</p>
              <p className="text-[26px] font-bold">{info.gpaCriterion ?? '-'}</p>
            </Panel>
            <Panel className="flex flex-1 flex-col gap-2">
              <p className="text-ink-muted text-[18px] font-medium">어학 기준</p>
              <p className="text-[26px] font-bold">{info.languageCriterion ?? '-'}</p>
            </Panel>
          </div>
        </Card>

        <Card title="원문 요약" description="예상 비용 · 혜택 · 비고">
          <div className="flex flex-col gap-5">
            <Panel className="flex flex-col gap-2.5 text-[19px]">
              <p className="font-semibold">공식 자료 요약</p>
              <p className="text-ink-sub leading-[1.6]">
                {info.summary ?? '아직 정리된 공식 자료가 없어요.'}
              </p>
            </Panel>
            <div className="flex items-center gap-2">
              {info.sourceUrl && (
                <a
                  href={info.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary flex h-[54px] items-center gap-2 px-1 text-[18px] font-semibold"
                >
                  원문 링크
                  <Icon name="ext" />
                </a>
              )}
              <div className="flex-1" />
              <p className="text-ink-muted text-[16px]">기준일 {dot(info.baseDate)}</p>
            </div>
            <InfoNote>
              학생들이 직접 적은 비용은 섞지 않고, 귀국보고서 탭에서 따로 보여드려요.
            </InfoNote>
          </div>
        </Card>
      </div>

      <div className="flex w-[600px] shrink-0 flex-col gap-6">
        <Card
          title="내 자격 판정 결과"
          action={
            <p className="text-ink-muted text-[16px]">판정 근거 기준일 {dot(info.baseDate)}</p>
          }
        >
          <div className="flex flex-col gap-5">
            <div className={`rounded-panel flex items-center gap-4 p-5 ${judgment.box}`}>
              <div
                className={`flex size-[53px] shrink-0 items-center justify-center rounded-full text-white ${judgment.circle}`}
              >
                <Icon name={judgment.icon} size={29} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[28px] font-bold">{judgment.label}</p>
                <p className="text-[18px] font-medium">사유: {info.judgment.reason}</p>
              </div>
            </div>

            <Table
              columns={[
                { key: 'item', header: '항목', width: 138, render: (r) => r.item },
                { key: 'criterion', header: '학교 기준', render: (r) => r.criterion },
                { key: 'mine', header: '내 값', width: 150, render: (r) => r.mine },
                {
                  key: 'result',
                  header: '결과',
                  width: 115,
                  render: (r) => (
                    <Badge tone={RESULT_BADGE[r.result].tone}>{RESULT_BADGE[r.result].label}</Badge>
                  ),
                },
              ]}
              rows={info.judgment.rows}
              rowKey={(r) => r.item}
            />

            <InfoNote>판정은 참고용이에요. 최종 확인은 국제교류팀 공지를 확인해 주세요.</InfoNote>
          </div>
        </Card>

        {info.courseListUrl && (
          <Card className="flex items-center gap-4">
            <div className="bg-accent-soft text-primary flex size-[58px] shrink-0 items-center justify-center rounded-[19px]">
              <Icon name="book" size={29} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h2 className="text-[26px] font-bold">강의 목록</h2>
              <p className="text-ink-muted text-[18px]">학교 공식 강의목록 페이지</p>
            </div>
            <a
              href={info.courseListUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-control border-line text-primary hover:bg-panel flex h-[54px] items-center gap-2 border bg-white px-5 text-[19px] font-semibold"
            >
              강의 목록 보기
              <Icon name="ext" />
            </a>
          </Card>
        )}
      </div>
    </div>
  );
}

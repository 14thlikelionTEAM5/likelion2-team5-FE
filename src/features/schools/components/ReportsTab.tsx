import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { PATHS } from '@/app/paths';
import AutoHeight from '@/shared/ui/AutoHeight';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Icon, { type IconName } from '@/shared/ui/Icon';
import { Stagger, StaggerItem } from '@/shared/ui/Stagger';
import Table from '@/shared/ui/Table';
import type { HousingType, ReturnReport } from '../mock';

const PREVIEW_COUNT = 3;

const HOUSING: { value: HousingType; label: string }[] = [
  { value: 'DORM', label: '기숙사' },
  { value: 'OFF_CAMPUS', label: '자취' },
  { value: 'OTHER', label: '기타' },
];

// 값이 없으면 "-"
function Raw({ value }: { value?: string }) {
  return value ? (
    <span className="text-ink-sub">{value}</span>
  ) : (
    <span className="text-ink-faint">-</span>
  );
}

function SampleTag() {
  return (
    <span className="border-line text-ink-muted shrink-0 rounded-[6px] border bg-white px-1.5 text-[13px] font-medium">
      샘플
    </span>
  );
}

// compact: 좁은 표에서는 샘플 표시 없이 학기만
function Semester({ report, compact }: { report: ReturnReport; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-medium whitespace-nowrap">
      {report.semester}학기
      {report.isSample && !compact && <SampleTag />}
    </span>
  );
}

function CardHeading({
  icon,
  title,
  description,
  side,
}: {
  icon: IconName;
  title: string;
  description?: string;
  side?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="bg-panel text-ink-sub flex size-12 shrink-0 items-center justify-center rounded-[16px]">
        <Icon name={icon} size={24} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="text-[26px] font-bold">{title}</h2>
        {description && <p className="text-ink-muted text-[18px]">{description}</p>}
      </div>
      {side}
    </div>
  );
}

function useMore<T>(rows: T[]) {
  const [expanded, setExpanded] = useState(false);
  const button =
    rows.length > PREVIEW_COUNT ? (
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-primary mt-4 flex h-11 items-center gap-2 px-1 text-[18px] font-semibold"
      >
        {expanded ? '접기' : `더보기 (+${rows.length - PREVIEW_COUNT}건)`}
        <Icon
          name="down"
          size={19}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
    ) : null;
  return { shown: expanded ? rows : rows.slice(0, PREVIEW_COUNT), button };
}

export default function ReportsTab({ reports }: { reports: ReturnReport[] }) {
  const navigate = useNavigate();
  const cost = useMore(reports);
  const visa = useMore(reports);
  const insurance = useMore(reports);
  const summary = useMore(reports);

  if (reports.length === 0) {
    return (
      <Stagger delay={0.12}>
        <StaggerItem>
          <EmptyState
            title="아직 경험이 없어요"
            description="첫 경험을 등록해 주세요"
            action={
              <Button icon="pen" onClick={() => navigate(PATHS.experienceNew('report'))}>
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
        <Card>
          <CardHeading
            icon="card"
            title="비용"
            description={'등록자가 입력한 원문 그대로 보여줘요 · 값이 없으면 "-"'}
          />
          <AutoHeight>
            <Table
              columns={[
                {
                  key: 'semester',
                  header: '학기',
                  width: 207,
                  render: (r) => <Semester report={r} />,
                },
                { key: 'flight', header: '항공', render: (r) => <Raw value={r.cost.flight} /> },
                {
                  key: 'insurance',
                  header: '보험',
                  render: (r) => <Raw value={r.cost.insurance} />,
                },
                {
                  key: 'living',
                  header: '월 생활비',
                  render: (r) => <Raw value={r.cost.monthlyLiving} />,
                },
                { key: 'total', header: '총 비용', render: (r) => <Raw value={r.cost.total} /> },
              ]}
              rows={cost.shown}
              rowKey={(r) => r.reportId}
            />
          </AutoHeight>
          {cost.button}
        </Card>
      </StaggerItem>

      <div className="grid grid-cols-3 items-stretch gap-6">
        <StaggerItem className="flex">
          <Card className="flex flex-1 flex-col">
            <CardHeading icon="bed" title="숙소" />
            <div className="flex flex-col gap-5">
              <div className="flex gap-3">
                {HOUSING.map((h) => (
                  <div
                    key={h.value}
                    className="rounded-note bg-panel flex flex-1 flex-col items-center gap-1.5 p-[18px]"
                  >
                    <p className="text-ink-muted text-[18px] font-medium">{h.label}</p>
                    <p className="text-[28px] font-bold">
                      {reports.filter((r) => r.housing === h.value).length}건
                    </p>
                  </div>
                ))}
              </div>
              <HousingNote />
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem className="flex">
          <Card className="flex-1">
            <CardHeading icon="file" title="비자" />
            <AutoHeight>
              <Table
                columns={[
                  {
                    key: 'semester',
                    header: '학기',
                    width: 161,
                    render: (r) => <Semester report={r} compact />,
                  },
                  {
                    key: 'visa',
                    header: '소요 기간 · 종류',
                    render: (r) => <Raw value={r.visa} />,
                  },
                ]}
                rows={visa.shown}
                rowKey={(r) => r.reportId}
              />
            </AutoHeight>
            {visa.button}
          </Card>
        </StaggerItem>

        <StaggerItem className="flex">
          <Card className="flex-1">
            <CardHeading icon="shield" title="보험" />
            <AutoHeight>
              <Table
                columns={[
                  {
                    key: 'semester',
                    header: '학기',
                    width: 161,
                    render: (r) => <Semester report={r} compact />,
                  },
                  {
                    key: 'place',
                    header: '보험 구입처',
                    render: (r) => <Raw value={r.insurancePlace} />,
                  },
                ]}
                rows={insurance.shown}
                rowKey={(r) => r.reportId}
              />
            </AutoHeight>
            {insurance.button}
          </Card>
        </StaggerItem>
      </div>

      <StaggerItem>
        <Card>
          <CardHeading
            icon="sparkle"
            title="AI 요약"
            description="등록된 귀국보고서를 AI가 요약했어요"
            side={
              <span className="bg-panel text-ink-muted flex h-10 items-center gap-1.5 rounded-full px-3 text-[16px] font-medium">
                <Icon name="lock" size={17} />
                귀국보고서 원문은 게시하지 않아요
              </span>
            }
          />
          <AutoHeight>
            <div className="flex flex-col gap-5">
              {summary.shown.map((r) => (
                <div
                  key={r.reportId}
                  className="rounded-note bg-panel flex items-start gap-4 p-[18px]"
                >
                  <span className="flex shrink-0 flex-col items-start gap-1.5">
                    <Badge>{r.semester}학기</Badge>
                    {r.isSample && <SampleTag />}
                  </span>
                  <p className="text-ink-sub flex-1 text-[19px] leading-[1.6]">{r.summary}</p>
                </div>
              ))}
            </div>
          </AutoHeight>
          {summary.button}
        </Card>
      </StaggerItem>
    </Stagger>
  );
}

function HousingNote() {
  return (
    <div className="rounded-panel bg-accent-soft/60 text-accent-strong relative flex flex-1 flex-col items-center justify-center gap-3.5 overflow-hidden p-5">
      {/* 꾸미기: 점 패턴, 링 */}
      <span
        aria-hidden
        className="absolute top-3.5 right-5 h-14 w-[70px] bg-[radial-gradient(var(--color-accent)_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-30"
      />
      <span
        aria-hidden
        className="border-accent absolute -bottom-12 -left-9 size-[120px] rounded-full border-2 opacity-15"
      />
      <span className="relative flex size-14 items-center justify-center rounded-full bg-white">
        <Icon name="info" size={28} />
      </span>
      <p className="relative text-center text-[18px]">학기 구분 없이 유형별 건수로 표시해요.</p>
    </div>
  );
}

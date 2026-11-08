import Button from '@/shared/ui/Button';
import Checkbox from '@/shared/ui/Checkbox';

export const MAX_REPORT_LENGTH = 20000;

export default function ReportPaste({
  text,
  onText,
  checked,
  onChecked,
  extracting,
  canExtract,
  onExtract,
  onManual,
}: {
  text: string;
  onText: (v: string) => void;
  checked: boolean;
  onChecked: (v: boolean) => void;
  extracting: boolean;
  canExtract: boolean;
  onExtract: () => void;
  onManual: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <textarea
        value={text}
        maxLength={MAX_REPORT_LENGTH}
        disabled={extracting}
        onChange={(e) => onText(e.target.value)}
        placeholder="여기에 본인의 귀국보고서 텍스트를 복사해 붙여넣어 주세요…"
        className="border-line bg-panel placeholder:text-ink-faint focus:border-primary h-[340px] w-full resize-none rounded-[16px] border p-5 text-[19px] leading-[1.6] outline-none disabled:opacity-60"
      />
      <div className="rounded-note bg-primary-soft/40 flex items-center gap-2.5 p-4">
        <Checkbox checked={checked} onChange={onChecked} disabled={extracting}>
          이름·학번·연락처 등 개인정보를 직접 지우고 붙여넣었음을 확인합니다.
        </Checkbox>
        <span className="text-ink-muted text-[16px]">(체크해야 항목 추출 가능)</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" icon="edit" onClick={onManual} disabled={extracting}>
          직접 입력으로 전환
        </Button>
        <div className="flex-1" />
        <Button icon="sparkle" onClick={onExtract} disabled={!canExtract || extracting}>
          {extracting ? '항목 추출 중…' : '항목 추출하기'}
        </Button>
      </div>
    </div>
  );
}

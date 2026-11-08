export default function StatBox({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-note bg-panel flex min-w-0 flex-1 flex-col gap-1 ${large ? 'px-5 py-3.5' : 'p-4'}`}
    >
      <p className="text-ink-muted text-[16px] font-medium">{label}</p>
      <p className={`font-bold ${large ? 'text-[26px]' : 'text-[18px]'}`}>{value}</p>
    </div>
  );
}

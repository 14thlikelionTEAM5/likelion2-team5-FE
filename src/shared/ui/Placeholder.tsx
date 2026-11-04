export default function Placeholder({
  title,
  owner,
  figma,
}: {
  title: string;
  owner: string;
  figma?: string;
}) {
  return (
    <div className="rounded-card border-line border border-dashed bg-white p-10">
      <p className="text-ink-muted text-sm">담당: {owner}</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      {figma && <p className="text-ink-muted mt-2 text-sm">피그마: {figma}</p>}
    </div>
  );
}

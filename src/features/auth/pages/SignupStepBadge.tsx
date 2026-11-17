export default function SignupStepBadge({ step }: { step: number }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#eef2f7] px-2.5 py-1.5 text-sm leading-5 font-semibold text-[#253357]">
      {step}/4
    </span>
  );
}

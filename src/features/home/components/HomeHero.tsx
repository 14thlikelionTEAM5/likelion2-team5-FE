import heroNavy from '@/assets/decor/hero-navy.svg';

export default function HomeHero({ semester, nickname }: { semester: string; nickname: string }) {
  return (
    <section
      className="h-60 overflow-hidden rounded-[28px] bg-cover bg-center px-14 pt-[52px]"
      style={{ backgroundImage: `url("${heroNavy}")` }}
    >
      <p className="text-[18px] font-semibold text-[#9fd3dc]">{semester} 교환학생 준비</p>
      <h1 className="mt-2.5 text-[44px] font-extrabold text-white">안녕하세요, {nickname} 님</h1>
      <p className="mt-3 text-[22px] font-medium text-[#cfe6ec]">
        지원 조건을 관리하고 나에게 맞는 협정교를 찾아보세요.
      </p>
    </section>
  );
}

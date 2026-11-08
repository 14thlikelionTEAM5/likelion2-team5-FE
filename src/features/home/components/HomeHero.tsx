import heroNavy from '@/assets/decor/hero-navy.svg';

export default function HomeHero({ semester, nickname }: { semester: string; nickname: string }) {
  return (
    <section
      className="overflow-hidden rounded-[28px] bg-cover bg-center px-6 py-8 sm:px-10 sm:py-10 lg:h-60 lg:px-14 lg:pt-[52px] lg:pb-0"
      style={{ backgroundImage: `url("${heroNavy}")` }}
    >
      <p className="text-[16px] font-semibold text-[#9fd3dc] sm:text-[18px]">
        {semester} 교환학생 준비
      </p>
      <h1 className="mt-2.5 text-[30px] leading-tight font-extrabold text-white sm:text-[44px]">
        안녕하세요, {nickname} 님
      </h1>
      <p className="mt-3 text-[17px] font-medium text-[#cfe6ec] sm:text-[22px]">
        지원 조건을 관리하고 나에게 맞는 협정교를 찾아보세요.
      </p>
    </section>
  );
}

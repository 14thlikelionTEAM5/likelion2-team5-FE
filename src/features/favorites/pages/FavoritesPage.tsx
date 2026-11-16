
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { PATHS } from '@/app/paths';
import { useBookmarks, useRemoveBookmark } from '@/shared/api/bookmarks';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import EmptyState from '@/shared/ui/EmptyState';
import Input from '@/shared/ui/Input';
import Select from '@/shared/ui/Select';

import heroLight from '@/assets/decor/hero-light.svg';

export default function FavoritesPage() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useBookmarks();
  const { mutate: removeBookmark, isPending: isRemoving, variables: removingId, error: removeError } = useRemoveBookmark();
  const favorites = data?.universities ?? [];

  const [country, setCountry] = useState('');
  const [keyword, setKeyword] = useState('');

  // 국가 필터 옵션
  const countryOptions = useMemo(() => {
    const countries = [
      ...new Set(favorites.map((school) => school.country)),
    ];

    return [
      { value: '', label: '국가 전체' },
      ...countries.map((name) => ({
        value: name,
        label: name,
      })),
    ];
  }, [favorites]);

  // 검색 및 국가 필터
  const filteredFavorites = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return favorites.filter((school) => {
      const matchesCountry =
        !country || school.country === country;

      const matchesKeyword =
        !search ||
        school.name.toLowerCase().includes(search);

      return matchesCountry && matchesKeyword;
    });
  }, [favorites, country, keyword]);

  // 카드 클릭 → 해당 학교의 상세 페이지 이동
  const handleGoToSchool = (universityId: number) => {
    navigate(PATHS.schoolDetail(universityId));
  };

  const handleGoToSchoolList = () => {
    navigate(PATHS.schools);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-9">
      {/* 상단 배너 */}
      <section
        className="relative flex min-h-[212px] flex-col justify-center
                   overflow-hidden rounded-card bg-primary-soft
                   bg-cover bg-center px-6 py-8 sm:px-11"
        style={{
          backgroundImage: `url("${heroLight}")`,
        }}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <p className="text-ink-sub text-sm font-semibold">
            협정교
          </p>

          <h1 className="text-primary text-[30px] font-bold sm:text-[34px]">
            내 찜 목록
          </h1>

          <p className="text-ink-sub text-base sm:text-lg">
            관심 있는 협정교를 저장하고 비교해보세요.
          </p>
        </div>
      </section>

      {/* 찜 목록 */}
      <Card className="flex min-h-[819px] flex-col gap-6 !rounded-[24px] !px-5 !py-6 sm:!px-[43px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-primary text-[32px] font-semibold sm:text-[38px]">
            찜페이지
          </h2>

          {import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true' && (
            <p className="text-caution text-sm" role="status">
              개발용 임시 데이터 표시 중 · 실제 찜 목록이 아닙니다.
            </p>
          )}

          <p className="text-ink-muted text-lg font-semibold sm:text-[21px]">
            찜한 학교{' '}
            <span className="text-accent">
              {favorites.length}개
            </span>
          </p>
        </div>

        {removeError && (
          <p role="alert" className="text-danger text-sm">
            찜 해제에 실패했습니다. {removeError.message}
          </p>
        )}

        {isLoading ? (
          <p className="text-ink-muted py-8">찜 목록을 불러오는 중...</p>
        ) : error ? (
          <p role="alert" className="text-danger py-8">
            찜 목록을 불러오지 못했습니다. {error.message}
          </p>
        ) : favorites.length > 0 ? (
          <>
            {/* 국가 필터 및 검색 */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                icon="globe"
                className="w-full sm:w-[280px]"
                value={country}
                onChange={setCountry}
                options={countryOptions}
              />

              <Input
                icon="search"
                className="w-full sm:flex-1"
                placeholder="학교 이름 검색..."
                value={keyword}
                onChange={(event) =>
                  setKeyword(event.target.value)
                }
              />
            </div>

            {/* 학교 카드 */}
            {filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2 2xl:grid-cols-3">
                {filteredFavorites.map((school) => (
                  <article
                    key={school.universityId}
                    role="link"
                    tabIndex={0}
                    aria-label={`${school.name} 상세 페이지로 이동`}
                    onClick={() =>
                      handleGoToSchool(school.universityId)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        (event.key === 'Enter' ||
                          event.key === ' ')
                      ) {
                        event.preventDefault();

                        handleGoToSchool(
                          school.universityId,
                        );
                      }
                    }}
                    className="border-line flex min-h-[270px] min-w-0
                               cursor-pointer flex-col gap-[13px]
                               rounded-card border bg-white
                               px-[22px] py-[22px] transition-shadow
                               hover:shadow-card
                               focus-visible:outline-2
                               focus-visible:outline-primary"
                  >
                    {/* 학교명 및 찜 버튼 */}
                    <div className="flex min-h-[62px] items-start justify-between gap-3">
                      <h3 className="text-ink min-w-0 flex-1 break-words text-[23px] font-bold">
                        {school.name}
                      </h3>

                      <button
                        type="button"
                        aria-label={`${school.name} 찜 해제`}
                        title="찜 해제"
                        disabled={isRemoving}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeBookmark(school.universityId);
                        }}
                        className="text-accent hover:bg-accent-soft
                                   flex size-10 shrink-0 items-center
                                   justify-center rounded-control
                                   text-[29px] transition-colors"
                      >
                        <span aria-hidden="true">{isRemoving && removingId === school.universityId ? '…' : '★'}</span>
                      </button>
                    </div>

                    {/* 국가 및 모집 인원 */}
                    <p className="text-ink-muted text-[19px] font-medium">
                      {school.country} · 모집 인원{' '}
                      {school.quota === null ? '미정' : `${school.quota}명`}
                    </p>

                    {/* 주요 지원 조건 */}
                    <p className="text-ink-sub text-[18px] leading-relaxed">
                      주요 조건{' '}
                      {school.minGpa === null ? '학점 기준 미확인' : `학점 ${school.minGpa} 이상`}
                      {school.languageRequirements?.length
                        ? ` · ${school.languageRequirements.map((requirement) => `${requirement.testType} ${requirement.minScore}`).join(' / ')}`
                        : ''}
                    </p>

                    {/* 지원 자격 */}
                    <div>
                      {school.eligibility.status === 'ELIGIBLE' && (
                        <Badge tone="accent">
                          지원 가능
                        </Badge>
                      )}

                      {school.eligibility.status === 'NOT_ELIGIBLE' && (
                        <Badge tone="danger">
                          지원 불가
                        </Badge>
                      )}

                      {school.eligibility.status === 'NEEDS_CHECK' && (
                        <Badge tone="caution">
                          확인 필요
                        </Badge>
                      )}
                    </div>

                    {/* 지원 불가 사유 */}
                    {school.eligibility.status === 'NOT_ELIGIBLE' &&
                      school.eligibility.message && (
                        <div className="bg-panel rounded-small px-3 py-2">
                          <p className="text-danger text-base">
                            사유: {school.eligibility.message}
                          </p>
                        </div>
                      )}
                  </article>
                ))}
              </div>
            ) : (
              /* 검색 결과 없음 */
              <div className="bg-panel rounded-panel flex min-h-[300px] flex-col items-center justify-center gap-4 p-6 text-center">
                <h3 className="text-ink text-2xl font-semibold">
                  검색 결과가 없습니다
                </h3>

                <p className="text-ink-muted">
                  검색어나 국가를 변경해 보세요.
                </p>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setCountry('');
                    setKeyword('');
                  }}
                >
                  검색 초기화
                </Button>
              </div>
            )}
          </>
        ) : (
          /* 찜 목록이 비어 있는 경우 */
          <EmptyState
            className="min-h-[641px] !rounded-[18px] border border-line"
            title="아직 찜한 학교가 없습니다"
            description={
              <span>
                협정교 목록에서 관심 있는 학교의 별 아이콘을
                눌러 찜해 보세요.
                <br />
                찜한 학교는 이곳에서 모아볼 수 있습니다.
              </span>
            }
            action={
              <Button
                size="md"
                onClick={handleGoToSchoolList}
                className="mt-4"
              >
                협정교 목록으로 이동
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}

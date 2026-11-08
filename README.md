# PassHUFS Frontend

한국외대 교환학생 지원 조건 확인 서비스 프론트엔드

## 기술 스택

| 이름                  | 용도                     |
| --------------------- | ------------------------ |
| React 19 + TypeScript | 화면                     |
| Vite 6                | 개발 서버, 빌드          |
| Tailwind CSS v4       | 스타일                   |
| React Router 7        | 페이지 이동              |
| TanStack Query 5      | 서버 데이터 요청·캐시    |
| Motion                | 애니메이션               |
| Prettier              | 코드 정렬 (저장 시 자동) |
| Pretendard            | 폰트                     |
| Vercel                | 배포                     |

## 시작하기

```bash
npm install
npm run dev   # http://localhost:5173
```

- VS Code 사용 시: 추천 확장(Prettier, Tailwind CSS IntelliSense) 설치
- 루트에 `.env` 생성 (`.env.example` 참고, 커밋 금지)
  - `VITE_API_BASE_URL`: BE 주소
  - `VITE_SKIP_AUTH=true`: 로그인 없이 모든 페이지 확인 (개발 서버에서만 동작)
  - `VITE_DEV_LOGIN_EMAIL`, `VITE_DEV_LOGIN_PASSWORD`: 개발용 임시 계정. 둘 다 있으면 이 값으로 로그인 가능 (배포 페이지 확인용, 화면 코드에 그대로 드러나므로 진짜 비밀번호 금지)

---

## 담당

| 폴더                                                                                       | 담당 | 내용                                    |
| ------------------------------------------------------------------------------------------ | ---- | --------------------------------------- |
| `src/app` `src/layouts` `src/styles` `src/shared/ui` `src/shared/hooks` `src/shared/types` | 윤지 | 라우터, 사이드바, 공용 UI, 색·폰트      |
| `src/shared/api/client.ts` `token.ts`                                                      | 윤지 | 공통 요청 함수, 로그인 토큰             |
| `src/features/home` `schools` `experience`                                                 | 윤지 | 메인 홈, 협정교 목록·상세, 경험 등록    |
| `src/shared/api/universities.ts` `experiences.ts` `agreements.ts`                          | 윤지 |                                         |
| `src/features/favorites` `plans` `mypage`                                                  | 동균 | 찜 목록, 수강계획 목록·편집, 마이페이지 |
| `src/shared/api/bookmarks.ts` `studyPlans.ts` `users.ts`                                   | 동균 |                                         |
| `src/features/auth`                                                                        | 재우 | 랜딩, 로그인, 회원가입                  |
| `src/shared/api/auth.ts`                                                                   | 재우 |                                         |

## 규칙

1. **담당 파일만 수정함.** 라우터, 레이아웃, 공용 UI가 필요하면 요청
2. **모든 PR은 프론트 팀장 승인이 있어야 머지됨.**
3. 서버 요청은 `src/shared/api/`의 함수로만 함. 다른 사람의 `features/` 폴더를 직접 import하지 않음
4. 경로는 `PATHS`(`src/app/paths.ts`)로 씀. `'/home'`처럼 문자열로 직접 쓰지 않음
5. 색, 모서리, 그림자는 아래 [디자인 토큰](#디자인-토큰)을 씀. 색 코드(`#003a6c`)를 직접 쓰지 않음
6. 팝업은 라우트를 만들지 않고 `shared/ui/Modal`을 씀
7. 페이지가 커지면 같은 기능 폴더 안에 `components/` 폴더를 만들어 나눔
8. 데이터 이름과 선택지 값은 **BE 명세 그대로** 씀 (`majorType: 'PRIMARY'`). 화면에 보일 한글은 `shared/types/enums.ts`의 `LABEL`에서 꺼냄

---

## 폴더 구조

```
src/
  app/            router, paths(경로 모음), queryClient(TanStack Query 설정)
  layouts/        AuthLayout(랜딩·로그인·회원가입), AppLayout(사이드바, 로그인 필수), Sidebar
  styles/         디자인 토큰, 폰트
  shared/
    api/          서버 요청 함수 (자원별 파일)
    hooks/        공용 훅 (useLeaveConfirm: 작성 중 나가기 확인)
    types/        여러 곳에서 쓰는 선택지(Enum)
    ui/           공용 UI (아래 표 참고)
assets/
  decor/        로고, 배너, 배경 등 꾸미기 이미지
  features/
    auth/ home/ schools/ experience/ favorites/ plans/ mypage/
      pages/      페이지 컴포넌트
      components/ (필요하면 생성) 해당 기능에서만 쓰는 컴포넌트
```

## 라우트

랜딩·로그인·회원가입을 제외한 모든 페이지는 **로그인 필수**. 로그인하지 않은 상태로 접근하면 로그인 화면으로 이동하고, 로그인 후 원래 페이지로 돌아감

| 경로                                                          | 페이지                                | 담당 |
| ------------------------------------------------------------- | ------------------------------------- | ---- |
| `/`                                                           | 랜딩                                  | 재우 |
| `/login`                                                      | 로그인                                | 재우 |
| `/signup`                                                     | 회원가입 (단계는 페이지 안에서 전환)  | 재우 |
| `/home`                                                       | 메인 홈                               | 윤지 |
| `/schools`                                                    | 협정교 목록                           | 윤지 |
| `/schools/:universityId?tab=official\|spec\|courses\|reports` | 학교 상세                             | 윤지 |
| `/schools/favorites`                                          | 찜 목록                               | 동균 |
| `/experience/new?type=report\|spec\|credit`                   | 경험 등록 (단계는 페이지 안에서 전환) | 윤지 |
| `/experience/mine`                                            | 내 등록 내역                          | 윤지 |
| `/experience/edit/:kind/:id`                                  | 경험 수정                             | 윤지 |
| `/plans`                                                      | 수강계획 목록                         | 동균 |
| `/plans/:planId/edit`                                         | 수강계획 편집                         | 동균 |
| `/mypage`                                                     | 마이페이지                            | 동균 |

---

## 디자인 토큰

`src/styles/index.css`에 정의되어 있음. Tailwind 클래스로 사용 (`bg-primary`, `text-ink-muted`, `rounded-card`, `shadow-card`)

| 토큰                                   | 값                            | 용도                                  |
| -------------------------------------- | ----------------------------- | ------------------------------------- |
| `primary` / `primary-soft`             | `#003a6c` `#e1e8f0`           | 주요 버튼, 사이드바 선택 / 연한 배경  |
| `accent` / `accent-strong`             | `#008ba3` `#006a7d`           | 로고, 진행 막대 / 진한 글자           |
| `accent-soft`                          | `#ddeff2`                     | 아이콘 배경, "가능" 배지              |
| `ink` / `ink-sub` / `ink-muted`        | `#1b2430` `#4a5563` `#7a8594` | 제목·본문 / 보조 글자 / 흐린 글자     |
| `ink-faint`                            | `#9aa4b2`                     | 입력창 안내 문구(placeholder)         |
| `line` / `line-soft`                   | `#dce3eb` `#e3e8ef`           | 테두리                                |
| `page` / `panel`                       | `#f3f5f8` `#f7f9fb`           | 페이지 배경 / 카드 안쪽 칸 배경       |
| `fill`                                 | `#eef1f5`                     | 세그먼트 바탕, 잠긴 입력창, 표 구분선 |
| `table-head`                           | `#f5f7fa`                     | 표 머리 배경                          |
| `danger` / `danger-soft`               | `#8e5656` `#f5eded`           | "불가" 글자 / 배경                    |
| `caution` / `caution-soft`             | `#7d6a44` `#f4f0e7`           | "확인 필요" 글자 / 배경               |
| `rounded-card` / `-panel` / `-control` | 20 / 16 / 12px                | 카드 / 안쪽 칸 / 버튼·입력창          |
| `rounded-note` / `-small`              | 14 / 10px                     | 안내 박스 / 작은 버튼·표 머리         |
| `shadow-card` / `shadow-thumb`         |                               | 카드 그림자 / 세그먼트·토글 손잡이    |

필요한 토큰이 없으면 프론트 팀장에게 요청

---

## 공용 UI (`src/shared/ui`)

| 컴포넌트     | 쓰는 곳                             | 주요 props                                                              |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| `Card`       | 흰 카드                             | `title` `description` `action` (있으면 머리 표시)                       |
| `Panel`      | 카드 안쪽 회색 칸                   |                                                                         |
| `Button`     | 버튼                                | `variant`: primary·secondary·subtle, `size`: md·sm·xs, `icon`           |
| `Input`      | 입력창                              | `size`: md·sm, `icon`(왼쪽), `unit`(오른쪽, 예: "원"), `disabled`(잠금) |
| `Select`     | 드롭다운                            | `options`, `placeholder`, `size`, `icon`                                |
| `Chip`       | 선택형 칩 (어학시험 종류)           | `selected`                                                              |
| `Toggle`     | 켜고 끄기 (지원 가능한 학교만 보기) | `checked` `onChange` `label`                                            |
| `Tabs`       | 밑줄 탭 (학교 상세)                 | `items` `value` `onChange`                                              |
| `Segment`    | 합격 / 탈락 / 전체                  | `items` `value` `onChange`                                              |
| `InfoNote`   | info 아이콘 + 안내 박스             | `tone`: gray·primary                                                    |
| `EmptyState` | 빈 화면                             | `title` `description` `action`                                          |
| `Table`      | 표                                  | `columns`(`key` `header` `width` `render`) `rows` `rowKey`              |
| `Badge`      | 상태 배지                           | `tone`: accent·primary·danger·caution·neutral·white                     |
| `Modal`      | 팝업                                | `open` `onClose`                                                        |
| `Icon`       | 아이콘 (글자색을 따라감)            | `name` `size`                                                           |

---

## API 사용법

### 서버 요청 함수 만들기 (`src/shared/api/*.ts`)

각 파일 맨 위 `TODO`에 담당 API 목록이 있음. 구현한 항목은 목록에서 삭제. 메서드·요청·응답은 Swagger 기준

`api()` 함수가 처리하는 것:

- 서버 주소와 `/api/v1`을 앞에 붙임 → 명세의 경로만 쓰면 됨
- 로그인 토큰을 헤더에 붙임
- 응답 `{ code, message, data, ... }`에서 **`data`만** 돌려줌
- 실패하면 `ApiError`(`status`, `code`, `message`)를 던짐
- 401(로그인 만료)이면 로그인 화면으로 보냄

```ts
// src/shared/api/users.ts
import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export type Me = { userId: number; nickname: string /* ...Swagger 기준 */ };

// 1. 요청 함수
export const getMe = () => api<Me>('/users/me');

// 2. 화면에서 쓸 훅 (조회)
export const useMe = () => useQuery({ queryKey: ['me'], queryFn: getMe });
```

### 화면에서 쓰기

**조회 (GET) → `useQuery`**

```tsx
const { data: me, isLoading, error } = useMe();

if (isLoading) return <p>불러오는 중…</p>;
if (error) return <p>{error.message}</p>;
return <p>{me?.nickname}</p>;
```

**저장·수정·삭제 (POST / PATCH / DELETE) → `useMutation`**

```ts
// shared/api/bookmarks.ts
export const addBookmark = (universityId: number) =>
  api('/bookmarks', { method: 'POST', body: { universityId } });

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addBookmark,
    // 성공하면 찜 목록을 다시 불러옴
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });
};
```

```tsx
// 화면
const { mutate: add, isPending } = useAddBookmark();
<button onClick={() => add(universityId)} disabled={isPending}>
  찜하기
</button>;
```

**queryKey 규칙**: `['자원 이름', ...조건]`

- `['me']`, `['bookmarks']`, `['universities', { country, keyword }]`, `['universities', universityId]`

### 로그인 토큰

- `localStorage`를 직접 쓰지 않고 `shared/api/token.ts`의 함수를 씀
- 로그인은 `useLogin()`(`shared/api/auth.ts`) 사용

### BE 서버가 없을 때

- `.env`에 `VITE_SKIP_AUTH=true`를 넣으면 로그인 없이 모든 페이지 접근 가능
- 화면은 페이지 안에 임시 데이터를 두고 먼저 만듦. 서버가 열리면 `useQuery`로 교체

---

## 작성 중 나가기 막기

입력 도중 다른 메뉴로 이동하거나 새로고침하면 확인 팝업을 띄움. 사용 예시는 `features/experience/pages/ExperienceNewPage.tsx` 참고

```tsx
const blocker = useLeaveConfirm(입력중인지);
// blocker.state === 'blocked'이면 팝업, 나가기 = blocker.proceed(), 계속 = blocker.reset()
```

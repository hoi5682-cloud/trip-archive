# 여행 아카이브

부부의 여행을 계획하고, 다니고, 기록하는 정적 사이트. Astro + Markdown 콘텐츠 컬렉션으로 구성됨.

## 새 여행 추가하기

`src/content/trips/`에 마크다운 파일을 하나 추가한다. 파일명이 URL(`/trips/파일명/`)이 된다.

```markdown
---
title: 여행 이름
destination: 목적지
status: upcoming # upcoming(확정) | candidate(후보) | done(다녀옴)
summary: 한 줄 요약
emoji: 🗼
cover: 파일명.svg # 선택. public/covers/에 넣어둔 일러스트 파일명만 적기
tags: [태그1, 태그2]
flight: # 선택. 정해지면 상세 페이지 상단에 카드로 표시됨
  title: ICN → SYD
  detail: QF122 · 직항 9시간대
  link: https://... # 예약 확인 링크 (선택)
lodging: # 선택. 위와 동일한 형태
  title: 숙소 이름
  detail: 위치·특이사항
  link: https://...
photos: # 선택. status: done으로 바꾼 뒤 채우면 상세 페이지 상단에 갤러리로 표시됨
  - src: 파일명.jpg
    caption: 한 줄 설명 (선택)
sheet: # 선택. 여행 중 실시간 대시보드용 — 아래 "여행 중 실시간 대시보드" 참고
  itinerary: https://docs.google.com/.../pub?output=csv
  budget: https://docs.google.com/.../pub?output=csv
  checklist: https://docs.google.com/.../pub?output=csv
---

## 동선 / 일정

### Day 1
### Day 2

## 가볼곳 후보

<ul class="candidates">
<li>장소명</li>
</ul>

## 먹을곳 후보

<ul class="candidates">
<li>식당명</li>
</ul>

## 예산
## 메모
## 후기
```

`startDate`, `endDate`(YYYY-MM-DD), `budget`은 선택 항목.

- `동선 / 일정`: Day별로 `### Day 1`, `### Day 2` 소제목을 쓰면 상세 페이지에서 번호 타임라인으로 표시됨
- `가볼곳 후보` / `먹을곳 후보`: 위 예시처럼 `<ul class="candidates">`로 감싸서 쓰면 태그 카드 그리드로 표시됨 (일반 `- 항목` 불릿 리스트는 그냥 리스트로 남음 — 마크다운은 텍스트만으로 "이 리스트가 뭔지" 구분할 수 없어서 명시적으로 표시가 필요함). 동선에 반영했으면 항목 옆에 `(동선 반영)`이라고 적어두면 구분하기 쉬움
- `예산` 표: 마지막 행을 "합계"로 채워두면 굵게 강조되어 표시됨
- `flight` / `lodging`: 아직 정해지지 않았으면 통째로 생략하면 됨 (카드가 아예 안 뜸). 확정 전까지는 `## 메모`에 자유 텍스트로 적어둬도 무방
- `photos`: 실제 이미지 파일은 `public/photos/[여행-파일명]/`에 넣고, frontmatter의 `src`에는 파일명만 적기 (예: `sydney/harbour.jpg`가 아니라 `harbour.jpg`)
- `후기`: `status: done`으로 바꾼 뒤 사진은 `photos` frontmatter로, 글은 `## 후기` 섹션에 자유롭게
- `cover`: 카드/상세 페이지 상단에 쓰이는 여행지 일러스트. 실제 사진 대신 목적지를 상징하는 SVG를 `public/covers/`에 넣고 파일명만 적어두면 됨 (예: 시드니는 `sydney.svg` — 오페라하우스·하버브릿지 일러스트). 지정 안 하면 이모지+그라디언트로 대체

## 여행 중 실시간 대시보드 (Google Sheets 연동)

사이트는 완전 정적이라 브라우저에서 직접 값을 입력·저장할 수 없다. 그래서 "여행 중 예산 실사용 입력"과 "체크리스트 실시간 체크"는 Google Sheets에서 직접 하고, 사이트는 그 시트를 읽기 전용으로 가져와 보여주기만 한다.

**1. 트립 1개당 스프레드시트 1개**를 만들고, 그 안에 탭 3개를 만든다.

| 탭 이름 | 열 (첫 행에 그대로 입력) | 용도 |
|---|---|---|
| 동선 | `날짜`, `시간`, `제목`, `장소`, `메모`, `지도링크` | `날짜`는 반드시 `YYYY-MM-DD` 형식 |
| 예산 | `항목`, `예산`, `실사용`, `메모` | 기존 마크다운 `## 예산` 표와 같은 구성 |
| 체크리스트 | `구분`, `항목`, `완료`, `메모` | `완료` 열은 셀 서식에서 "체크박스"로 지정 |

**2. 탭마다 "웹에 게시"로 CSV 링크 발급** (파일 > 공유 > 웹에 게시 → 문서 전체가 아니라 **개별 시트** 선택 → 형식 "쉼표로 구분된 값(.csv)" → 게시). 탭 3개니까 이 과정을 3번 반복해서 URL 3개를 받는다.

> "웹에 게시"는 스프레드시트의 **편집 권한과 무관한 별도 설정**이다. 원본 시트는 계속 본인+동행자만 편집 가능한 상태로 두고, 게시된 CSV 스냅샷만 익명 공개할 수 있다. 이 사이트는 공개 상태이므로 게시 CSV가 외부에 노출되는 것 자체는 감수하되, 원본 편집 권한은 유지한다.

**3. 발급받은 3개 URL을 그대로 frontmatter `sheet` 필드에 붙여넣는다** (위 "새 여행 추가하기" 예시 참고). 3개 중 일부만 채워도 되고, 아예 없어도 된다 — 없으면 대시보드 자체가 표시되지 않는다.

**여행 중에는** 각자 휴대폰의 Google Sheets 앱으로 직접 시트를 열어 예산 실사용을 적고 체크리스트를 체크한다. 사이트 상세 페이지는 새로고침할 때마다 그 값을 다시 읽어와 "오늘/다음 일정", "예산 요약", "전체 동선"/"체크리스트 진행률"을 보여준다.

**여행이 끝나서 `status: done`으로 바꿀 때**: 시트의 최종 숫자를 마크다운 `## 예산` 표와 `budget` frontmatter에 옮겨 적어 그 여행의 최종 기록으로 남긴다. 이후 `sheet` 필드는 지워도 되고 남겨둬도 무방(코드가 강제하지 않음).

## 체크리스트 추가하기

`src/content/checklists/`에 마크다운 파일을 추가하고, `trip` 필드에 연결할 여행의 파일명(확장자 제외)을 적는다.

```markdown
---
title: 체크리스트 이름
trip: 여행-파일명
summary: 설명 (선택)
---

- [ ] 할 일
```

## 로컬 개발

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/ 로 빌드, 배포 전 확인용
```

## 수정 & 배포 흐름

1. 마크다운 파일 수정 (직접 또는 Claude Code에 요청)
2. `git add` → `git commit` → `git push`
3. `main` 브랜치에 push되면 GitHub Actions가 자동으로 GitHub Pages에 배포 (`.github/workflows/deploy.yml`)

GitHub 저장소 설정에서 **Settings → Pages → Source: GitHub Actions**로 설정되어 있어야 함 (최초 1회).

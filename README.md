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
---

## 항공 · 숙소
## 동선 / 일정
## 가볼곳 후보
## 먹을곳 후보
## 예산
## 메모
## 후기
```

`startDate`, `endDate`(YYYY-MM-DD), `budget`은 선택 항목.

- `가볼곳 후보` / `먹을곳 후보`: 계획 단계에서 담아두는 리스트. 동선에 반영했으면 항목 옆에 `(동선 반영)`이라고 적어두면 구분하기 쉬움
- `후기`: `status: done`으로 바꾼 뒤 사진과 글을 남기는 섹션. 사진은 `public/photos/[여행-파일명]/`에 넣고 `![설명](/trip-archive/photos/여행-파일명/파일명.jpg)`로 삽입 (BASE_URL이 `/trip-archive/`이므로 앞에 꼭 붙일 것)
- `cover`: 카드/상세 페이지 상단에 쓰이는 여행지 일러스트. 실제 사진 대신 목적지를 상징하는 SVG를 `public/covers/`에 넣고 파일명만 적어두면 됨 (예: 시드니는 `sydney.svg` — 오페라하우스·하버브릿지 일러스트). 지정 안 하면 이모지+그라디언트로 대체

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

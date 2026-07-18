# 여행 아카이브

부부의 여행을 계획하고, 다니고, 기록하는 정적 사이트. Astro + Markdown 콘텐츠 컬렉션으로 구성됨.

## 새 여행 추가하기

`src/content/trips/`에 마크다운 파일을 하나 추가한다. 파일명이 URL(`/trips/파일명/`)이 된다.

```markdown
---
title: 여행 이름
destination: 목적지
status: upcoming # upcoming(예정) | candidate(후보) | done(다녀옴)
summary: 한 줄 요약
emoji: 🗼
tags: [태그1, 태그2]
---

## 항공 · 숙소
## 동선 / 일정
## 예산
## 메모
```

`startDate`, `endDate`(YYYY-MM-DD), `budget`은 선택 항목.

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

---
name: create-pr
description: |
  GitHub PR(Pull Request)을 생성하는 스킬. commit 스킬과 짝을 이루며, 브랜치 작업 완료 후 PR을 자동으로 초안 작성하고 사용자 승인 후 생성한다.
  다음 상황에서 반드시 이 스킬을 사용한다:
  - "PR 만들어줘", "PR 생성", "PR 올려줘", "PR 열어줘" 요청
  - "풀리퀘스트", "pull request", "pr create" 언급
  - 브랜치 작업을 마무리하고 리뷰 요청하고 싶다고 할 때
---

# create-pr 스킬

브랜치의 커밋을 분석하여 PR 제목과 본문 초안을 작성하고, 사용자 승인 후 `gh pr create`로 PR을 생성한다.

## 사전 요구사항

- `gh` CLI 설치 및 `gh auth login` 완료
- 현재 브랜치가 `main` / `master`가 아닐 것
- 원격 저장소(remote) 연결되어 있을 것

---

## 절차

### 1단계: 사전 확인

```bash
git branch --show-current
git remote -v
git status --short
```

확인할 것:
- **현재 브랜치가 main/master이면 즉시 중단** — 기능 브랜치에서 실행해야 한다고 안내
- **remote가 없으면 중단** — `git remote add origin <url>` 설정을 먼저 안내
- **미커밋 변경사항이 있으면 경고** — commit 스킬로 먼저 커밋하도록 안내 (사용자가 무시하고 진행 원하면 허용)

### 2단계: 커밋 분석

베이스 브랜치를 자동 감지한다 (main → master → develop 순으로 존재하는 것 사용):

```bash
git log main..HEAD --oneline      # 포함될 커밋 목록
git diff main..HEAD --stat        # 변경 파일 개요
```

커밋 메시지들을 재료로 PR 내용을 구성한다.

### 3단계: PR 초안 작성

**제목 규칙:**
- 커밋들의 핵심 목적을 한 문장으로 요약 (50자 이내)
- 커밋이 하나면 그 메시지를 그대로 활용
- 여러 커밋이면 공통 주제를 추출

**본문 형식:**
```markdown
## 개요
(왜 이 변경이 필요한지 — 커밋 메시지의 why를 종합)

## 변경 사항
- (커밋별 주요 변경 요약)

## 테스트 방법
- (어떻게 확인할 수 있는지)
```

### 4단계: 사용자 승인

다음 형식으로 보여준다:

```
🔀 PR 제안

  제목: feat: 미리보기 반응형 뷰포트 전환 기능 추가
  브랜치: feature/responsive-preview → main
  커밋: 3개 (2f4e1f4, d538ef4, 8ec6fa2)

  ## 개요
  ...

  ## 변경 사항
  - ...

  ## 테스트 방법
  - ...

진행할까요? (수정 원하시면 말씀해주세요)
```

사용자가 "응", "ㅇㅇ", "진행해", "ok" 등으로 답하면 실행한다.
수정 요청이 있으면 해당 부분을 고친 뒤 재확인한다.

### 5단계: 실행

```bash
# 1. 브랜치가 remote에 없으면 먼저 push
git push -u origin <branch>

# 2. PR 생성
gh pr create --title "제목" --body "$(cat <<'EOF'
## 개요
...

## 변경 사항
...

## 테스트 방법
...
EOF
)"
```

생성된 PR URL을 보고한다.

---

## 주의사항

- `--draft` 옵션은 사용자가 "드래프트로" 또는 "임시로" 요청할 때만 사용
- `git push --force`는 절대 사용하지 않음
- PR 생성 후 추가 작업(리뷰어 지정, 라벨 등)은 사용자가 명시적으로 요청할 때만 수행
- `gh auth status`가 실패하면 `gh auth login` 안내 후 중단

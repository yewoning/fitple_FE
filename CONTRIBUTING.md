# 기여 및 GitHub 협업 규칙

Fitple의 모든 작업은 GitHub Issue를 기준으로 관리합니다. 작업을 시작하기 전에 Issue를 만들고, 해당 Issue에 연결된 브랜치와 Pull Request(PR)를 사용합니다.

## 1. 작업 Issue 만들기

새 작업을 시작하기 전 GitHub Issue를 생성합니다. Issue에는 다음 내용을 작성합니다.

- 작업의 목적과 배경
- 완료 조건
- 필요하다면 관련 화면, API, 디자인 또는 참고 링크

Issue가 합의된 작업 단위가 되며, 하나의 작업은 하나의 Issue로 추적합니다.

## 2. Issue 브랜치 만들기

최신 `main` 브랜치에서 Issue 번호에 해당하는 작업 브랜치를 생성합니다.

```powershell
git switch main
git pull origin main
git switch -c "feat/#3"
```

브랜치 이름은 항상 `feat/#<이슈번호>` 형식을 사용합니다.

- Issue `#3`의 브랜치: `feat/#3`
- Issue `#42`의 브랜치: `feat/#42`

`main` 브랜치에서 직접 작업하거나 직접 push하지 않습니다. 작업과 커밋은 반드시 해당 Issue 브랜치에서 진행합니다.

## 3. Pull Request 만들기

작업이 완료되면 `main`을 대상으로 PR을 생성합니다. 하나의 PR은 하나의 Issue만 해결해야 합니다.

PR 본문에는 다음 내용을 포함합니다.

- 변경 사항 요약
- 수행한 검증 결과
- Issue 자동 종료 키워드: `Closes #<이슈번호>`

예를 들어 Issue `#3`을 해결하는 PR 본문에는 `Closes #3`을 작성합니다. `main`에 병합되면 GitHub가 해당 Issue를 자동으로 닫습니다. 이를 위해 저장소의 **Auto-close issues with merged linked pull requests** 설정을 켜 둡니다.

## 4. 리뷰와 병합

- PR 작성자 외 팀원 최소 1명의 승인이 필요합니다.
- 승인 전에는 PR을 병합하지 않습니다.
- 병합은 squash merge를 사용합니다.
- 병합이 끝나면 원격 작업 브랜치를 삭제합니다.

이 규칙은 `main`에 반영되는 모든 변경에 적용합니다.

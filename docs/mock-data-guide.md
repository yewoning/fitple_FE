# API·목업 데이터 작업 가이드

이 문서는 백엔드 연결 전후에 같은 화면 코드를 유지하면서 데모와 실제 API 통합을 함께 진행하기 위한 팀 규칙입니다.

## 핵심 원칙

1. 화면은 API와 목업 중 무엇을 사용했는지 알지 않는다.
2. API와 목업 선택은 데이터 어댑터(`src/services`, 기존 `src/api`)에서만 처리한다.
3. 실제 API가 성공하면 목업 데이터로 덮어쓰지 않는다.
4. 네트워크 연결 실패와 5xx만 자동 폴백한다. 4xx 오류는 사용자에게 그대로 전달한다.
5. 생성자 여부는 환경변수 플래그가 아니라 `project.memberId === currentMemberId` 관계로 계산한다.
6. 목록·상세·생성 결과는 같은 프로젝트 ID와 데이터 원본을 사용한다.

## 환경변수

로컬 설정은 `.env.local`에 작성합니다.

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_DATA_MODE=api-first
EXPO_PUBLIC_DEMO_USER_ROLE=owner
```

환경변수를 변경한 뒤에는 Metro를 다시 시작해야 합니다.

```powershell
npm run start:clear
```

### EXPO_PUBLIC_DATA_MODE

| 값 | 동작 | 사용 시점 |
| --- | --- | --- |
| `api-first` | API를 먼저 호출하고 연결 실패 또는 5xx에서 목업 사용 | 기본 개발 |
| `mock-only` | API를 호출하지 않고 목업만 사용 | 발표·UI QA |
| `api-only` | 목업 폴백 없이 API 오류 노출 | 백엔드 통합 검증 |

발표 직전에는 `mock-only`를 사용합니다. 서버 주소가 응답하지 않을 때 발생하는 지연과 화면별 폴백 시점 차이를 제거할 수 있습니다.

### EXPO_PUBLIC_DEMO_USER_ROLE

| 값 | 현재 목업 사용자 | 기준 프로젝트에서의 역할 |
| --- | --- | --- |
| `owner` | memberId `1`, 민지 | 생성자 |
| `applicant` | memberId `2`, 서준 | 비생성자·지원자 |

`mock-only` 로그인에서는 입력한 계정 문자열이 아니라 이 환경변수가 목업 사용자를 결정합니다.

- `owner`: 프로젝트 상세의 수정·삭제 메뉴가 보이고 지원 버튼이 비활성화됩니다.
- `applicant`: 수정·삭제 메뉴가 없고 지원 버튼이 활성화됩니다.
- applicant 사용자도 새 프로젝트를 생성하면 그 프로젝트에서는 생성자가 됩니다.

환경변수를 화면에서 직접 읽거나 `isOwner = DEMO_USER_ROLE === 'owner'`처럼 분기하지 마세요. 역할은 항상 실제 데이터와 같은 방식으로 ID를 비교합니다.

## 구조

```text
src/
├─ config/demo.ts              데이터 모드와 데모 역할 파싱
├─ mocks/fixtures.ts           사용자·프로젝트·과제 초기 시나리오
├─ mocks/demo-store.ts         세션 동안 유지되는 목업 CRUD 상태
├─ services/demo-fallback.ts   API/목업 선택 정책
├─ services/*.ts               프로젝트·지원·인증 API와 목업 반환 연결
└─ api/*.ts                    채팅·마이페이지의 기존 API 어댑터
```

데이터 흐름은 다음과 같습니다.

```text
화면 → 데이터 어댑터 → withDemoFallback → 실제 API 또는 목업 데이터
```

화면 컴포넌트에서 `.catch(() => MOCK_DATA)`를 새로 추가하지 않습니다. 이렇게 하면 조회는 목업인데 생성·수정은 실패하는 불완전한 플로우가 생깁니다.

## 새 API 작업 방법

데이터 어댑터 함수의 실제 API 반환 타입과 목업 반환 타입을 동일하게 맞춥니다.

```ts
export function getSomething(id: number) {
  return withDemoFallback(
    () => requestRaw<Something>(`/api/something/${id}`),
    () => demoStore.getState().getSomething(id),
  );
}
```

작업 순서:

1. `src/types`에 백엔드 계약 타입을 정의합니다.
2. `src/mocks/fixtures.ts`에 필요한 초기 시나리오를 추가합니다.
3. 상태 변경이 필요하면 `src/mocks/demo-store.ts`에 동작을 추가합니다.
4. 해당 도메인의 `src/services` 또는 `src/api` 함수에서 `withDemoFallback()`으로 API와 목업을 연결합니다.
5. 화면은 데이터 어댑터만 호출하고 목업 파일을 직접 import하지 않습니다.
6. `api-first`, `mock-only`, `api-only`에서 각각 의도한 동작을 확인합니다.

## 폴백 판정 규칙

`withDemoFallback()`은 다음 경우에만 목업을 사용합니다.

- API 서버에 연결할 수 없어 `ApiError.status`가 없는 경우
- HTTP 상태가 500 이상인 경우

다음 오류는 목업 성공으로 바꾸지 않습니다.

- `400`: 요청 값 오류
- `401`: 로그인 필요
- `403`: 권한 없음
- `404`: 잘못된 리소스 또는 아직 연결되지 않은 계약

백엔드 엔드포인트가 아직 구현되지 않아 404가 발생하지만 데모가 필요하다면 `api-first`의 의미를 바꾸지 말고 발표 환경을 `mock-only`로 설정합니다.

## 목업 상태 범위

현재 목업 저장소는 다음 플로우를 앱 세션 동안 유지합니다.

- 로그인·회원가입과 현재 목업 사용자
- 프로필 조회·생성·수정·파일 첨부
- 모집·추천·내 프로젝트 조회
- 프로젝트 상세·생성·수정·삭제
- 프로젝트 이미지·AI 소개 생성
- 스크랩·지원서·지원용 AI 소개 생성

앱 또는 Metro를 다시 시작하면 초기 fixture로 돌아갑니다. 발표 목적에는 세션 상태면 충분하므로 AsyncStorage나 별도 목업 서버는 사용하지 않습니다.

## fixture 작성 규칙

- 프로젝트 ID는 숫자로 통일하고 목록·상세·라우트에서 같은 값을 사용합니다.
- 날짜와 상태는 카드, 상세, 내 프로젝트 응답에서 서로 모순되지 않게 유지합니다.
- 기준 프로젝트 하나는 owner가 소유하고 applicant가 지원할 수 있는 `RECRUITING` 상태로 유지합니다.
- applicant가 이미 참여한 진행 프로젝트도 하나 이상 유지해 홈의 내 프로젝트 영역을 검증합니다.
- 화면 전용 표현 데이터는 서비스 반환 타입으로 변환하는 기존 mapper를 재사용합니다.
- 실제 사용자 데이터처럼 보이는 민감정보를 fixture에 추가하지 않습니다.

## 검증 체크리스트

코드 변경 후 다음 명령을 실행합니다.

```powershell
npm run typecheck
npm run lint
```

발표 플로우 수동 확인:

1. `mock-only + owner`: 로그인 → 홈 → 소유 프로젝트 상세 → 수정 → 공유 → 삭제
2. `mock-only + applicant`: 로그인 → 모집 목록 → 상세 → 스크랩 → 지원서 작성 → 제출
3. `mock-only + applicant`: 프로젝트 생성 → 완료 화면 → 신규 상세에서 생성자 UI 확인
4. `api-first + 서버 종료`: 연결 실패 후 동일 플로우가 목업으로 이어지는지 확인
5. `api-only`: 백엔드 오류가 목업으로 가려지지 않는지 확인

## 알려진 경계

- 실제 로그인 API가 `memberId`를 반환하지 않으면 실제 API 성공 뒤 프로젝트별 회원 기능을 실행할 수 없습니다. 백엔드 계약 확정 후 `SigninResponse.memberId`를 연결해야 합니다.
- `api-first`에서 일부 API만 성공하면 실제 데이터와 목업 데이터가 화면별로 섞일 수 있습니다. 발표는 반드시 `mock-only`를 사용합니다.
- 목업 저장소는 범용 백엔드가 아니라 기획 플로우 시연용입니다. 페이지네이션·동시성·영구 저장 동작은 구현하지 않습니다.
- 채팅·마이페이지의 기존 fixture는 아직 `src/api/mockData.ts`에 있습니다. 새 프로젝트 도메인 fixture는 `src/mocks`에 추가하고, 기존 파일을 건드릴 때에는 도메인 단위로 이동합니다.

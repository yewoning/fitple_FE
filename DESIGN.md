# Design

## Source of truth
- Status: Draft
- Last refreshed: 2026-08-17
- Primary product surfaces: 시작, 인증, 메인, 회원가입 후 프로필 설정
- Evidence reviewed: `profile1.png`, `profile2.png`, `profile3.png`, `src/components/signup-screen.tsx`, `src/components/layout`, `global.css`, `tailwind.config.js`, `api.json`

## Brand
- Personality: 친근하고 명확하게 협업 준비를 돕는 AI 서비스
- Trust signals: 현재 처리 상태와 사용할 수 있는 행동을 즉시 보여주는 피드백
- Avoid: 실제 업로드나 AI 처리가 일어난 것처럼 오인시키는 표현, 색상에만 의존하는 상태 전달

## Product goals
- Goals: 신규 사용자가 프로젝트 경험을 직접 작성하거나 자료를 제공하는 프로필 설정 흐름을 이해하고 사용할 수 있게 한다.
- Non-goals: 이번 단계에서는 실제 파일 선택·전송, AI 분석 완료 답변, 생성된 프로필 수정 기능을 구현하지 않는다.
- Success signals: 텍스트 전송, 업로드 메뉴, 샘플 파일 추가, 분석 대기 상태가 시안과 같은 순서로 동작한다.

## Personas and jobs
- Primary personas: 회원가입 직후 팀 프로젝트 참여를 준비하는 사용자
- User jobs: 자신의 경험을 설명하거나 포트폴리오 자료를 제공해 프로필 분석을 시작한다.
- Key contexts of use: 세로형 모바일 화면, 소프트 키보드, 한 손 터치 조작

## Information architecture
- Primary navigation: 회원가입·자동 로그인 성공 → 프로필 설정 → 인증 완료 화면
- Core routes/screens: `/signup`, `/profile-setup`, `/auth-complete`, `/login`
- Content hierarchy: 헤더, AI 소개, 안내 대화, 사용자 입력·파일 버블, 분석 상태, 입력 도구

## Design principles
- Principle 1: 챗봇이 다음 행동을 먼저 설명하고 사용자는 텍스트 또는 자료 제공 방식을 선택한다.
- Principle 2: 메뉴 열림, 파일 추가 완료, 분석 대기 상태를 텍스트와 시각 상태로 함께 표현한다.
- Tradeoffs: 시안의 정보 구조와 상태 전환을 우선하며 정밀한 픽셀 조정은 후속 시각 검증에서 다룬다.

## Visual language
- Color: 기존 회색 배경, 흰색 봇 버블, `white-dark-sky-blue` 사용자 버블, `sky-blue` 활성 행동을 재사용한다.
- Typography: Pretendard와 기존 `font-sans` 설정을 사용한다.
- Spacing/layout rhythm: 상단 소개 → 대화 목록 → 화면 하단 입력 도구의 세 영역을 유지한다.
- Shape/radius/elevation: 메시지와 입력은 큰 둥근 모서리, `+`와 전송은 원형 버튼을 사용한다.
- Motion: 업로드 메뉴는 즉시 토글하며 별도 애니메이션은 이번 단계에서 추가하지 않는다.
- Imagery/iconography: 기존 `logo.webp`와 `assets/icons/metalchat.webp`를 사용하고 신규 에셋은 추가하지 않는다.

## Components
- Existing components to reuse: `CommonLayout`, `AppHeader`, SafeAreaView, NativeWind 토큰
- New/changed components: 프로필 설정 화면, 사용자·봇 메시지 버블, 입력 composer, 업로드 액션
- Variants and states: 메뉴 닫힘·열림, 텍스트 메시지, 파일 메시지, 분석 대기, 업로드 가능·비활성
- Token/component ownership: 색상·폰트는 전역 토큰, 대화·메뉴·샘플 파일 상태는 프로필 설정 화면 로컬 상태가 소유한다.

## Accessibility
- Target standard: React Native 기본 접근성 의미와 최소 44px 터치 영역
- Keyboard/focus behavior: 여러 줄 입력을 지원하고 키보드가 입력창을 가리지 않으며 전송 후 입력을 비운다.
- Contrast/readability: 비활성 업로드 액션도 라벨이 읽히되 활성 상태와 구분되는 대비를 사용한다.
- Screen-reader semantics: 메뉴 토글의 expanded 상태, 업로드 disabled 상태, 전송 버튼 label, 메시지 역할을 제공한다.
- Reduced motion and sensory considerations: 분석 상태와 비활성 상태는 색상 외 텍스트와 접근성 상태로도 전달한다.

## Responsive behavior
- Supported breakpoints/devices: Expo가 지원하는 세로형 iOS, Android, Web
- Layout adaptations: 콘텐츠 최대 너비를 제한하고 대화 영역을 유연하게 스크롤하며 입력창은 안전 영역 위에 둔다.
- Touch/hover differences: 모바일 터치 피드백을 기본으로 하고 Web에서는 동일한 Pressable 상태를 사용한다.

## Interaction states
- Loading: 실제 네트워크 로딩은 없으며 `프로젝트 경험을 분석하고 있어요...` 메시지가 후속 AI 처리 대기 상태를 나타낸다.
- Empty: 공백뿐인 텍스트는 전송하지 않고 안내 placeholder를 유지한다.
- Error: 이번 로컬 전용 단계에는 네트워크 오류가 없다.
- Success: 텍스트 또는 샘플 파일을 사용자 버블로 추가하고 분석 메시지를 대화 마지막에 하나만 표시한다.
- Disabled: 샘플 파일을 한 번 추가하면 `자료 업로드` 액션을 비활성화한다.
- Offline/slow network, if applicable: 현재 기능은 로컬 상태만 사용하므로 영향을 받지 않는다.

## Content voice
- Tone: 짧고 친근한 존댓말
- Terminology: 챗봇 이름은 `핏봇`, 입력 자료는 `프로젝트 경험`과 `자료 업로드`로 통일한다.
- Microcopy rules: 실제 처리와 샘플 동작의 차이는 제품 구현 단계에서 명확히 유지한다.

## Implementation constraints
- Framework/styling system: Expo SDK 54, React Native, Expo Router, NativeWind, Zustand 인증 상태
- Design-token constraints: 기존 색상·폰트·레이아웃 컴포넌트를 우선하며 신규 디자인 계층이나 패키지를 추가하지 않는다.
- Performance constraints: 메시지는 화면 로컬 배열로 관리하고 새 메시지에서 하단으로만 스크롤한다.
- Compatibility constraints: `/profile-setup`은 메모리 인증 상태가 필요하며 앱 재실행 시 `/login`으로 돌아간다.
- Test/screenshot expectations: typecheck, lint, Expo export와 세 시안 상태의 수동 확인을 수행한다.

## Open questions
- [ ] 실제 파일 선택 형식·크기·개수와 업로드 API 계약 / 백엔드·앱 담당 / 실제 자료 전송
- [ ] AI 분석 요청·완료 응답·오류·재시도 계약 / AI·백엔드 담당 / 분석 대화
- [ ] 분석 결과에서 생성 프로필을 확인하고 수정하는 화면 / 제품·디자인 담당 / 후속 프로필 완성

# Fitple 모바일 앱

React와 Expo로 개발하는 Fitple 모바일 앱입니다. 현재 프로젝트는 Expo SDK 54, TypeScript, Expo Router를 사용합니다.

## 개발 환경

- Node.js 24 LTS
- npm 11
- Android 또는 iOS 실기기의 Expo Go

Node 버전을 먼저 확인합니다.

```powershell
node --version
```

`v24.x`가 아니라면 Node.js 24 LTS로 전환한 뒤 의존성을 설치합니다.
프로젝트는 `.npmrc`의 `engine-strict` 설정으로 다른 Node 메이저 버전의 설치를 차단합니다.

```powershell
npm install
```

## 실행

개발 서버를 시작한 뒤 터미널에 표시되는 QR 코드를 Expo Go로 스캔합니다.

```powershell
npm start
```

Metro 캐시를 비우고 다시 시작하려면 다음 명령을 사용합니다.

```powershell
npm run start:clear
```

## 검증

```powershell
npm run lint
npm run typecheck
npm run doctor
```

Expo SDK 54의 Metro 및 Expo CLI 전이 의존성에는 현재 `npm audit` 경고가 남아 있습니다. `npm audit fix --force`는 React Native를 낮추거나 Expo SDK를 57로 올려 현재 Expo Go 호환성을 깨뜨리므로 사용하지 않습니다. SDK 업그레이드 시 다시 검토합니다.

## 디렉터리 규칙

```text
assets/            앱 아이콘, 스플래시, 이미지, 폰트
src/
├─ app/            Expo Router 라우트와 레이아웃
├─ components/     여러 화면에서 재사용하는 UI
└─ theme/          색상, 간격, 타이포그래피 같은 디자인 토큰
```

- `src/app`의 파일은 화면 진입점과 라우팅만 담당하며 복잡한 UI나 로직을 직접 담지 않습니다.
- 공통 React Hook이 필요해지면 `src/hooks`에 추가합니다.
- API와 로컬 저장소 연동은 `src/services`에 추가합니다.
- 앱 전체 전역 상태가 필요해지면 `src/store`를 만들고, 그전에는 React의 지역 상태와 Context를 사용합니다.
- 공유 TypeScript 타입은 `src/types`, 순수 유틸리티 함수는 `src/utils`에 추가합니다.
- 사용하지 않는 디렉터리나 빈 추상화는 미리 만들지 않습니다.
- `src` 내부 모듈은 `@/components/...` 형식의 별칭으로 import합니다.
- NativeWind를 사용하므로 재사용 UI에는 `className`과 Tailwind utility class를 우선 사용합니다. 화면별 예외적인 스타일이나 동적 스타일은 React Native `StyleSheet`를 사용합니다.
- 기본 글꼴은 Pretendard입니다. 텍스트에는 `font-sans` 클래스를 붙여 Pretendard를 사용하고, 굵기는 `font-medium`, `font-semibold`, `font-bold`로 지정합니다.

## 경로 alias

`@/*`는 `src/*`를 가리킵니다. 화면과 컴포넌트 사이처럼 폴더 경계를 넘는 import에는 alias를 사용합니다.

```tsx
import { HomeScreen } from '@/components/home-screen';
```

짧은 같은 폴더 내부 import는 상대 경로를 사용해도 됩니다.

## NativeWind

NativeWind v4와 Tailwind CSS v3가 설정되어 있습니다. 팀원이 새로 의존성을 설치할 때도 `.npmrc`가 Expo SDK 54의 peer dependency 조합을 유지합니다.

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-xl font-bold text-gray-900">Fitple</Text>
</View>
```

스타일이 반영되지 않으면 Metro 캐시를 비우고 다시 시작합니다.

```powershell
npm run start:clear
```

Android package와 iOS bundle identifier는 스토어 배포 준비 단계에서 팀 도메인에 맞춰 설정합니다.

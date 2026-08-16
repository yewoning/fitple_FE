# 공통 레이아웃 사용 가이드

`src/components/layout`은 로그인 이후 화면에서 공통으로 사용하는 Header와 하단 navbar를 제공합니다. 각 화면은 `CommonLayout`에 필요한 설정과 상태를 전달하며, 컴포넌트가 직접 비즈니스 로직이나 탭 라우트를 결정하지 않습니다.

## 빠른 시작

프로필 편집처럼 기본 Header만 필요한 화면은 다음과 같이 작성합니다.

```tsx
import { CommonLayout } from '@/components/layout';
import { Text, View } from 'react-native';

export function ProfileEditScreen() {
  return (
    <CommonLayout header={{ title: '프로필 편집' }} bottomNav={false}>
      <View className="flex-1 p-5">
        <Text className="font-sans text-gray-6">프로필 편집 내용</Text>
      </View>
    </CommonLayout>
  );
}
```

`onBackPress`를 생략하면 뒤로가기 버튼이 Expo Router의 `router.back()`을 호출합니다. 저장 여부 확인처럼 화면 전용 처리가 필요할 때만 콜백을 전달합니다.

```tsx
<CommonLayout
  header={{
    title: '프로필 편집',
    onBackPress: handleBackPress,
  }}
  bottomNav={false}
>
  {children}
</CommonLayout>
```

## 번역 Header와 navbar 사용

번역 토글과 활성 탭은 부모 화면이 소유하는 제어형 상태입니다. 아래 예시는 컴포넌트 동작을 보여주기 위해 지역 상태를 사용합니다. 실제 탭 라우트가 추가되면 `handleTabPress` 안에서 화면 이동을 연결하세요.

```tsx
import { useState } from 'react';
import {
  CommonLayout,
  type BottomNavKey,
} from '@/components/layout';
import { Text, View } from 'react-native';

export function ProjectScreen() {
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<BottomNavKey>('projects');

  const handleTabPress = (tab: BottomNavKey) => {
    setActiveTab(tab);
    // 탭 라우트가 준비되면 이곳에서 Expo Router 화면 이동을 연결합니다.
  };

  return (
    <CommonLayout
      header={{
        title: '프로젝트명',
        translation: {
          enabled: translationEnabled,
          onChange: setTranslationEnabled,
        },
        showMore: true,
      }}
      bottomNav={{
        activeTab,
        onTabPress: handleTabPress,
      }}
    >
      <View className="flex-1 p-5">
        <Text className="font-sans text-gray-6">프로젝트 내용</Text>
      </View>
    </CommonLayout>
  );
}
```

더보기 기능이 정해지기 전에는 `showMore: true`만 전달합니다. 이 경우 `⋮`은 표시되지만 비활성 상태입니다. 기능을 연결할 때 `onMorePress`를 함께 전달합니다.

## 화면별 표시 설정

`header`와 `bottomNav`는 각각 설정 객체 또는 `false`를 받습니다.

| 화면 유형 | `header` | `bottomNav` |
| --- | --- | --- |
| 로그인·회원가입 | `false` | `false` |
| 상세·편집 화면 | Header 설정 | `false` |
| 앱의 주요 탭 화면 | Header 설정 | navbar 설정 |
| 전체 화면 콘텐츠 | 필요에 따라 `false` | 필요에 따라 `false` |

현재 로그인 전 진입 화면인 `src/app/index.tsx`에는 공통 레이아웃을 적용하지 않습니다.

## API

### `HeaderProps`

| 속성 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 필수 | 중앙에 표시할 화면 제목 |
| `showBack` | `boolean` | `true` | 뒤로가기 버튼 표시 여부 |
| `onBackPress` | `() => void` | `router.back()` | 화면 전용 뒤로가기 처리 |
| `translation` | `TranslationControl` | 없음 | 번역 토글의 상태와 변경 콜백 |
| `showMore` | `boolean` | `false` | 더보기 기호 표시 여부 |
| `onMorePress` | `() => void` | 없음 | 더보기 동작. 없으면 버튼 비활성화 |

```ts
interface TranslationControl {
  enabled: boolean;
  onChange: (next: boolean) => void;
}
```

### `BottomNavbarProps`

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| `activeTab` | `BottomNavKey` | 활성 색상으로 표시할 현재 탭 |
| `onTabPress` | `(tab: BottomNavKey) => void` | 탭을 누를 때 부모가 처리할 콜백 |

```ts
type BottomNavKey = 'home' | 'projects' | 'chat' | 'mypage';
```

navbar는 탭 경로를 알지 못합니다. 라우트 파일 또는 화면 컨테이너에서 `BottomNavKey`를 실제 Expo Router 경로로 변환해야 합니다.

### `CommonLayoutProps`

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| `children` | `ReactNode` | Header와 navbar 사이에 표시할 화면 콘텐츠 |
| `header` | `HeaderProps \| false` | Header 설정 또는 숨김 |
| `bottomNav` | `BottomNavbarProps \| false` | navbar 설정 또는 숨김 |

## 레이아웃 규칙

- Header 콘텐츠 높이는 56px이며 상단 Safe Area는 컴포넌트가 처리합니다.
- navbar 콘텐츠 높이는 64px이며 하단 Safe Area는 컴포넌트가 처리합니다.
- iOS Home Indicator는 운영체제가 표시하므로 화면에서 별도로 그리지 않습니다.
- Header 또는 navbar 바깥에 같은 방향의 `SafeAreaView`를 중복 적용하지 않습니다.
- 긴 Header 제목은 오른쪽 컨트롤과 겹치기 전에 한 줄 말줄임 처리됩니다.
- navbar 활성 탭은 `blue-2 #0169FF`, 비활성 탭은 `gray-6 #484D5A`로 표시됩니다.
- navbar 아이콘은 `assets/icons`의 PNG를 공용으로 사용하고 `tintColor`로 상태 색상을 적용합니다.

## 변경 후 검증

공통 레이아웃이나 사용 화면을 변경한 뒤 다음 검사를 실행합니다.

```powershell
npm run lint
npm run typecheck
```

iOS와 Android에서 Header가 상태 표시줄과 겹치지 않는지, navbar가 시스템 하단 영역과 겹치지 않는지, 뒤로가기·번역·탭 콜백이 한 번씩 호출되는지도 확인합니다.

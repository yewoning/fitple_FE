import { CommonLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, type Href, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileMessageKind = 'text' | 'file' | 'analysis';
type ProfileMessageSender = 'user' | 'bot';

interface ProfileMessage {
  id: string;
  kind: ProfileMessageKind;
  sender: ProfileMessageSender;
  content: string;
  time: string;
}

const ANALYSIS_MESSAGE = '프로젝트 경험을 분석하고 있어요...';
const SAMPLE_FILE_NAME = 'UX_Portfolio.pdf';

/** 헤더 아래 입체감을 주는 그라데이션 (디자인 시안 기준 24px) */
const HEADER_SHADE_HEIGHT = 24;
const HEADER_SHADE_COLORS = ['#EEF3FB', '#F6F8FB'] as const;

/** 채팅 영역 좌우 여백과 말풍선이 아바타 옆으로 들여쓰기되는 값 */
const CHAT_PADDING_X = 12;
const BUBBLE_INDENT = 30;

function formatMessageTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function ProfileSetupScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginId = useAuthStore((state) => state.loginId);
  const scrollRef = useRef<ScrollView>(null);
  const messageSequence = useRef(0);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ProfileMessage[]>([]);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [fileAdded, setFileAdded] = useState(false);
  const initialMessageTime = useRef(formatMessageTime()).current;

  if (!isAuthenticated || !loginId) {
    return <Redirect href={'/login' as Href} />;
  }

  const nextMessageId = () => {
    messageSequence.current += 1;
    return `profile-message-${messageSequence.current}`;
  };

  const appendSubmission = (message: Omit<ProfileMessage, 'id' | 'time'>) => {
    const time = formatMessageTime();
    const submittedMessage: ProfileMessage = {
      ...message,
      id: nextMessageId(),
      time,
    };
    const analysisMessage: ProfileMessage = {
      id: nextMessageId(),
      kind: 'analysis',
      sender: 'bot',
      content: ANALYSIS_MESSAGE,
      time,
    };

    setMessages((currentMessages) => [
      ...currentMessages.filter((currentMessage) => currentMessage.kind !== 'analysis'),
      submittedMessage,
      analysisMessage,
    ]);
  };

  const handleSendText = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    appendSubmission({ kind: 'text', sender: 'user', content: trimmedValue });
    setInputValue('');
  };

  const handleAddFile = () => {
    if (fileAdded) {
      return;
    }

    appendSubmission({ kind: 'file', sender: 'user', content: SAMPLE_FILE_NAME });
    setFileAdded(true);
    setUploadMenuOpen(true);
  };

  const hasInput = inputValue.trim().length > 0;

  return (
    <CommonLayout
      header={{
        title: '핏봇',
        showBack: true,
        onBackPress: () => router.replace('/home' as Href),
      }}
      bottomNav={false}
    >
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-1">
        <LinearGradient
          colors={HEADER_SHADE_COLORS}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: HEADER_SHADE_HEIGHT,
          }}
        />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={56}
        >
          <View className="mx-auto w-full max-w-md flex-1">
            <ScrollView
              ref={scrollRef}
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: CHAT_PADDING_X,
                paddingTop: 80,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (messages.length > 0) {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }
              }}
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-[22px] pl-[45px]">
                <Image
                  source={require('../../assets/images/logo.webp')}
                  accessibilityLabel="fitple"
                  resizeMode="contain"
                  style={{ width: 42, height: 62, marginLeft: -22, marginBottom: -22 }}
                />
                <Text className="font-sans text-[24px] leading-[29px] text-black">
                  안녕하세요.{`\n`}저는 핏봇이라고 해요.{`\n`}원활한{' '}
                  <Text className="font-sans font-bold">팀플</Text>을 위해{`\n`}
                  <Text className="font-sans font-bold">프로필 설정</Text>을 도와드릴게요.
                </Text>
              </View>

              <BotMessage
                content={`참여한 프로젝트와 맡은 역할, 보유 기술 등을 소개해 주세요.\n혹은 포트폴리오나 자료(사진·PDF 등등)를 업로드해 주세요.`}
                emphasis="AI가 분석하여 프로필을 자동으로 작성해드릴게요."
                time={initialMessageTime}
              />

              {messages.map((message) =>
                message.sender === 'user' ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <BotMessage key={message.id} content={message.content} time={message.time} />
                ),
              )}
            </ScrollView>

            <View className="px-[14px] pb-4">
              <View className="flex-row items-end gap-2">
                <View className="w-11 items-center">
                  {uploadMenuOpen ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ disabled: fileAdded }}
                      disabled={fileAdded}
                      className={`mb-[10px] h-9 min-w-[92px] items-center justify-center self-start rounded-full px-4 ${
                        fileAdded ? 'bg-white' : 'bg-sky-blue'
                      }`}
                      onPress={handleAddFile}
                      style={({ pressed }) => ({
                        opacity: pressed && !fileAdded ? 0.8 : 1,
                        transform: [{ translateX: 8 }],
                      })}
                    >
                      <Text
                        className={`font-sans text-[12px] font-medium ${
                          fileAdded ? 'text-gray-5' : 'text-gray-1'
                        }`}
                      >
                        자료 업로드
                      </Text>
                    </Pressable>
                  ) : null}

                  {/* 입력창(min-h 54)보다 10px 낮아, 아래 여백을 줘서 입력창 중앙에 맞춘다 */}
                  <Pressable
                    accessibilityLabel={
                      uploadMenuOpen ? '자료 업로드 메뉴 닫기' : '자료 업로드 메뉴 열기'
                    }
                    accessibilityRole="button"
                    accessibilityState={{ expanded: uploadMenuOpen }}
                    className={`mb-[5px] h-11 w-11 items-center justify-center rounded-full ${
                      uploadMenuOpen ? 'bg-sky-blue' : 'bg-white'
                    }`}
                    onPress={() => setUploadMenuOpen((currentValue) => !currentValue)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Text
                      className={`font-sans text-[28px] font-light leading-[32px] ${
                        uploadMenuOpen ? 'text-gray-1' : 'text-gray-5'
                      }`}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <View className="min-h-[54px] flex-1 flex-row items-center rounded-full bg-white pl-[22px] pr-[9px]">
                  <TextInput
                    accessibilityLabel="프로젝트 경험 입력"
                    className="max-h-24 flex-1 py-[10px] font-sans text-[12px] leading-[18px] text-gray-6"
                    multiline
                    // 웹의 textarea는 기본 2줄 높이라 글자가 위로 붙는다. 한 줄 높이로 맞춰 세로 중앙에 오게 한다
                    {...(Platform.OS === 'web' ? { rows: 1 } : null)}
                    onChangeText={setInputValue}
                    placeholder="프로젝트 경험을 입력하거나 자료를 업로드해 주세요."
                    placeholderTextColor="#828797"
                    returnKeyType="default"
                    textAlignVertical="center"
                    value={inputValue}
                  />
                  {/* 시안에는 없는 버튼이라, 입력이 있을 때만 노출해 안내 문구 자리를 뺏지 않도록 한다 */}
                  {hasInput ? (
                    <Pressable
                      accessibilityLabel="프로젝트 경험 전송"
                      accessibilityRole="button"
                      className="ml-1.5 h-8 w-8 items-center justify-center rounded-full bg-sky-blue"
                      onPress={handleSendText}
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                      <Text className="font-sans text-[16px] font-semibold leading-5 text-gray-1">
                        ↑
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CommonLayout>
  );
}

function BotMessage({
  content,
  emphasis,
  time,
}: {
  content: string;
  emphasis?: string;
  time: string;
}) {
  return (
    <View className="mb-[14px]">
      {/* 아바타는 흐름에서 빼서 말풍선 왼쪽 위에 겹쳐 놓는다 (시안과 동일한 배치) */}
      <View className="absolute left-0 top-0 h-[38px] w-[38px] items-center justify-center rounded-full bg-white">
        <Image
          source={require('../../assets/icons/metalchat.webp')}
          accessibilityLabel="핏봇"
          resizeMode="contain"
          style={{ width: 30, height: 30 }}
        />
      </View>

      <View style={{ marginLeft: BUBBLE_INDENT }}>
        <Text className="mb-[6px] mt-px pl-4 font-sans text-[12px] font-medium leading-4 text-gray-6">
          핏봇
        </Text>

        <View className="flex-row items-end">
          <View className="shrink rounded-[32px] bg-white px-4 py-[14px]">
            <Text className="font-sans text-[12px] leading-5 text-gray-6">
              {content}
              {emphasis ? (
                <>
                  {`\n`}
                  <Text className="font-sans font-medium underline">{emphasis}</Text>
                </>
              ) : null}
            </Text>
          </View>
          <Text className="ml-1 font-sans text-[10px] leading-[14px] text-gray-5">{time}</Text>
        </View>
      </View>
    </View>
  );
}

function UserMessage({ message }: { message: ProfileMessage }) {
  return (
    <View className="mb-[14px] flex-row items-end justify-end">
      <Text className="mr-1.5 font-sans text-[10px] leading-[14px] text-gray-5">
        {message.time}
      </Text>
      <View className="shrink rounded-[32px] bg-white-dark-sky-blue px-4 py-[14px]">
        <Text
          className="font-sans text-[12px] leading-5 text-gray-6"
          style={message.kind === 'file' ? { textDecorationLine: 'underline' } : undefined}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

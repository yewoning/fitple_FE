import { CommonLayout } from '@/components/layout';
import { useAuthStore } from '@/store/auth-store';
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
        onBackPress: () => router.replace('/auth-complete' as Href),
      }}
      bottomNav={false}
    >
      <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-1">
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
                paddingHorizontal: 22,
                paddingTop: 120,
                paddingBottom: 28,
              }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => {
                if (messages.length > 0) {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }
              }}
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-12">
                <Image
                  source={require('../../assets/images/logo.webp')}
                  accessibilityLabel="fitple"
                  resizeMode="contain"
                  style={{ width: 56, height: 76 }}
                />
                <Text className="mt-1 font-sans text-[34px] leading-[42px] text-black">
                  안녕하세요.{`\n`}저는 핏봇이라고 해요.{`\n`}원활한{' '}
                  <Text className="font-sans font-bold">팀플</Text>을 위해{`\n`}
                  <Text className="font-sans font-bold">프로필 설정</Text>을 도와드릴게요.
                </Text>
              </View>

              <BotMessage
                content={`참여한 프로젝트와 맡은 역할, 보유 기술 등을 소개해 주세요.\n혹은 포트폴리오나 자료(사진·PDF 등)를 업로드해 주세요.`}
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

            <View className="px-5 pb-4">
              <View className="flex-row items-end gap-3">
                <View className="w-[58px] items-center">
                  {uploadMenuOpen ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ disabled: fileAdded }}
                      disabled={fileAdded}
                      className={`mb-3 h-12 min-w-[96px] items-center justify-center self-start rounded-full px-5 ${
                        fileAdded ? 'bg-white' : 'bg-sky-blue'
                      }`}
                      onPress={handleAddFile}
                      style={({ pressed }) => ({
                        opacity: pressed && !fileAdded ? 0.8 : 1,
                        transform: [{ translateX: 8 }],
                      })}
                    >
                      <Text
                        className={`font-sans text-[15px] font-medium ${
                          fileAdded ? 'text-gray-5' : 'text-gray-1'
                        }`}
                      >
                        자료 업로드
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    accessibilityLabel={
                      uploadMenuOpen ? '자료 업로드 메뉴 닫기' : '자료 업로드 메뉴 열기'
                    }
                    accessibilityRole="button"
                    accessibilityState={{ expanded: uploadMenuOpen }}
                    className={`h-[58px] w-[58px] items-center justify-center rounded-full ${
                      uploadMenuOpen ? 'bg-sky-blue' : 'bg-white'
                    }`}
                    onPress={() => setUploadMenuOpen((currentValue) => !currentValue)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Text
                      className={`font-sans text-[40px] font-light leading-[44px] ${
                        uploadMenuOpen ? 'text-gray-1' : 'text-gray-5'
                      }`}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <View className="min-h-[58px] flex-1 flex-row items-center rounded-full bg-white pl-6 pr-2">
                  <TextInput
                    accessibilityLabel="프로젝트 경험 입력"
                    className="max-h-28 flex-1 py-3 font-sans text-[15px] leading-5 text-gray-6"
                    multiline
                    onChangeText={setInputValue}
                    placeholder="프로젝트 경험을 입력하거나 자료를 업로드해 주세요."
                    placeholderTextColor="#828797"
                    returnKeyType="default"
                    textAlignVertical="center"
                    value={inputValue}
                  />
                  <Pressable
                    accessibilityLabel="프로젝트 경험 전송"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !hasInput }}
                    className={`ml-2 h-11 w-11 items-center justify-center rounded-full ${
                      hasInput ? 'bg-sky-blue' : 'bg-gray-2'
                    }`}
                    disabled={!hasInput}
                    onPress={handleSendText}
                    style={({ pressed }) => ({ opacity: pressed && hasInput ? 0.8 : 1 })}
                  >
                    <Text className="font-sans text-[26px] font-semibold leading-[30px] text-gray-1">
                      ↑
                    </Text>
                  </Pressable>
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
    <View className="mb-5 flex-row items-start">
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white">
        <Image
          source={require('../../assets/icons/metalchat.webp')}
          accessibilityLabel="핏봇"
          resizeMode="contain"
          style={{ width: 34, height: 34 }}
        />
      </View>
      <View className="max-w-[82%] flex-1">
        <Text className="mb-2 font-sans text-[14px] font-medium leading-5 text-gray-6">핏봇</Text>
        <View className="flex-row items-end">
          <View className="rounded-[28px] bg-white px-6 py-5">
            <Text className="font-sans text-[15px] leading-[26px] text-gray-6">
              {content}
              {emphasis ? (
                <>
                  {`\n`}
                  <Text className="underline">{emphasis}</Text>
                </>
              ) : null}
            </Text>
          </View>
          <Text className="ml-2 font-sans text-[12px] leading-4 text-gray-5">{time}</Text>
        </View>
      </View>
    </View>
  );
}

function UserMessage({ message }: { message: ProfileMessage }) {
  return (
    <View className="mb-5 flex-row items-end justify-end">
      <Text className="mr-2 font-sans text-[12px] leading-4 text-gray-5">{message.time}</Text>
      <View className="max-w-[78%] rounded-[28px] bg-white-dark-sky-blue px-6 py-5">
        <Text
          className="font-sans text-[15px] leading-[26px] text-gray-6"
          style={message.kind === 'file' ? { textDecorationLine: 'underline' } : undefined}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

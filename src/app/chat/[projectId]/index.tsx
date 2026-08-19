import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CommonLayout } from '@/components/layout';
import { Avatar } from '@/components/ui/avatar';
import {
  useChatMessagesQuery,
  useChatRoomQuery,
  useCreateMeetingMinuteMutation,
  useCreateTodayTasksMutation,
  useSendMessageMutation,
} from '@/hooks/useChat';
import { ChatMessage, MeetingMinuteDetail } from '@/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

const QUICK_ACTIONS = [
  { key: 'meeting', label: '회의록 생성' },
  { key: 'tasks', label: '오늘의 과제 생성' },
  { key: 'roadmap', label: '로드맵 업데이트' },
];

export default function ChatRoomScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const { data: room } = useChatRoomQuery(projectId);
  const { data: messageData } = useChatMessagesQuery(projectId);
  const sendMessageMutation = useSendMessageMutation(projectId);
  const createMeetingMinuteMutation = useCreateMeetingMinuteMutation(projectId);
  const createTodayTasksMutation = useCreateTodayTasksMutation(projectId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [translateOn, setTranslateOn] = useState(true);
  const [input, setInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [meetingPreview, setMeetingPreview] = useState<MeetingMinuteDetail | null>(null);

  useEffect(() => {
    if (messageData?.messages) setMessages(messageData.messages);
  }, [messageData]);

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    const optimistic: ChatMessage = {
      messageId: Date.now(),
      senderId: 0,
      senderName: '나',
      content,
      originalLanguage: 'ko',
      translatedContent: null,
      sentAt: new Date().toISOString(),
      isMe: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    sendMessageMutation.mutate(content);
  };

  const addBotMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        messageId: Date.now(),
        senderId: -1,
        senderName: '핏봇',
        content,
        originalLanguage: 'ko',
        translatedContent: null,
        sentAt: new Date().toISOString(),
        isBot: true,
      },
    ]);
  };

  const handleQuickAction = async (key: string) => {
    setActionLoading(key);
    try {
      if (key === 'meeting') {
        const minute = await createMeetingMinuteMutation.mutateAsync();
        addBotMessage('지금까지의 대화를 바탕으로 회의 내용을 정리했어요.\n확인 후 회의록으로 저장해 주세요!');
        setMeetingPreview(minute);
      } else if (key === 'tasks') {
        await createTodayTasksMutation.mutateAsync();
        addBotMessage('지금까지의 대화를 바탕으로 오늘의 할 일을 정리했어요. 확인 후 바로 과제를 시작해볼까요?');
      } else {
        addBotMessage('프로젝트 로드맵을 업데이트했어요.');
      }
    } catch (e: any) {
      Alert.alert('오류', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <CommonLayout
      header={{
        title: room?.projectName ?? '채팅방',
        showBack: true,
        translation: { enabled: translateOn, onChange: setTranslateOn },
        showMore: true,
        onMorePress: () =>
          router.push({ pathname: '/chat/[projectId]/settings', params: { projectId: projectIdParam } }),
      }}
      bottomNav={false}
    >
      <View style={{ flex: 1, position: 'relative' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.messageId)}
          contentContainerClassName="gap-3 p-4"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <MessageBubble message={item} translateOn={translateOn} />}
        />

        <View className="flex-row flex-wrap gap-2 px-4 pb-2">
          {QUICK_ACTIONS.map((action, index) => {
            const isPrimary = index === 0;
            return (
              <TouchableOpacity
                key={action.key}
                className={
                  isPrimary
                    ? 'rounded-full bg-dark-blue px-3 py-1.5'
                    : 'rounded-full border border-gray-2 bg-white px-3 py-1.5'
                }
                onPress={() => handleQuickAction(action.key)}
                disabled={actionLoading !== null}
              >
                <Text
                  className={
                    isPrimary
                      ? 'font-sans-medium text-[11px] text-white'
                      : 'font-sans-medium text-[11px] text-gray-6'
                  }
                >
                  {actionLoading === action.key ? '처리 중...' : action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center gap-2 border-t border-gray-2 px-4 py-2">
          <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full bg-gray-2" hitSlop={8}>
            <Ionicons name="add" size={22} color="#828797" />
          </TouchableOpacity>
          <TextInput
            className="h-10 flex-1 rounded-full bg-gray-2 px-3 font-sans text-[15px] text-black"
            placeholder="팀원들과 소통해보세요!"
            placeholderTextColor="#a8adbe"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} hitSlop={8}>
            <Ionicons name="send" size={20} color="#4876ee" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>

        {meetingPreview ? (
          <MeetingMinutePreviewSheet minute={meetingPreview} onClose={() => setMeetingPreview(null)} />
        ) : null}
      </View>
    </CommonLayout>
  );
}

// 채팅방 '회의록 생성' 미리보기 화면 스크린샷 기준: 채팅 하단에서 위로 올라오는 스크롤 가능한 바텀시트
function MeetingMinutePreviewSheet({
  minute,
  onClose,
}: {
  minute: MeetingMinuteDetail;
  onClose: () => void;
}) {
  const shortDate = minute.meetingDate.slice(2);

  return (
    <View
      className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl bg-gray-1"
      style={{ height: '62%', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 12 }}
    >
      <TouchableOpacity className="items-center py-3" onPress={onClose} activeOpacity={0.7}>
        <View className="h-1 w-10 rounded-full bg-gray-3" />
      </TouchableOpacity>

      <ScrollView contentContainerClassName="gap-4 px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View>
          <Text className="font-sans-bold text-xl text-black">{minute.projectName}</Text>
          <Text className="mt-1 font-sans text-[13px] text-gray-5">
            {shortDate} {minute.meetingNumber}차 회의
          </Text>
        </View>

        <View className="gap-2">
          <Text className="font-sans-bold text-[15px] text-black">회의 주제</Text>
          <View className="rounded-2xl bg-white px-4 py-3.5">
            <Text className="font-sans text-[15px] text-black">{minute.topic}</Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-sans-bold text-[15px] text-black">회의 내용</Text>
          <View className="gap-4 rounded-2xl bg-white p-4">
            <View className="gap-1">
              <Text className="font-sans-bold text-[13px] text-black">주요 논의</Text>
              <Text className="font-sans text-sm leading-5 text-gray-6">{minute.content.mainDiscussion}</Text>
            </View>

            <View className="gap-1">
              <Text className="font-sans-bold text-[13px] text-black">결정 사항</Text>
              {minute.content.decisions.map((line, index) => (
                <Text key={index} className="font-sans text-sm leading-5 text-gray-6">
                  {line}
                </Text>
              ))}
            </View>

            <View className="gap-1">
              <Text className="font-sans-bold text-[13px] text-black">역할 및 다음 할 일</Text>
              {minute.content.rolesAndNextTasks.map((item) => (
                <View key={item.name} className="flex-row gap-2">
                  <Text className="w-14 font-sans-semibold text-sm text-black">{item.name}</Text>
                  <Text className="flex-1 font-sans text-sm text-gray-6">{item.task}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MessageBubble({ message, translateOn }: { message: ChatMessage; translateOn: boolean }) {
  if (message.isBot) {
    return (
      <View className="max-w-[90%] flex-row gap-2 self-center">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-sky-blue">
          <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
        </View>
        <View className="gap-1 rounded-2xl bg-white-dark-sky-blue p-3">
          <Text className="font-sans-bold text-[11px] text-dark-blue">핏봇</Text>
          <Text className="font-sans text-[15px] text-black">{message.content}</Text>
        </View>
      </View>
    );
  }

  if (message.isMe) {
    return (
      <View className="max-w-[80%] flex-row items-end gap-1.5 self-end">
        <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
        <View className="rounded-2xl rounded-br-sm bg-sky-blue px-3.5 py-2.5">
          <Text className="font-sans text-[15px] text-white">{message.content}</Text>
        </View>
      </View>
    );
  }

  const showTranslation = translateOn && message.translatedContent;

  return (
    <View className="max-w-[85%] flex-row gap-2">
      <Avatar uri={message.profileImageUrl} size={32} />
      <View className="flex-1 gap-1.5">
        <Text className="mb-1 font-sans text-[11px] text-gray-6">{message.senderName}</Text>
        <View className="flex-row items-end gap-1.5">
          <View className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5">
            <Text className="font-sans text-[15px] text-black">{message.content}</Text>
          </View>
          {!showTranslation ? (
            <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
          ) : null}
        </View>

        {showTranslation ? (
          <View className="flex-row items-end gap-1.5">
            <View className="rounded-2xl rounded-bl-sm bg-white-dark-sky-blue px-3.5 py-2.5">
              <Text className="font-sans text-[15px] text-dark-blue">{message.translatedContent}</Text>
            </View>
            <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

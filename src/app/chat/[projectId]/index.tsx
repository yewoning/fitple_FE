import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import {
  useChatMessagesQuery,
  useChatRoomQuery,
  useCreateMeetingMinuteMutation,
  useCreateTodayTasksMutation,
  useSendMessageMutation,
} from '@/hooks/useChat';
import { ChatMessage } from '@/types';

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
        addBotMessage(`회의록을 생성했어요. "${minute.topic}" 확인 후 저장해 주세요!`);
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
    <SafeAreaView className="flex-1 bg-gray-1">
      <View className="h-[52px] flex-row items-center gap-2 px-4">
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#3f3f3f" />
        </TouchableOpacity>
        <Text className="flex-1 font-sans text-[15px] font-semibold text-black" numberOfLines={1}>
          {room?.projectName ?? '채팅방'}
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Text className="font-sans text-[11px] text-gray-6">번역</Text>
            <Switch value={translateOn} onValueChange={setTranslateOn} trackColor={{ true: '#4876ee', false: '#cccfdb' }} />
          </View>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/chat/[projectId]/settings', params: { projectId: projectIdParam } })}
            hitSlop={10}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#3f3f3f" />
          </TouchableOpacity>
        </View>
      </View>

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
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              className="rounded-full border border-sky-blue px-3 py-1.5"
              onPress={() => handleQuickAction(action.key)}
              disabled={actionLoading !== null}
            >
              <Text className="font-sans text-[11px] font-bold text-sky-blue">
                {actionLoading === action.key ? '처리 중...' : action.label}
              </Text>
            </TouchableOpacity>
          ))}
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
    </SafeAreaView>
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
          <Text className="font-sans text-[11px] font-bold text-dark-blue">핏봇</Text>
          <Text className="font-sans text-[15px] text-black">{message.content}</Text>
        </View>
      </View>
    );
  }

  if (message.isMe) {
    return (
      <View className="max-w-[80%] flex-row items-end gap-1.5 self-end">
        <View className="rounded-2xl rounded-br-sm bg-sky-blue px-3.5 py-2.5">
          <Text className="font-sans text-[15px] text-white">{message.content}</Text>
        </View>
        <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
      </View>
    );
  }

  const showTranslation = translateOn && message.translatedContent;

  return (
    <View className="max-w-[85%] flex-row gap-2">
      <Avatar uri={message.profileImageUrl} size={32} />
      <View className="flex-1">
        <Text className="mb-1 font-sans text-[11px] text-gray-6">{message.senderName}</Text>
        <View className="flex-row items-end gap-1.5">
          <View className="rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5">
            <Text className="font-sans text-[15px] text-black">{message.content}</Text>
          </View>
          <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
        </View>
        {showTranslation ? (
          <View className="mt-1.5 self-start rounded-xl bg-white-dark-sky-blue px-3 py-2">
            <Text className="font-sans text-[13px] text-dark-blue">{message.translatedContent}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
  chatKeys,
  createLocalMessageId,
  useChatMessagesQuery,
  useChatProjectSummary,
  useChatRoomQuery,
  useCreateMeetingMinuteMutation,
  useCreateTodayTasksMutation,
  useGenerateRoadmapMutation,
  useSendMessageMutation,
  useTeamMembersQuery,
} from '@/hooks/useChat';
import { useAuthStore } from '@/store/auth-store';
import { ChatMessage, MeetingMinuteDetail, TeamMember } from '@/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

// 사용자가 목록 맨 아래에서 이 정도 안쪽에 있으면 "아래를 보고 있다"고 판단해서
// 새 메시지가 오면 따라 내려갑니다. 위쪽 지난 대화를 읽는 중이면 강제로 끌어내리지 않습니다.
const AUTO_SCROLL_THRESHOLD = 80;

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
  const queryClient = useQueryClient();

  const memberId = useAuthStore((state) => state.memberId);
  const { data: room } = useChatRoomQuery(projectId);
  const roomId = room?.roomId ?? null;
  const projectSummary = useChatProjectSummary(projectId);

  // 화면이 실제로 떠 있을 때만 폴링합니다. 전송 중에는 잠깐 멈춰서,
  // 낙관적 메시지와 서버 메시지가 동시에 보이는 깜빡임을 막습니다.
  const [screenFocused, setScreenFocused] = useState(true);
  const sendMessageMutation = useSendMessageMutation(roomId, memberId);
  const { data: messages = [], refetch: refetchMessages } = useChatMessagesQuery(
    roomId,
    memberId,
    screenFocused && !sendMessageMutation.isPending
  );
  const { data: memberData } = useTeamMembersQuery(projectId);
  const createMeetingMinuteMutation = useCreateMeetingMinuteMutation(projectId);
  const createTodayTasksMutation = useCreateTodayTasksMutation(projectId);
  const generateRoadmapMutation = useGenerateRoadmapMutation(projectId);

  // 핏봇 안내는 서버 채팅에 저장되지 않는 화면 전용 메시지라 별도로 들고 있습니다.
  const [botMessages, setBotMessages] = useState<ChatMessage[]>([]);
  const [translateOn, setTranslateOn] = useState(true);
  const [input, setInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [meetingPreview, setMeetingPreview] = useState<MeetingMinuteDetail | null>(null);

  // 폴링할 때마다 목록이 아래로 튀지 않도록, 첫 진입과 "아래를 보고 있을 때"만 따라 내려갑니다.
  const stickToBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false);
  const refetchRef = useRef(refetchMessages);
  refetchRef.current = refetchMessages;
  // refetch()는 enabled가 false여도 강제로 요청을 보내기 때문에,
  // roomId/memberId가 아직 없을 때 잘못된 URL로 나가지 않도록 여기서 막습니다.
  const canFetchRef = useRef(false);
  canFetchRef.current = roomId != null && memberId != null;

  // 방에 다시 들어오면(탭 이동 등으로 화면이 살아있는 경우 포함) 즉시 최신 내역을 받습니다.
  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      if (canFetchRef.current) refetchRef.current();
      return () => setScreenFocused(false);
    }, [])
  );

  // 서버 메시지엔 보낸 사람 이름이 없어서 팀원 목록으로 채워줍니다.
  const memberNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const member of (memberData?.members ?? []) as TeamMember[]) {
      map.set(member.memberId, member.name);
    }
    return map;
  }, [memberData]);

  const visibleMessages = useMemo(
    () =>
      [...messages, ...botMessages].sort((a, b) => {
        const at = new Date(a.sentAt).getTime() || 0;
        const bt = new Date(b.sentAt).getTime() || 0;
        return at - bt;
      }),
    [messages, botMessages]
  );

  // 채팅방에 들어오면 채팅 목록 화면의 안읽음 뱃지를 0으로 지워줍니다.
  // (실제 '읽음 처리' API가 따로 없어서, 목록 캐시를 직접 갱신하는 방식으로 처리)
  useEffect(() => {
    queryClient.setQueryData([...chatKeys.projects, memberId], (old: any) => {
      if (!old?.projects) return old;
      return {
        ...old,
        projects: old.projects.map((p: any) =>
          p.projectId === projectId ? { ...p, unreadCount: 0 } : p
        ),
      };
    });
  }, [projectId, memberId, queryClient]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    stickToBottomRef.current =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - AUTO_SCROLL_THRESHOLD;
  };

  const handleContentSizeChange = () => {
    if (!didInitialScrollRef.current) {
      if (visibleMessages.length === 0) return;
      didInitialScrollRef.current = true;
      listRef.current?.scrollToEnd({ animated: false });
      return;
    }
    if (stickToBottomRef.current) listRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    if (roomId == null || memberId == null) {
      Alert.alert('알림', '채팅방 정보를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setInput('');
    stickToBottomRef.current = true;
    sendMessageMutation.mutate(
      { content, tempId: createLocalMessageId() },
      {
        onError: () => {
          // 실패하면 작성 내용을 돌려줍니다(그 사이 새로 입력한 게 있으면 건드리지 않음).
          setInput((prev) => (prev ? prev : content));
          Alert.alert('전송 실패', '메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
  };

  const addBotMessage = (content: string) => {
    setBotMessages((prev) => [
      ...prev,
      {
        messageId: createLocalMessageId(),
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
        await generateRoadmapMutation.mutateAsync();
        addBotMessage('지금까지의 대화를 바탕으로 프로젝트 로드맵을 업데이트했어요.');
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
        title: projectSummary?.projectName ?? '채팅방',
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
          data={visibleMessages}
          keyExtractor={(item) => String(item.messageId)}
          contentContainerClassName="gap-3 p-4"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              translateOn={translateOn}
              senderName={item.senderName || memberNameById.get(item.senderId) || '팀원'}
            />
          )}
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

function MessageBubble({
  message,
  translateOn,
  senderName,
}: {
  message: ChatMessage;
  translateOn: boolean;
  senderName: string;
}) {
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
        <Text className="mb-1 font-sans text-[11px] text-gray-6">{senderName}</Text>
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

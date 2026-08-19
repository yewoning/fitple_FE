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
  type ViewToken,
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
  useChatTranslationQuery,
  useCreateMeetingMinuteMutation,
  useCreateTodayTasksMutation,
  useGenerateRoadmapMutation,
  useSendMessageMutation,
  useTeamMembersQuery,
  useTodayTasksQuery,
} from '@/hooks/useChat';
import {
  useUpdateTranslationEnabledMutation,
  useUserSettingsQuery,
} from '@/hooks/useSettings';
import { useAuthStore } from '@/store/auth-store';
import { ChatMessage, MeetingMinuteDraft, TeamMember } from '@/types';
import {
  buildMeetingMinuteDraft,
  MEETING_MINUTE_CONTENT_MAX,
  MEETING_MINUTE_TITLE_MAX,
} from '@/utils/meeting-minute';

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

function haveSameMessageIds(current: ReadonlySet<number>, next: ReadonlySet<number>) {
  if (current.size !== next.size) return false;
  for (const messageId of current) {
    if (!next.has(messageId)) return false;
  }
  return true;
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
  const queryClient = useQueryClient();

  const memberId = useAuthStore((state) => state.memberId);
  const settingsQuery = useUserSettingsQuery(memberId);
  const updateTranslationMutation = useUpdateTranslationEnabledMutation(memberId);
  const translateOn = settingsQuery.isSuccess && settingsQuery.data.translationEnabled;
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
  // 회의록 초안의 '다음 할 일'을 채우는 데 씁니다(읽기 전용이라 과제를 새로 만들지 않습니다).
  const { data: todoTaskData } = useTodayTasksQuery(projectId, 'TODO');
  const createMeetingMinuteMutation = useCreateMeetingMinuteMutation(projectId);
  const createTodayTasksMutation = useCreateTodayTasksMutation(projectId);
  const generateRoadmapMutation = useGenerateRoadmapMutation(projectId);

  // 핏봇 안내는 서버 채팅에 저장되지 않는 화면 전용 메시지라 별도로 들고 있습니다.
  const [botMessages, setBotMessages] = useState<ChatMessage[]>([]);
  const [viewableMessageIds, setViewableMessageIds] = useState<ReadonlySet<number>>(new Set());
  const [input, setInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [meetingDraft, setMeetingDraft] = useState<MeetingMinuteDraft | null>(null);

  // 폴링할 때마다 목록이 아래로 튀지 않도록, 첫 진입과 "아래를 보고 있을 때"만 따라 내려갑니다.
  const stickToBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false);
  const refetchRef = useRef(refetchMessages);
  refetchRef.current = refetchMessages;
  // refetch()는 enabled가 false여도 강제로 요청을 보내기 때문에,
  // roomId/memberId가 아직 없을 때 잘못된 URL로 나가지 않도록 여기서 막습니다.
  const canFetchRef = useRef(false);
  canFetchRef.current = roomId != null && memberId != null;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = new Set<number>();
      for (const token of viewableItems) {
        const message = token.item as ChatMessage | undefined;
        if (message?.messageId != null) next.add(message.messageId);
      }
      setViewableMessageIds((current) => (haveSameMessageIds(current, next) ? current : next));
    }
  ).current;

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

  // 회의록 초안에서도 같은 맵을 씁니다(서버 메시지/과제는 이름 없이 memberId만 옵니다).
  const resolveMemberName = useCallback(
    (id: number | null | undefined, fallback: string) =>
      (id != null ? memberNameById.get(id) : undefined) || fallback,
    [memberNameById]
  );

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

  useEffect(() => {
    if (translateOn) return;
    queryClient.cancelQueries({ queryKey: chatKeys.translations });
  }, [queryClient, translateOn]);

  const handleTranslationChange = (next: boolean) => {
    updateTranslationMutation.mutate(next, {
      onError: () => {
        Alert.alert('설정 저장 실패', '번역 설정을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

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
        sentAt: new Date().toISOString(),
        isBot: true,
      },
    ]);
  };

  // 회의록은 서버가 대화를 요약해주지 않아서, 화면에서 초안을 만들어 시트에 띄우고
  // 사용자가 확인·수정한 뒤에 저장합니다. (여기서는 네트워크 호출이 없습니다)
  const handleCreateMeetingDraft = () => {
    const draft = buildMeetingMinuteDraft({
      messages,
      tasks: todoTaskData?.tasks ?? [],
      resolveName: resolveMemberName,
    });

    if (!draft) {
      Alert.alert('알림', '아직 정리할 대화가 없어요. 팀원들과 대화를 나눈 뒤 다시 시도해 주세요.');
      return;
    }

    addBotMessage('지금까지의 대화를 바탕으로 회의 내용을 정리했어요.\n확인 후 회의록으로 저장해 주세요!');
    setMeetingDraft(draft);
  };

  const handleSaveMeetingMinute = async (draft: MeetingMinuteDraft) => {
    await createMeetingMinuteMutation.mutateAsync(draft);
    setMeetingDraft(null);
    addBotMessage('회의록을 저장했어요. 지난 회의록에서 다시 확인할 수 있어요.');
  };

  const handleQuickAction = async (key: string) => {
    if (key === 'meeting') {
      handleCreateMeetingDraft();
      return;
    }

    setActionLoading(key);
    try {
      if (key === 'tasks') {
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
        translation: {
          enabled: translateOn,
          disabled: !settingsQuery.isSuccess || updateTranslationMutation.isPending,
          onChange: handleTranslationChange,
        },
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
          extraData={viewableMessageIds}
          keyExtractor={(item) => String(item.messageId)}
          contentContainerClassName="gap-3 p-4"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <MessageBubble
              isVisible={viewableMessageIds.has(item.messageId)}
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

        {meetingDraft ? (
          <MeetingMinuteDraftSheet
            draft={meetingDraft}
            saving={createMeetingMinuteMutation.isPending}
            onSave={handleSaveMeetingMinute}
            onClose={() => setMeetingDraft(null)}
          />
        ) : null}
      </View>
    </CommonLayout>
  );
}

// 채팅 하단에서 올라오는 회의록 초안 시트.
// 서버가 대화를 요약해주지 않으므로 저장 전에 사용자가 제목/본문을 직접 다듬는 자리입니다.
function MeetingMinuteDraftSheet({
  draft,
  saving,
  onSave,
  onClose,
}: {
  draft: MeetingMinuteDraft;
  saving: boolean;
  onSave: (draft: MeetingMinuteDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.content);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      Alert.alert('알림', '제목과 회의 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      await onSave({ title: trimmedTitle, content: trimmedContent });
    } catch (e: any) {
      // 저장에 실패해도 시트를 닫지 않습니다(작성 중이던 내용이 사라지지 않도록).
      Alert.alert('저장 실패', e?.message ?? '회의록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl bg-gray-1"
      style={{ height: '78%', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 12 }}
    >
      {/* 시트는 바깥 KeyboardAvoidingView의 형제라, 본문 입력이 키보드에 가리지 않도록 따로 감쌉니다. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={40}
      >
        <TouchableOpacity className="items-center py-3" onPress={onClose} activeOpacity={0.7}>
          <View className="h-1 w-10 rounded-full bg-gray-3" />
        </TouchableOpacity>

        <ScrollView
          contentContainerClassName="gap-4 px-5 pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="font-sans-bold text-xl text-black">회의록 정리</Text>
            <Text className="mt-1 font-sans text-[13px] text-gray-5">
              내용을 확인하고 자유롭게 고친 뒤 저장해 주세요.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="font-sans-bold text-[15px] text-black">제목</Text>
            <TextInput
              className="rounded-2xl bg-white px-4 py-3.5 font-sans text-[15px] text-black"
              value={title}
              onChangeText={setTitle}
              maxLength={MEETING_MINUTE_TITLE_MAX}
              placeholder="예) 08.20 회의록"
              placeholderTextColor="#a8adbe"
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-[15px] text-black">회의 내용</Text>
              <Text className="font-sans text-[11px] text-gray-4">
                {content.length}/{MEETING_MINUTE_CONTENT_MAX}
              </Text>
            </View>
            <TextInput
              className="min-h-[220px] rounded-2xl bg-white px-4 py-3.5 font-sans text-sm leading-5 text-black"
              value={content}
              onChangeText={setContent}
              maxLength={MEETING_MINUTE_CONTENT_MAX}
              multiline
              textAlignVertical="top"
              placeholder="회의에서 나눈 내용을 정리해 주세요."
              placeholderTextColor="#a8adbe"
            />
          </View>
        </ScrollView>

        <View className="flex-row gap-2 border-t border-gray-2 px-5 py-3">
          <TouchableOpacity
            className="flex-1 items-center rounded-full border border-gray-2 bg-white py-3"
            onPress={onClose}
            disabled={saving}
          >
            <Text className="font-sans-medium text-[15px] text-gray-6">취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={saving ? 'flex-1 items-center rounded-full bg-gray-3 py-3' : 'flex-1 items-center rounded-full bg-dark-blue py-3'}
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="font-sans-semibold text-[15px] text-white">
              {saving ? '저장 중...' : '저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({
  isVisible,
  message,
  translateOn,
  senderName,
}: {
  isVisible: boolean;
  message: ChatMessage;
  translateOn: boolean;
  senderName: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const translationQuery = useChatTranslationQuery(message, translateOn && isVisible);

  useEffect(() => {
    if (!translateOn) setShowOriginal(false);
  }, [translateOn]);

  if (message.isBot) {
    return (
      <View className="max-w-[90%] flex-row gap-2 self-center">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-sky-blue">
          <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
        </View>
        <View className="shrink gap-1 rounded-2xl bg-white-dark-sky-blue p-3">
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
        <View className="shrink rounded-2xl rounded-br-sm bg-sky-blue px-3.5 py-2.5">
          <Text className="font-sans text-[15px] text-white">{message.content}</Text>
        </View>
      </View>
    );
  }

  const translatedContent = translationQuery.data?.translatedContent.trim();
  const hasDistinctTranslation =
    translateOn &&
    Boolean(translatedContent) &&
    translatedContent !== message.content.trim();
  const isTranslating = translateOn && isVisible && translationQuery.isFetching;
  const translationFailed =
    translateOn && isVisible && translationQuery.isError && !translationQuery.isFetching;

  return (
    <View className="max-w-[85%] flex-row gap-2">
      <Avatar uri={message.profileImageUrl} size={32} />
      <View className="flex-1 gap-1.5">
        <Text className="mb-1 font-sans text-[11px] text-gray-6">{senderName}</Text>
        {hasDistinctTranslation ? (
          <View className="gap-1.5">
            <View className="flex-row items-end gap-1.5">
              <TouchableOpacity
                accessibilityLabel={showOriginal ? '원문 접기' : '원문 보기'}
                accessibilityRole="button"
                activeOpacity={0.75}
                className="shrink rounded-2xl rounded-bl-sm bg-white-dark-sky-blue px-3.5 py-2.5"
                onPress={() => setShowOriginal((current) => !current)}
              >
                <Text className="font-sans text-[15px] text-dark-blue">{translatedContent}</Text>
                <Text className="mt-1 font-sans-medium text-[10px] text-gray-5">
                  {showOriginal ? '원문 접기' : '원문 보기'}
                </Text>
              </TouchableOpacity>
              <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
            </View>
            {showOriginal ? (
              <View className="shrink self-start rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5">
                <Text className="font-sans text-[15px] text-black">{message.content}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="gap-1">
            <View className="flex-row items-end gap-1.5">
              <View className="shrink rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5">
                <Text className="font-sans text-[15px] text-black">{message.content}</Text>
              </View>
              {!isTranslating && !translationFailed ? (
                <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
              ) : null}
            </View>
            {isTranslating ? (
              <Text className="font-sans text-[11px] text-gray-4">번역 중...</Text>
            ) : null}
            {translationFailed ? (
              <View className="flex-row items-center gap-2">
                <Text className="font-sans text-[11px] text-gray-4">번역하지 못했어요.</Text>
                <TouchableOpacity
                  accessibilityLabel="번역 재시도"
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => translationQuery.refetch()}
                >
                  <Text className="font-sans-semibold text-[11px] text-dark-blue">재시도</Text>
                </TouchableOpacity>
                <Text className="font-sans text-[11px] text-gray-4">{formatTime(message.sentAt)}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

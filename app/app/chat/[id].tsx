import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { useAuth } from "../../src/hooks/useAuth";

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
};

export default function ChatScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Get the other user's ID from the match
  useEffect(() => {
    if (!matchId || !session) return;
    supabase
      .from("matches")
      .select("user_a, user_b")
      .eq("id", matchId)
      .single()
      .then(({ data }) => {
        if (data) {
          setOtherUserId(
            data.user_a === session.user.id ? data.user_b : data.user_a
          );
        }
      });
  }, [matchId, session]);

  const handleUnmatch = () => {
    Alert.alert("Unmatch", "Are you sure you want to unmatch? This will remove the conversation.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unmatch",
        style: "destructive",
        onPress: async () => {
          setShowMenu(false);
          await supabase
            .from("matches")
            .update({ active: false })
            .eq("id", matchId);
          router.replace("/(tabs)/matches");
        },
      },
    ]);
  };

  const handleBlock = () => {
    Alert.alert(
      "Block User",
      "This will unmatch and block this user. They won't appear in your discovery feed and can't contact you.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            setShowMenu(false);
            if (!session || !otherUserId) return;
            // Deactivate match
            await supabase
              .from("matches")
              .update({ active: false })
              .eq("id", matchId);
            // Block user
            await supabase.from("blocks").insert({
              blocker_id: session.user.id,
              blocked_id: otherUserId,
            });
            router.replace("/(tabs)/matches");
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (!matchId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("sent_at", { ascending: true });
      if (data) setMessages(data);
    };

    loadMessages();

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const sendMessage = async () => {
    if (!text.trim() || !session || !matchId) return;
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: session.user.id,
      content,
    });
  };

  const isMe = (senderId: string) => senderId === session?.user.id;

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/(tabs)/chat");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with back button + tab nav */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BKB Dating - Chat</Text>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}
        >
          <Text style={styles.menuDots}>...</Text>
        </TouchableOpacity>
      </View>

      {/* Unmatch / Block Menu */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Options</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleUnmatch}>
              <Text style={styles.menuItemText}>Unmatch</Text>
              <Text style={styles.menuItemDesc}>
                Remove this match and conversation
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>
                Block User
              </Text>
              <Text style={styles.menuItemDesc}>
                Unmatch and prevent future contact
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          style={styles.flatList}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                isMe(item.sender_id) ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  isMe(item.sender_id) ? styles.myText : styles.theirText,
                ]}
              >
                {item.content}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  !isMe(item.sender_id) && styles.theirTimeText,
                ]}
              >
                {new Date(item.sent_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Say hi!</Text>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendDisabled]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom tab navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/(tabs)/discover")}
        >
          <Text style={styles.tabText}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/(tabs)/matches")}
        >
          <Text style={styles.tabText}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/(tabs)/chat")}
        >
          <Text style={[styles.tabText, styles.tabTextActive]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  flatList: { flex: 1 },
  messageList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF6B6B",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  backText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  menuButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  menuDots: { color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  menuItem: { paddingVertical: 14 },
  menuItemText: { fontSize: 17, fontWeight: "600", color: "#333" },
  menuItemDanger: { color: "#FF4444" },
  menuItemDesc: { fontSize: 13, color: "#999", marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: "#eee" },
  menuCancel: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  menuCancelText: { fontSize: 17, fontWeight: "600", color: "#666" },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#FF6B6B",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 16 },
  myText: { color: "#fff" },
  theirText: { color: "#333" },
  timeText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  theirTimeText: { color: "#aaa" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: { fontSize: 18, color: "#ccc" },
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 50,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tabItem: { paddingVertical: 8, paddingHorizontal: 12 },
  tabText: { color: "#999", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#FF6B6B" },
});

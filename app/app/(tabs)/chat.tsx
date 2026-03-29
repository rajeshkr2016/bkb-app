import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { useAuth } from "../../src/hooks/useAuth";

type ChatPreview = {
  match_id: string;
  other_name: string;
  last_message: string;
  last_time: string;
};

export default function ChatListScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    // Get all active matches
    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
      .eq("active", true);

    if (!matches) {
      setLoading(false);
      return;
    }

    const previews: ChatPreview[] = [];
    for (const match of matches) {
      const otherId =
        match.user_a === session.user.id ? match.user_b : match.user_a;

      const [profileRes, messageRes] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", otherId).single(),
        supabase
          .from("messages")
          .select("content, sent_at")
          .eq("match_id", match.id)
          .order("sent_at", { ascending: false })
          .limit(1),
      ]);

      if (messageRes.data && messageRes.data.length > 0) {
        previews.push({
          match_id: match.id,
          other_name: profileRes.data?.name || "Unknown",
          last_message: messageRes.data[0].content,
          last_time: messageRes.data[0].sent_at,
        });
      }
    }

    previews.sort(
      (a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
    );
    setChats(previews);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No conversations yet</Text>
        <Text style={styles.emptySubtext}>Match with someone and say hi!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.match_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => router.push(`/chat/${item.match_id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.other_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.other_name}</Text>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {item.last_message}
              </Text>
            </View>
            <Text style={styles.chatTime}>
              {new Date(item.last_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#FF6B6B" },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatName: { fontSize: 16, fontWeight: "600", color: "#333" },
  chatPreview: { fontSize: 14, color: "#999", marginTop: 2 },
  chatTime: { fontSize: 12, color: "#ccc" },
  emptyText: { fontSize: 18, color: "#999" },
  emptySubtext: { fontSize: 14, color: "#ccc", marginTop: 4 },
});

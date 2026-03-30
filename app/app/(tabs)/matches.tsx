import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { useAuth } from "../../src/hooks/useAuth";

type Match = {
  id: string;
  user_a: string;
  user_b: string;
  matched_at: string;
  active: boolean;
  other_name: string;
  shared_interests: string[];
};

type ChatPreview = {
  match_id: string;
  other_name: string;
  last_message: string;
  last_time: string;
  shared_interests: string[];
};

type InterestName = { interests: { name: string } };

async function getSharedInterests(
  userId: string,
  otherId: string
): Promise<string[]> {
  // Get current user's interest IDs
  const { data: myInterests } = await supabase
    .from("profile_interests")
    .select("interest_id")
    .eq("profile_id", userId);
  if (!myInterests || myInterests.length === 0) return [];

  const myIds = new Set(myInterests.map((i) => i.interest_id));

  // Get other user's interests with names
  const { data: otherInterests } = await supabase
    .from("profile_interests")
    .select("interest_id, interests ( name )")
    .eq("profile_id", otherId);
  if (!otherInterests) return [];

  return (otherInterests as unknown as (InterestName & { interest_id: string })[])
    .filter((i) => myIds.has(i.interest_id))
    .map((i) => i.interests.name);
}

export default function MatchesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [newMatches, setNewMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
      .eq("active", true)
      .order("matched_at", { ascending: false });

    if (!matches) {
      setLoading(false);
      return;
    }

    const newMatchList: Match[] = [];
    const chatList: ChatPreview[] = [];

    await Promise.all(
      matches.map(async (match) => {
        const otherId =
          match.user_a === session.user.id ? match.user_b : match.user_a;

        const [profileRes, messageRes, shared] = await Promise.all([
          supabase.from("profiles").select("name").eq("id", otherId).single(),
          supabase
            .from("messages")
            .select("content, sent_at")
            .eq("match_id", match.id)
            .order("sent_at", { ascending: false })
            .limit(1),
          getSharedInterests(session.user.id, otherId),
        ]);

        const name = profileRes.data?.name || "Unknown";

        if (messageRes.data && messageRes.data.length > 0) {
          chatList.push({
            match_id: match.id,
            other_name: name,
            last_message: messageRes.data[0].content,
            last_time: messageRes.data[0].sent_at,
            shared_interests: shared,
          });
        } else {
          newMatchList.push({
            ...match,
            other_name: name,
            shared_interests: shared,
          });
        }
      })
    );

    chatList.sort(
      (a, b) =>
        new Date(b.last_time).getTime() - new Date(a.last_time).getTime()
    );

    setNewMatches(newMatchList);
    setChats(chatList);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (newMatches.length === 0 && chats.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No matches yet</Text>
        <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* New Matches — horizontal row */}
      {newMatches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Matches</Text>
          <FlatList
            horizontal
            data={newMatches}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.matchCard}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <View style={styles.matchAvatar}>
                  <Text style={styles.matchAvatarText}>
                    {item.other_name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <Text style={styles.matchName} numberOfLines={1}>
                  {item.other_name}
                </Text>
                {item.shared_interests.length > 0 && (
                  <Text style={styles.matchShared} numberOfLines={1}>
                    {item.shared_interests.length} shared
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Conversations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversations</Text>
        {chats.length === 0 ? (
          <View style={styles.emptyChats}>
            <Text style={styles.emptyChatsText}>
              No conversations yet — say hi to a match!
            </Text>
          </View>
        ) : (
          chats.map((item) => (
            <TouchableOpacity
              key={item.match_id}
              style={styles.chatRow}
              onPress={() => router.push(`/chat/${item.match_id}`)}
            >
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>
                  {item.other_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.other_name}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {item.last_message}
                </Text>
                {item.shared_interests.length > 0 && (
                  <Text style={styles.chatShared} numberOfLines={1}>
                    {item.shared_interests.join(", ")}
                  </Text>
                )}
              </View>
              <Text style={styles.chatTime}>
                {new Date(item.last_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },

  // New Matches (horizontal)
  matchRow: { paddingRight: 16 },
  matchCard: {
    alignItems: "center",
    marginRight: 16,
    width: 72,
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  matchAvatarText: { fontSize: 22, fontWeight: "bold", color: "#FF6B6B" },
  matchName: {
    fontSize: 12,
    color: "#333",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  matchShared: {
    fontSize: 10,
    color: "#2E7D32",
    marginTop: 2,
    textAlign: "center",
  },

  // Conversations
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  chatAvatarText: { fontSize: 20, fontWeight: "bold", color: "#FF6B6B" },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatName: { fontSize: 16, fontWeight: "600", color: "#333" },
  chatPreview: { fontSize: 14, color: "#999", marginTop: 2 },
  chatShared: { fontSize: 12, color: "#2E7D32", marginTop: 2 },
  chatTime: { fontSize: 12, color: "#ccc" },

  emptyChats: { paddingVertical: 24, alignItems: "center" },
  emptyChatsText: { fontSize: 14, color: "#999" },
  emptyText: { fontSize: 18, color: "#999" },
  emptySubtext: { fontSize: 14, color: "#ccc", marginTop: 4 },
});

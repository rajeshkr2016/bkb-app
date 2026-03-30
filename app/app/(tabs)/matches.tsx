import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
  other_profile?: { name: string };
};

export default function MatchesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
      .eq("active", true)
      .order("matched_at", { ascending: false });

    if (!error && data) {
      // Fetch the other user's profile for each match
      const enriched = await Promise.all(
        data.map(async (match: Match) => {
          const otherId =
            match.user_a === session.user.id ? match.user_b : match.user_a;
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", otherId)
            .single();
          return { ...match, other_profile: profile };
        })
      );
      setMatches(enriched);
    }
    setLoading(false);
  }, [session]);

  // Reload matches every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No matches yet</Text>
        <Text style={styles.emptySubtext}>Keep swiping to find your match!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.other_profile?.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>
                {item.other_profile?.name || "Unknown"}
              </Text>
              <Text style={styles.matchDate}>
                Matched {new Date(item.matched_at).toLocaleDateString()}
              </Text>
            </View>
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
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  matchInfo: { marginLeft: 16, flex: 1 },
  matchName: { fontSize: 18, fontWeight: "600", color: "#333" },
  matchDate: { fontSize: 13, color: "#999", marginTop: 2 },
  emptyText: { fontSize: 18, color: "#999" },
  emptySubtext: { fontSize: 14, color: "#ccc", marginTop: 4 },
});

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { useAuth } from "../../src/hooks/useAuth";
import { Profile } from "../../src/hooks/useProfile";

const { width } = Dimensions.get("window");

export default function DiscoverScreen() {
  const { session } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_discovery_feed", {
      user_id: session.user.id,
    });
    if (!error && data) {
      setProfiles(data);
      setCurrentIndex(0);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Listen for new matches in realtime
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          const match = payload.new as { user_a: string; user_b: string };
          if (
            match.user_a === session.user.id ||
            match.user_b === session.user.id
          ) {
            setMatchAlert("It's a Match!");
            setTimeout(() => setMatchAlert(null), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleSwipe = async (action: "like" | "pass") => {
    if (!session || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];

    await supabase.from("swipes").insert({
      swiper_id: session.user.id,
      swiped_id: target.id,
      action,
    });

    setCurrentIndex((prev) => prev + 1);

    // Reload when running low
    if (currentIndex >= profiles.length - 2) {
      loadProfiles();
    }
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No more profiles nearby</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = currentProfile.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(currentProfile.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "?";

  return (
    <View style={styles.container}>
      {/* Match Alert Overlay */}
      {matchAlert && (
        <View style={styles.matchOverlay}>
          <Text style={styles.matchText}>{matchAlert}</Text>
        </View>
      )}

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoInitial}>
            {currentProfile.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {currentProfile.name}, {age}
          </Text>
          <Text style={styles.gender}>{currentProfile.gender}</Text>
          {currentProfile.bio ? (
            <Text style={styles.bio}>{currentProfile.bio}</Text>
          ) : null}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe("pass")}
        >
          <Text style={styles.passIcon}>X</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe("like")}
        >
          <Text style={styles.likeIcon}>{"<3"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: "#FFE0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInitial: { fontSize: 80, fontWeight: "bold", color: "#FF6B6B" },
  cardInfo: { padding: 20 },
  name: { fontSize: 28, fontWeight: "bold", color: "#333" },
  gender: { fontSize: 16, color: "#999", marginTop: 4 },
  bio: { fontSize: 16, color: "#666", marginTop: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingBottom: 24,
    paddingTop: 8,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#FF4444" },
  likeButton: { backgroundColor: "#FF6B6B" },
  passIcon: { fontSize: 28, fontWeight: "bold", color: "#FF4444" },
  likeIcon: { fontSize: 28, color: "#fff" },
  emptyText: { fontSize: 18, color: "#999" },
  refreshButton: {
    marginTop: 16,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  matchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  matchText: { fontSize: 48, fontWeight: "bold", color: "#fff" },
});

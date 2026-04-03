import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import CommunityNav from "../../src/components/CommunityNav";
import {
  fetchMeetupEvents,
  formatEventDate,
  formatEventTime,
  isHikingEvent,
  MeetupEvent,
} from "../../src/lib/meetup";

const MEETUP_URL =
  "https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/";

export default function HikingScreen() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<MeetupEvent[]>([]);
  const [past, setPast] = useState<MeetupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchMeetupEvents();
      const hikeEvents = result.events.filter(isHikingEvent);
      const now = new Date();
      setUpcoming(hikeEvents.filter((e) => new Date(e.dateTime) >= now));
      setPast(hikeEvents.filter((e) => new Date(e.dateTime) < now).reverse());
    } catch (err: any) {
      setError(err.message || "Failed to load hikes");
    }
  }, []);

  useEffect(() => {
    loadEvents().finally(() => setLoading(false));
  }, [loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const renderEvent = (event: MeetupEvent, isPast: boolean) => {
    const date = formatEventDate(event.dateTime);
    const time = formatEventTime(event.dateTime);
    return (
      <TouchableOpacity
        key={event.id}
        style={[styles.eventCard, isPast && styles.pastCard]}
        onPress={() => Linking.openURL(event.eventUrl || MEETUP_URL)}
        activeOpacity={isPast ? 1 : 0.8}
      >
        <View style={styles.eventDate}>
          <Text style={[styles.dateMonth, isPast && styles.pastText]}>
            {date.month}
          </Text>
          <Text style={[styles.dateDay, isPast && styles.pastText]}>
            {date.day}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, isPast && styles.pastText]}>
            {event.title}
          </Text>
          <Text style={styles.eventMeta}>{time}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.attendeeBadge, isPast && { opacity: 0.6 }]}>
              <Text style={styles.attendeeText}>
                {event.going} {isPast ? "went" : "going"}
                {!isPast && event.maxTickets > 0
                  ? ` / ${event.maxTickets} max`
                  : ""}
              </Text>
            </View>
            <View style={styles.hikeBadge}>
              <Text style={styles.hikeText}>Hiking</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(landing)")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BKB Hiking</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(MEETUP_URL)}
            style={styles.meetupButton}
          >
            <Text style={styles.meetupBtnText}>Meetup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading hikes from Meetup...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
          }
        >
          {/* Upcoming */}
          <Text style={styles.sectionTitle}>Upcoming Hikes</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming hikes scheduled</Text>
          ) : (
            upcoming.map((e) => renderEvent(e, false))
          )}

          {/* Past */}
          {past.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Past Hikes
              </Text>
              {past.map((e) => renderEvent(e, true))}
            </>
          )}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => Linking.openURL(MEETUP_URL)}
          >
            <Text style={styles.viewAllText}>View all on Meetup</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <CommunityNav active="Hiking" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 4 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  refreshButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refreshBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  meetupButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meetupBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Loading / Error
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  errorText: { color: "#e53935", fontSize: 14, textAlign: "center", marginHorizontal: 32 },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyText: { fontSize: 14, color: "#999", marginBottom: 16 },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 10,
  },

  // Event card
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pastCard: { opacity: 0.6 },
  eventDate: {
    width: 46,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
    textTransform: "uppercase",
  },
  dateDay: { fontSize: 22, fontWeight: "800", color: "#333" },
  eventInfo: { flex: 1, marginLeft: 12 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  eventMeta: { fontSize: 12, color: "#888", marginTop: 3 },
  pastText: { color: "#999" },

  badgeRow: { flexDirection: "row", marginTop: 8, gap: 8 },
  attendeeBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  attendeeText: { fontSize: 11, color: "#2E7D32", fontWeight: "600" },
  hikeBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hikeText: { fontSize: 11, color: "#4CAF50", fontWeight: "600" },

  // View all
  viewAllButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  viewAllText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

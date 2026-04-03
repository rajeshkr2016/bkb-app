import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
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
  MeetupEvent,
  MeetupGroup,
} from "../../src/lib/meetup";

const MEETUP_URL =
  "https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/";

const TAG_FILTERS = [
  "All",
  "Social",
  "Family",
  "Nightlife",
  "Adventure",
  "Cultural",
  "Online",
  "Hiking",
  "Food",
];

function inferTags(event: MeetupEvent): string[] {
  const text = `${event.title} ${event.description}`.toLowerCase();
  const tags: string[] = [];
  if (text.includes("hike") || text.includes("hiking") || text.includes("trail")) tags.push("Hiking");
  if (text.includes("dinner") || text.includes("lunch") || text.includes("food") || text.includes("chef")) tags.push("Food");
  if (text.includes("bowl") || text.includes("golf") || text.includes("sport")) tags.push("Sports");
  if (text.includes("kid") || text.includes("family") || text.includes("zoo") || text.includes("easter")) tags.push("Family");
  if (text.includes("night") || text.includes("hookah") || text.includes("drink") || text.includes("dj") || text.includes("peg")) tags.push("Nightlife");
  if (text.includes("festival") || text.includes("cultural") || text.includes("jayanti") || text.includes("maharashtra")) tags.push("Cultural");
  if (text.includes("escape") || text.includes("rafting") || text.includes("adventure") || text.includes("vegas")) tags.push("Adventure");
  if (event.eventType === "ONLINE") tags.push("Online");
  if (tags.length === 0) tags.push("Social");
  return tags;
}

export default function EventsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [events, setEvents] = useState<(MeetupEvent & { tags: string[] })[]>([]);
  const [group, setGroup] = useState<MeetupGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchMeetupEvents();
      const tagged = result.events.map((e) => ({ ...e, tags: inferTags(e) }));
      setEvents(tagged);
      setGroup(result.group);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
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

  const filtered =
    activeFilter === "All"
      ? events
      : events.filter((e) => e.tags.includes(activeFilter));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(landing)")} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BKB Events</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL(MEETUP_URL)}
            style={styles.meetupButton}
          >
            <Text style={styles.meetupText}>Meetup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Group info */}
      {group && (
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.groupStats}>
            <Text style={styles.statText}>
              {group.memberCount.toLocaleString()} members
            </Text>
            <Text style={styles.statDot}> · </Text>
            <Text style={styles.statText}>{group.rating.toFixed(1)} rating</Text>
          </View>
        </View>
      )}

      {/* Tag filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {TAG_FILTERS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.filterChip,
              activeFilter === tag && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(tag)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === tag && styles.filterTextActive,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading state */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading events from Meetup...</Text>
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
          style={styles.eventList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
          }
        >
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No events found for this filter</Text>
          ) : (
            filtered.map((event) => {
              const date = formatEventDate(event.dateTime);
              const time = formatEventTime(event.dateTime);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => Linking.openURL(event.eventUrl || MEETUP_URL)}
                  activeOpacity={0.8}
                >
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDateMonth}>{date.month}</Text>
                    <Text style={styles.eventDateDay}>{date.day}</Text>
                  </View>

                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventTime}>{time}</Text>

                    <View style={styles.eventMeta}>
                      <View style={styles.attendeeBadge}>
                        <Text style={styles.attendeeText}>
                          {event.going} going
                          {event.maxTickets > 0 ? ` / ${event.maxTickets} max` : ""}
                        </Text>
                      </View>
                      {event.eventType === "ONLINE" && (
                        <View style={styles.onlineBadge}>
                          <Text style={styles.onlineText}>Online</Text>
                        </View>
                      )}
                      {event.fee && (
                        <View style={styles.feeBadge}>
                          <Text style={styles.feeText}>{event.fee}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.tagRow}>
                      {event.tags.map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => Linking.openURL(MEETUP_URL)}
          >
            <Text style={styles.viewAllText}>View all events on Meetup</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      <CommunityNav active="Events" />
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
    backgroundColor: "#FF6B6B",
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
  refreshText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  meetupButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meetupText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Group info
  groupInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  groupName: { fontSize: 16, fontWeight: "700", color: "#333" },
  groupStats: { flexDirection: "row", marginTop: 4, alignItems: "center" },
  statText: { fontSize: 13, color: "#666" },
  statDot: { fontSize: 13, color: "#ccc" },

  // Filters
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterChipActive: { backgroundColor: "#FF6B6B" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#fff" },

  // Loading / Error
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#888", fontSize: 14 },
  errorText: { color: "#FF6B6B", fontSize: 14, textAlign: "center", marginHorizontal: 32 },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyText: { fontSize: 14, color: "#999", textAlign: "center", marginTop: 32 },

  // Event list
  eventList: { flex: 1, paddingHorizontal: 16 },

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
  eventDate: {
    width: 50,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  eventDateMonth: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6B6B",
    textTransform: "uppercase",
  },
  eventDateDay: { fontSize: 22, fontWeight: "800", color: "#333" },

  eventDetails: { flex: 1, marginLeft: 12 },
  eventTitle: { fontSize: 15, fontWeight: "700", color: "#333" },
  eventTime: { fontSize: 12, color: "#888", marginTop: 3 },

  eventMeta: { flexDirection: "row", marginTop: 8, gap: 8 },
  attendeeBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  attendeeText: { fontSize: 11, color: "#2E7D32", fontWeight: "600" },
  onlineBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  onlineText: { fontSize: 11, color: "#1565C0", fontWeight: "600" },
  feeBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  feeText: { fontSize: 11, color: "#E65100", fontWeight: "600" },

  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 4 },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: { fontSize: 10, color: "#888" },

  // View all
  viewAllButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  viewAllText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

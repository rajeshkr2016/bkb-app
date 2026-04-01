import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import CommunityNav from "../../src/components/CommunityNav";

const MEETUP_URL =
  "https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/";

type HikeEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  description: string;
  status: "upcoming" | "past";
};

const HIKE_EVENTS: HikeEvent[] = [
  {
    id: "1",
    title: "Rancho PGE Hike + Amber India Lunch",
    date: "Apr 4-5, 2026",
    time: "8:00 AM",
    location: "Rancho, CA",
    attendees: 3,
    description: "Multi-day hike followed by lunch at Amber India.",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Wild Flowers Hike",
    date: "Mar 28, 2026",
    time: "5:00 PM",
    location: "Bay Area, CA",
    attendees: 18,
    description: "Evening hike to enjoy the spring wildflower bloom.",
    status: "past",
  },
  {
    id: "3",
    title: "BKB Hike - Mount Umunhum",
    date: "Mar 28, 2026",
    time: "7:30 AM",
    location: "Mount Umunhum, CA",
    attendees: 10,
    description: "Morning hike up Mount Umunhum with scenic views.",
    status: "past",
  },
  {
    id: "4",
    title: "Mission Peak Hike + Lunch",
    date: "Mar 28, 2026",
    time: "8:00 AM",
    location: "Mission Peak, Fremont",
    attendees: 4,
    description: "Classic Mission Peak hike followed by a group lunch.",
    status: "past",
  },
];

export default function HikingScreen() {
  const router = useRouter();

  const upcoming = HIKE_EVENTS.filter((e) => e.status === "upcoming");
  const past = HIKE_EVENTS.filter((e) => e.status === "past");

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
        <TouchableOpacity
          onPress={() => Linking.openURL(MEETUP_URL)}
          style={styles.meetupButton}
        >
          <Text style={styles.meetupBtnText}>Meetup</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming Hikes</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming hikes scheduled</Text>
        ) : (
          upcoming.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => Linking.openURL(MEETUP_URL)}
            >
              <View style={styles.eventDate}>
                <Text style={styles.dateMonth}>
                  {event.date.split(" ")[0]}
                </Text>
                <Text style={styles.dateDay}>
                  {event.date.split(" ")[1]?.replace(",", "")}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {event.time} · {event.location}
                </Text>
                <Text style={styles.eventDesc}>{event.description}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.attendeeBadge}>
                    <Text style={styles.attendeeText}>
                      {event.attendees} going
                    </Text>
                  </View>
                  <View style={styles.hikeBadge}>
                    <Text style={styles.hikeText}>Hiking</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Past */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Past Hikes
        </Text>
        {past.map((event) => (
          <View key={event.id} style={[styles.eventCard, styles.pastCard]}>
            <View style={styles.eventDate}>
              <Text style={[styles.dateMonth, styles.pastText]}>
                {event.date.split(" ")[0]}
              </Text>
              <Text style={[styles.dateDay, styles.pastText]}>
                {event.date.split(" ")[1]?.replace(",", "")}
              </Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, styles.pastText]}>
                {event.title}
              </Text>
              <Text style={styles.eventMeta}>
                {event.time} · {event.location}
              </Text>
              <Text style={styles.eventDesc}>{event.description}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.attendeeBadge, { opacity: 0.6 }]}>
                  <Text style={styles.attendeeText}>
                    {event.attendees} went
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => Linking.openURL(MEETUP_URL)}
        >
          <Text style={styles.viewAllText}>
            View all on Meetup
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

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
  meetupButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meetupBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: { fontSize: 14, color: "#999", fontWeight: "500" },
  tabTextActive: { color: "#4CAF50", fontWeight: "700" },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 10,
  },
  emptyText: { fontSize: 14, color: "#999", marginBottom: 16 },

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
  eventDesc: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },
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

  // WebView
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
  webLoader: { position: "absolute", top: "40%", alignSelf: "center", zIndex: 1 },
  fallbackLink: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: { color: "#4CAF50", fontSize: 18, fontWeight: "600" },
});

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import CommunityNav from "../../src/components/CommunityNav";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "physical" | "online";
  attendees: number;
  maxCapacity?: number;
  fee?: string;
  description: string;
  tags: string[];
};

const MEETUP_URL =
  "https://www.meetup.com/break-ke-baad-bkb-divorced-indians/events/";

const EVENTS: EventItem[] = [
  {
    id: "1",
    title: "BKB TriValley Mid Week Meetup",
    date: "Apr 1, 2026",
    time: "6:30 PM",
    location: "TriValley, CA",
    type: "physical",
    attendees: 8,
    description: "Weekly series until June 24, 2026. Casual mid-week hangout.",
    tags: ["Weekly", "Casual"],
  },
  {
    id: "2",
    title: "Hookah and the Art of Chilling at Pasha",
    date: "Apr 2, 2026",
    time: "7:00 PM",
    location: "Redwood City, CA",
    type: "physical",
    attendees: 30,
    maxCapacity: 30,
    description: "Relax and unwind with hookah and great company.",
    tags: ["Nightlife", "Social"],
  },
  {
    id: "3",
    title: "TGIF House of Raha Fremont Dinner",
    date: "Apr 3, 2026",
    time: "7:30 PM",
    location: "Fremont, CA",
    type: "physical",
    attendees: 5,
    description: "Friday dinner at House of Raha to kick off the weekend.",
    tags: ["Dinner", "TGIF"],
  },
  {
    id: "4",
    title: "Rancho PGE Hike + Amber India Lunch",
    date: "Apr 4-5, 2026",
    time: "8:00 AM",
    location: "Rancho, CA",
    type: "physical",
    attendees: 3,
    description: "Multi-day hike followed by lunch at Amber India.",
    tags: ["Hiking", "Food"],
  },
  {
    id: "5",
    title: "Veganism 101 Discussion",
    date: "Apr 4, 2026",
    time: "1:00 PM",
    location: "Online",
    type: "online",
    attendees: 20,
    maxCapacity: 24,
    description: "Learn about the basics of veganism and plant-based living.",
    tags: ["Online", "Health"],
  },
  {
    id: "6",
    title: "Hanuman Jayanti Pink Full Moon Awakening",
    date: "Apr 4, 2026",
    time: "5:45 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 17,
    maxCapacity: 30,
    description: "Spiritual gathering to celebrate Hanuman Jayanti under the pink full moon.",
    tags: ["Spiritual", "Cultural"],
  },
  {
    id: "7",
    title: "Saturday Night Bowling Dinner & Drinks",
    date: "Apr 4, 2026",
    time: "7:00 PM",
    location: "Milpitas, CA",
    type: "physical",
    attendees: 9,
    maxCapacity: 20,
    description: "Bowling, dinner and drinks — a fun Saturday night out!",
    tags: ["Bowling", "Nightlife"],
  },
  {
    id: "8",
    title: "Escape Room",
    date: "Apr 9, 2026",
    time: "7:15 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 4,
    fee: "$49.99",
    description: "Team up and solve puzzles to escape!",
    tags: ["Adventure", "Paid"],
  },
  {
    id: "9",
    title: "SWAGAT New Members Welcome Event",
    date: "Apr 11, 2026",
    time: "7:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 59,
    maxCapacity: 120,
    description: "Welcome event for new BKB members. Meet the community!",
    tags: ["Welcome", "Social"],
  },
  {
    id: "10",
    title: "Easter Egg Hunt for Kids",
    date: "Apr 12, 2026",
    time: "2:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 51,
    description: "Family-friendly Easter egg hunt for kids of all ages.",
    tags: ["Family", "Kids"],
  },
  {
    id: "11",
    title: "Oakland Zoo Trip with Kids",
    date: "Apr 18, 2026",
    time: "10:00 AM",
    location: "Oakland, CA",
    type: "physical",
    attendees: 10,
    maxCapacity: 40,
    description: "Fun day at the Oakland Zoo with kids and families.",
    tags: ["Family", "Kids", "Outdoors"],
  },
  {
    id: "12",
    title: "Mini-Golf @ Emerald Hills",
    date: "Apr 19, 2026",
    time: "1:30 PM",
    location: "San Jose, CA",
    type: "physical",
    attendees: 7,
    description: "Casual mini-golf afternoon at Emerald Hills.",
    tags: ["Sports", "Casual"],
  },
  {
    id: "13",
    title: "Las Vegas 2026 Edition",
    date: "Apr 23-26, 2026",
    time: "All Day",
    location: "Las Vegas, NV",
    type: "physical",
    attendees: 46,
    maxCapacity: 100,
    description: "Multi-day trip to Las Vegas! Shows, dining, and fun.",
    tags: ["Trip", "Multi-day"],
  },
  {
    id: "14",
    title: "DJ Chetas in San Francisco",
    date: "Apr 24, 2026",
    time: "10:00 PM",
    location: "San Francisco, CA",
    type: "physical",
    attendees: 17,
    description: "Bollywood night with DJ Chetas live in SF!",
    tags: ["Nightlife", "Bollywood"],
  },
  {
    id: "15",
    title: "Mother's Day 2026 Celebrations",
    date: "May 9, 2026",
    time: "12:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 50,
    maxCapacity: 50,
    description: "Special celebration honoring all the amazing moms in BKB.",
    tags: ["Celebration", "Special"],
  },
  {
    id: "16",
    title: "Maharashtra Festival",
    date: "May 16, 2026",
    time: "12:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 75,
    maxCapacity: 75,
    description: "Member-exclusive Maharashtra cultural festival.",
    tags: ["Cultural", "Festival"],
  },
  {
    id: "17",
    title: "Master Chef Competition",
    date: "May 16, 2026",
    time: "6:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 30,
    description: "Show off your cooking skills! BKB Master Chef competition.",
    tags: ["Cooking", "Competition"],
  },
  {
    id: "18",
    title: "White Water Rafting & River Camping",
    date: "May 23-25, 2026",
    time: "All Day",
    location: "California",
    type: "physical",
    attendees: 33,
    description: "Kids-friendly adventure — white water rafting and riverside camping.",
    tags: ["Adventure", "Family", "Multi-day"],
  },
  {
    id: "19",
    title: "Patiala Peg",
    date: "May 23, 2026",
    time: "7:00 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 40,
    maxCapacity: 40,
    description: "An evening of drinks, music, and desi vibes.",
    tags: ["Social", "Nightlife"],
  },
  {
    id: "20",
    title: "Memorial Day Dinner Party",
    date: "May 24, 2026",
    time: "7:30 PM",
    location: "Bay Area, CA",
    type: "physical",
    attendees: 35,
    maxCapacity: 35,
    description: "Memorial Day weekend dinner party with the BKB family.",
    tags: ["Dinner", "Holiday"],
  },
];

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

export default function EventsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? EVENTS
      : EVENTS.filter((e) => e.tags.includes(activeFilter));

  const handleBack = () => {
    router.replace("/(landing)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BKB Events</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(MEETUP_URL)}
          style={styles.meetupButton}
        >
          <Text style={styles.meetupText}>Meetup</Text>
        </TouchableOpacity>
      </View>

      {/* Group info */}
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>
          Break Ke Baad - Global Indian Divorced Singles
        </Text>
        <View style={styles.groupStats}>
          <Text style={styles.statText}>2,279 members</Text>
          <Text style={styles.statDot}> · </Text>
          <Text style={styles.statText}>4.8 rating</Text>
          <Text style={styles.statDot}> · </Text>
          <Text style={styles.statText}>Fremont, CA</Text>
        </View>
      </View>

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

      {/* Events list */}
      <ScrollView style={styles.eventList}>
        {filtered.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => Linking.openURL(MEETUP_URL)}
            activeOpacity={0.8}
          >
            <View style={styles.eventDate}>
              <Text style={styles.eventDateMonth}>
                {event.date.split(" ")[0]}
              </Text>
              <Text style={styles.eventDateDay}>
                {event.date.split(" ")[1]?.replace(",", "")}
              </Text>
            </View>

            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.eventTime}>
                {event.time} · {event.location}
              </Text>
              <Text style={styles.eventDesc} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventMeta}>
                <View style={styles.attendeeBadge}>
                  <Text style={styles.attendeeText}>
                    {event.attendees} going
                    {event.maxCapacity
                      ? ` / ${event.maxCapacity} max`
                      : ""}
                  </Text>
                </View>
                {event.type === "online" && (
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
        ))}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => Linking.openURL(MEETUP_URL)}
        >
          <Text style={styles.viewAllText}>View all events on Meetup</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

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
  eventDesc: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },

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

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";

const APP_LINKS = [
  {
    title: "BKB Dating",
    description: "Find your perfect match in the BKB community",
    icon: "<3",
    route: "/(auth)/login" as const,
  },
  {
    title: "BKB Hiking",
    description: "Explore trails and join group hikes nearby",
    icon: "^",
    route: null,
  },
  {
    title: "BKB Helpline",
    description: "24/7 support and resources when you need them",
    icon: "?",
    route: null,
  },
  {
    title: "BKB Women",
    description: "A safe space for women to connect and empower",
    icon: "W",
    route: null,
  },
  {
    title: "BKB Career",
    description: "Job listings, mentorship, and career growth",
    icon: "C",
    route: null,
  },
  {
    title: "BKB Stocks",
    description: "Market insights and investment discussions",
    icon: "$",
    route: null,
  },
  {
    title: "BKB Sports",
    description: "Find teams, leagues, and pickup games",
    icon: "S",
    route: null,
  },
  {
    title: "BKB Health",
    description: "Wellness tips, fitness groups, and health resources",
    icon: "+",
    route: null,
  },
  {
    title: "BKB Divorce Support",
    description: "Guidance, community, and resources for a fresh start",
    icon: "&",
    route: null,
  },
  {
    title: "BKB Events",
    description: "Discover local community events and meetups",
    icon: "!",
    route: null,
  },
  {
    title: "BKB Forums",
    description: "Join conversations and share ideas",
    icon: "#",
    route: null,
  },
  {
    title: "BKB Marketplace",
    description: "Buy, sell, and trade within the community",
    icon: "%",
    route: null,
  },
];

export default function LandingScreen() {
  const router = useRouter();

  const handleAppPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>BKB</Text>
        <Text style={styles.title}>BKB Community</Text>
        <Text style={styles.subtitle}>
          Your community hub — connect, discover, and grow together
        </Text>
      </View>

      <View style={styles.grid}>
        {APP_LINKS.map((app) => (
          <TouchableOpacity
            key={app.title}
            style={[styles.card, !app.route && styles.cardDisabled]}
            onPress={() => handleAppPress(app.route)}
            activeOpacity={app.route ? 0.7 : 1}
          >
            <Text style={styles.cardIcon}>{app.icon}</Text>
            <Text style={styles.cardTitle}>{app.title}</Text>
            <Text style={styles.cardDescription}>{app.description}</Text>
            {!app.route && (
              <Text style={styles.comingSoon}>Coming Soon</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Part of the BKB Community Network
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FF6B6B",
    letterSpacing: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  comingSoon: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: "#999",
  },
});

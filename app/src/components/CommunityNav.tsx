import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const COMMUNITY_APPS = [
  { title: "Events", icon: "!", route: "/events" },
  { title: "Dating", icon: "<3", route: "/(tabs)/discover" },
  { title: "Hiking", icon: "^", route: "/hiking" },
  { title: "Helpline", icon: "?", route: null },
  { title: "Women", icon: "W", route: null },
  { title: "Career", icon: "C", route: null },
  { title: "Stocks", icon: "$", route: null },
  { title: "Sports", icon: "S", route: null },
  { title: "Health", icon: "+", route: null },
  { title: "Support", icon: "&", route: null },
  { title: "Forums", icon: "#", route: null },
  { title: "Market", icon: "%", route: null },
];

type Props = {
  active?: string; // e.g. "Dating"
};

export default function CommunityNav({ active }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>BKB Community</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {COMMUNITY_APPS.map((app) => {
          const isActive = active === app.title;
          const isDisabled = !app.route;

          return (
            <TouchableOpacity
              key={app.title}
              style={[
                styles.item,
                isActive && styles.itemActive,
                isDisabled && styles.itemDisabled,
              ]}
              onPress={() => {
                if (app.route) {
                  router.replace(app.route as any);
                }
              }}
              activeOpacity={isDisabled ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.icon,
                  isActive && styles.iconActive,
                  isDisabled && styles.iconDisabled,
                ]}
              >
                {app.icon}
              </Text>
              <Text
                style={[
                  styles.title,
                  isActive && styles.titleActive,
                  isDisabled && styles.titleDisabled,
                ]}
                numberOfLines={1}
              >
                {app.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 4,
    paddingBottom: 12,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    color: "#999",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  scrollContent: {
    paddingHorizontal: 6,
  },
  item: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 48,
  },
  itemActive: {
    backgroundColor: "#FFE0E0",
  },
  itemDisabled: {
    opacity: 0.4,
  },
  icon: {
    fontSize: 14,
    color: "#666",
  },
  iconActive: {
    color: "#FF6B6B",
  },
  iconDisabled: {
    color: "#999",
  },
  title: {
    fontSize: 9,
    color: "#666",
    marginTop: 1,
    fontWeight: "500",
  },
  titleActive: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  titleDisabled: {
    color: "#999",
  },
});

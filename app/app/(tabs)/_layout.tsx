import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import CommunityNav from "../../src/components/CommunityNav";

export default function TabLayout() {
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#999",
        headerStyle: { backgroundColor: "#FF6B6B" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          headerTitle: "BKB Dating - Discover",
          tabBarLabel: "Discover",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>{"<3"}</Text>,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          headerTitle: "BKB Dating - Matches",
          tabBarLabel: "Matches",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>{"*"}</Text>,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "BKB Dating - Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>{"@"}</Text>,
        }}
      />
    </Tabs>
    <CommunityNav active="Dating" />
    </>
  );
}

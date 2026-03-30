import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../src/hooks/useAuth";
import { ProfileProvider, useProfileStatus } from "../src/context/ProfileContext";
import { ActivityIndicator, View } from "react-native";

function RootNavigator() {
  const { session, loading } = useAuth();
  const { profileComplete, profileChecked } = useProfileStatus();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profileChecked && session) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      if (profileComplete) {
        router.replace("/(tabs)/discover");
      } else {
        router.replace("/(tabs)/profile");
      }
    } else if (session && !inAuthGroup && profileChecked && !profileComplete) {
      if (segments[1] !== "profile") {
        router.replace("/(tabs)/profile");
      }
    }
  }, [session, loading, segments, profileChecked, profileComplete]);

  if (loading || (session && !profileChecked)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <RootNavigator />
    </ProfileProvider>
  );
}

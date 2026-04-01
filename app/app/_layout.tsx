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
    const inLandingGroup = segments[0] === "(landing)";
    const inPublicGroup =
      segments[0] === "events" || segments[0] === "hiking";

    if (!session && !inAuthGroup && !inLandingGroup && !inPublicGroup) {
      router.replace("/(landing)");
    } else if (session && inAuthGroup) {
      // Logged in user on auth screens → send to app
      if (profileComplete) {
        router.replace("/(tabs)/discover");
      } else {
        router.replace("/(tabs)/profile");
      }
    } else if (session && !inAuthGroup && !inLandingGroup && !inPublicGroup && profileChecked && !profileComplete) {
      // Logged in but profile incomplete → only redirect if inside (tabs) and not on profile
      if (segments[0] === "(tabs)" && (segments as string[])[1] !== "profile") {
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

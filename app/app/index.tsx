import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/(landing)" />;
}

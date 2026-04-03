import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const EXPO_PUBLIC_LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP ?? "127.0.0.1";
const DEFAULT_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_DEFAULT_SUPABASE_ANON_KEY ?? "";

function getDefaultSupabaseUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const { hostname, port } = window.location;
    const isDirectExpoWeb =
      hostname === "localhost" || hostname === "127.0.0.1" || port === "8081";

    return isDirectExpoWeb
      ? `${protocol}//${hostname}:54321`
      : `${protocol}//${hostname}`;
  }

  return `http://${EXPO_PUBLIC_LOCAL_IP}:54321`;
}

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? getDefaultSupabaseUrl();
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    // Lazy-import AsyncStorage to avoid "window is not defined" during static rendering
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

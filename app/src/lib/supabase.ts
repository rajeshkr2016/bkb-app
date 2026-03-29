import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Use localhost for web, LAN IP for mobile devices
const LOCAL_IP = "192.168.68.69";
const SUPABASE_URL =
  Platform.OS === "web"
    ? "http://127.0.0.1:54321"
    : `http://${LOCAL_IP}:54321`;
const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

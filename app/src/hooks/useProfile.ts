import { useState } from "react";
import { supabase } from "../lib/supabase";

export type Profile = {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  bio: string;
  latitude: number | null;
  longitude: number | null;
  distance_pref: number;
  age_min: number;
  age_max: number;
  gender_pref: string;
};

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return { profile: data as Profile | null, error };
  };

  const createProfile = async (profile: Partial<Profile> & { id: string }) => {
    setLoading(true);
    const { error } = await supabase.from("profiles").insert(profile);
    setLoading(false);
    return error;
  };

  const updateProfile = async (
    userId: string,
    updates: Partial<Profile>
  ) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    setLoading(false);
    return error;
  };

  return { getProfile, createProfile, updateProfile, loading };
}

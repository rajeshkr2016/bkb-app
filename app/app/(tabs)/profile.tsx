import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";
import { useProfile, Profile } from "../../src/hooks/useProfile";
import { useProfileStatus } from "../../src/context/ProfileContext";
import { supabase } from "../../src/lib/supabase";

type Interest = { id: string; name: string };

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { getProfile, createProfile, updateProfile, loading } = useProfile();
  const { markProfileComplete } = useProfileStatus();
  const router = useRouter();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");
  const [genderPref, setGenderPref] = useState("all");
  const [hasProfile, setHasProfile] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(new Set());
  const [interestsLoading, setInterestsLoading] = useState(true);

  const isSetupMode = !hasProfile;

  useEffect(() => {
    if (!session) return;

    // Load all interests
    supabase
      .from("interests")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setAllInterests(data);
        setInterestsLoading(false);
      });

    // Load profile and user's selected interests
    getProfile(session.user.id).then(({ profile }) => {
      if (profile) {
        setName(profile.name);
        setDob(profile.date_of_birth);
        setGender(profile.gender);
        setBio(profile.bio || "");
        setGenderPref(profile.gender_pref);
        setHasProfile(true);
      }
    });

    supabase
      .from("profile_interests")
      .select("interest_id")
      .eq("profile_id", session.user.id)
      .then(({ data }) => {
        if (data) {
          setSelectedInterestIds(new Set(data.map((d) => d.interest_id)));
        }
      });
  }, [session]);

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const saveInterests = async () => {
    if (!session) return null;
    // Delete existing and re-insert selected
    const { error: delError } = await supabase
      .from("profile_interests")
      .delete()
      .eq("profile_id", session.user.id);
    if (delError) return delError;

    if (selectedInterestIds.size > 0) {
      const rows = Array.from(selectedInterestIds).map((interest_id) => ({
        profile_id: session.user.id,
        interest_id,
      }));
      const { error: insError } = await supabase
        .from("profile_interests")
        .insert(rows);
      if (insError) return insError;
    }
    return null;
  };

  const handleSave = async () => {
    if (!session) return;
    setStatusMsg("");
    if (!name.trim()) {
      setIsError(true);
      setStatusMsg("Name is required");
      return;
    }
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setIsError(true);
      setStatusMsg("Please enter a valid date of birth (YYYY-MM-DD)");
      return;
    }

    const profileData = {
      id: session.user.id,
      name: name.trim(),
      date_of_birth: dob,
      gender,
      bio,
      gender_pref: genderPref,
    };

    let error;
    if (hasProfile) {
      const { id, ...updates } = profileData;
      error = await updateProfile(session.user.id, updates);
    } else {
      error = await createProfile(profileData);
    }

    if (error) {
      setIsError(true);
      setStatusMsg(error.message);
      return;
    }

    // Save interests
    const intError = await saveInterests();
    if (intError) {
      setIsError(true);
      setStatusMsg(intError.message);
      return;
    }

    setHasProfile(true);
    markProfileComplete();
    setIsError(false);
    setStatusMsg("Profile saved!");
    if (isSetupMode) {
      router.replace("/(tabs)/discover");
    }
  };

  const genders = ["male", "female", "non-binary", "other"];
  const genderPrefs = ["male", "female", "non-binary", "all"];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isSetupMode ? (
        <View style={styles.setupBanner}>
          <Text style={styles.setupTitle}>Complete your profile</Text>
          <Text style={styles.setupText}>
            Set your name, date of birth, and interests to start discovering matches.
          </Text>
        </View>
      ) : null}

      {statusMsg ? (
        <Text style={[styles.status, isError && styles.statusError]}>
          {statusMsg}
        </Text>
      ) : null}

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        placeholder="1995-06-15"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chips}>
        {genders.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, gender === g && styles.chipActive]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us about yourself..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Show Me</Text>
      <View style={styles.chips}>
        {genderPrefs.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, genderPref === g && styles.chipActive]}
            onPress={() => setGenderPref(g)}
          >
            <Text
              style={[styles.chipText, genderPref === g && styles.chipTextActive]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Interests{selectedInterestIds.size > 0 ? ` (${selectedInterestIds.size})` : ""}
      </Text>
      {interestsLoading ? (
        <ActivityIndicator size="small" color="#FF6B6B" />
      ) : (
        <View style={styles.chips}>
          {allInterests.map((interest) => {
            const selected = selectedInterestIds.has(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => toggleInterest(interest.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {interest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : isSetupMode ? "Create Profile" : "Update Profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 48 },
  setupBanner: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 4,
  },
  setupText: {
    fontSize: 14,
    color: "#BF360C",
    lineHeight: 20,
  },
  status: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  statusError: {
    color: "#D32F2F",
    backgroundColor: "#FDECEA",
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  bioInput: { height: 80, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  chipActive: { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  chipText: { color: "#666", fontSize: 14 },
  chipTextActive: { color: "#fff" },
  saveButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 32,
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutText: { color: "#999", fontSize: 16 },
});

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useProfile, Profile } from "../../src/hooks/useProfile";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { getProfile, createProfile, updateProfile, loading } = useProfile();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [bio, setBio] = useState("");
  const [genderPref, setGenderPref] = useState("all");
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!session) return;
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
  }, [session]);

  const handleSave = async () => {
    if (!session) return;
    if (!name || !dob) {
      Alert.alert("Error", "Name and date of birth are required");
      return;
    }

    const profileData = {
      id: session.user.id,
      name,
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
      Alert.alert("Error", error.message);
    } else {
      setHasProfile(true);
      Alert.alert("Success", "Profile saved!");
    }
  };

  const genders = ["male", "female", "non-binary", "other"];
  const genderPrefs = ["male", "female", "non-binary", "all"];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      <Text style={styles.label}>Interested In</Text>
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

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
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

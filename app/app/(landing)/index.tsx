import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

const APP_LINKS = [
  {
    title: "BKB Events",
    description: "Discover local community events and meetups",
    icon: "!",
    route: "/events" as const,
  },
  {
    title: "BKB Dating",
    description: "Find your perfect match in the BKB community",
    icon: "<3",
    route: "/(tabs)/discover" as const,
    requiresAuth: true,
  },
  {
    title: "BKB Hiking",
    description: "Explore trails and join group hikes nearby",
    icon: "^",
    route: "/hiking" as const,
  },
  {
    title: "BKB Helpline",
    description: "24/7 support and resources when you need them",
    icon: "?",
    route: null,
  },
  {
    title: "BKB Women",
    description: "A safe space for women to connect and empower",
    icon: "W",
    route: null,
  },
  {
    title: "BKB Career",
    description: "Job listings, mentorship, and career growth",
    icon: "C",
    route: null,
  },
  {
    title: "BKB Stocks",
    description: "Market insights and investment discussions",
    icon: "$",
    route: null,
  },
  {
    title: "BKB Sports",
    description: "Find teams, leagues, and pickup games",
    icon: "S",
    route: null,
  },
  {
    title: "BKB Health",
    description: "Wellness tips, fitness groups, and health resources",
    icon: "+",
    route: null,
  },
  {
    title: "BKB Divorce Support",
    description: "Guidance, community, and resources for a fresh start",
    icon: "&",
    route: null,
  },
  {
    title: "BKB Forums",
    description: "Join conversations and share ideas",
    icon: "#",
    route: null,
  },
  {
    title: "BKB Marketplace",
    description: "Buy, sell, and trade within the community",
    icon: "%",
    route: null,
  },
];

// --- Multi-layer human verification ---

type ChallengeType = "emoji" | "reverse" | "sequence" | "oddone";

type Challenge = {
  type: ChallengeType;
  question: string;
  answer: string;
  options?: string[]; // for tap-based challenges
  hint?: string;
};

const EMOJI_SETS = [
  { label: "dog", correct: "🐕", decoys: ["🐈", "🐇", "🐿️", "🦊"] },
  { label: "cat", correct: "🐈", decoys: ["🐕", "🐇", "🦝", "🐿️"] },
  { label: "sun", correct: "☀️", decoys: ["🌙", "⭐", "🌧️", "❄️"] },
  { label: "tree", correct: "🌳", decoys: ["🌸", "🌊", "🏔️", "🔥"] },
  { label: "heart", correct: "❤️", decoys: ["⭐", "💎", "🔔", "☁️"] },
  { label: "fish", correct: "🐟", decoys: ["🐦", "🐛", "🦋", "🐌"] },
  { label: "moon", correct: "🌙", decoys: ["☀️", "⭐", "🌈", "☁️"] },
  { label: "car", correct: "🚗", decoys: ["🚢", "✈️", "🚲", "🛹"] },
  { label: "book", correct: "📖", decoys: ["📱", "💻", "🎮", "📺"] },
  { label: "fire", correct: "🔥", decoys: ["💧", "❄️", "🌊", "🌬️"] },
];

const REVERSE_WORDS = [
  "HELLO", "WORLD", "TIGER", "APPLE", "MUSIC",
  "DANCE", "CLOUD", "RIVER", "BEACH", "MAGIC",
  "STONE", "DREAM", "BRAVE", "LIGHT", "OCEAN",
];

const SEQUENCE_CHALLENGES = [
  { seq: "🔴🟢🔵", q: "What color comes 2nd?", a: "🟢" },
  { seq: "🍎🍌🍇🍎", q: "Which fruit appears twice?", a: "🍎" },
  { seq: "⬆️⬇️⬅️➡️", q: "Which arrow points left?", a: "⬅️" },
  { seq: "1️⃣2️⃣3️⃣4️⃣", q: "What comes after 2️⃣?", a: "3️⃣" },
  { seq: "🌑🌓🌕🌗", q: "Which is the full moon?", a: "🌕" },
];

const ODD_ONE_OUT = [
  { items: ["🐕", "🐈", "🐇", "🚗"], answer: "🚗", hint: "One is not an animal" },
  { items: ["🍎", "🍌", "🍇", "⚽"], answer: "⚽", hint: "One is not a fruit" },
  { items: ["🌧️", "☀️", "❄️", "📖"], answer: "📖", hint: "One is not weather" },
  { items: ["🎸", "🎹", "🥁", "🏀"], answer: "🏀", hint: "One is not an instrument" },
  { items: ["🇮🇳", "🇺🇸", "🇬🇧", "🎵"], answer: "🎵", hint: "One is not a flag" },
  { items: ["2", "4", "7", "8"], answer: "7", hint: "One is not even" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateChallenge(): Challenge {
  const types: ChallengeType[] = ["emoji", "reverse", "sequence", "oddone"];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case "emoji": {
      const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
      const options = shuffle([set.correct, ...set.decoys.slice(0, 3)]);
      return {
        type: "emoji",
        question: `Tap the ${set.label}`,
        answer: set.correct,
        options,
      };
    }
    case "reverse": {
      const word =
        REVERSE_WORDS[Math.floor(Math.random() * REVERSE_WORDS.length)];
      return {
        type: "reverse",
        question: `Type this word backwards:\n${word}`,
        answer: word.split("").reverse().join(""),
        hint: `${word.length} letters`,
      };
    }
    case "sequence": {
      const ch =
        SEQUENCE_CHALLENGES[
          Math.floor(Math.random() * SEQUENCE_CHALLENGES.length)
        ];
      const decoys = ["🔴", "🟢", "🔵", "🟡", "⬆️", "⬇️", "⬅️", "➡️",
        "🍎", "🍌", "🍇", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "🌑", "🌓", "🌕", "🌗"];
      const filteredDecoys = decoys.filter((d) => d !== ch.a);
      const picks = shuffle(filteredDecoys).slice(0, 3);
      return {
        type: "sequence",
        question: `${ch.seq}\n${ch.q}`,
        answer: ch.a,
        options: shuffle([ch.a, ...picks]),
      };
    }
    case "oddone": {
      const set =
        ODD_ONE_OUT[Math.floor(Math.random() * ODD_ONE_OUT.length)];
      return {
        type: "oddone",
        question: "Tap the odd one out",
        answer: set.answer,
        options: shuffle([...set.items]),
        hint: set.hint,
      };
    }
  }
}

type AuthMode = "login" | "signup";

export default function LandingScreen() {
  const router = useRouter();
  const { session, signIn, signUp } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Human verification
  const [challenge, setChallenge] = useState(generateChallenge);
  const [captchaInput, setCaptchaInput] = useState("");
  const [verified, setVerified] = useState(false);

  // Refs for field chaining
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const captchaRef = useRef<TextInput>(null);

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setCaptchaInput("");
    setVerified(false);
    setChallenge(generateChallenge());
  }, []);

  const handleVerify = (tappedOption?: string) => {
    const userAnswer = tappedOption || captchaInput.trim();
    if (!userAnswer || userAnswer !== challenge.answer) {
      setErrorMsg("Wrong answer. Try again.");
      setCaptchaInput("");
      setChallenge(generateChallenge());
      return;
    }
    setVerified(true);
    setErrorMsg("");
  };

  const handleLogin = async () => {
    setErrorMsg("");
    if (!verified) {
      setErrorMsg("Please complete the human verification first");
      return;
    }
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const error = await signIn(email, password);
      if (error) setErrorMsg(error.message);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setErrorMsg("");
    if (!verified) {
      setErrorMsg("Please complete the human verification first");
      return;
    }
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const error = await signUp(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.replace({ pathname: "/(auth)/confirm", params: { email } });
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? "An unexpected error occurred.");
    }
    setLoading(false);
  };

  const handleAppPress = (app: (typeof APP_LINKS)[number]) => {
    if (!app.route) return;
    if ("requiresAuth" in app && app.requiresAuth && !session) {
      setAuthMode("login");
      resetForm();
      return;
    }
    router.push(app.route as any);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>BKB</Text>
          <Text style={styles.title}>BKB Community</Text>
          <Text style={styles.subtitle}>
            Your community hub — connect, discover, and grow together
          </Text>
        </View>

        {/* Auth section — shown by default for unauthenticated users */}
        {!session && (
          <View style={styles.authSection}>
            <View style={styles.authCard}>
              {/* Mode tabs */}
              <View style={styles.authTabs}>
                <TouchableOpacity
                  style={[
                    styles.authTab,
                    authMode === "login" && styles.authTabActive,
                  ]}
                  onPress={() => switchMode("login")}
                >
                  <Text
                    style={[
                      styles.authTabText,
                      authMode === "login" && styles.authTabTextActive,
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.authTab,
                    authMode === "signup" && styles.authTabActive,
                  ]}
                  onPress={() => switchMode("signup")}
                >
                  <Text
                    style={[
                      styles.authTabText,
                      authMode === "signup" && styles.authTabTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {errorMsg ? (
                <Text style={styles.error}>{errorMsg}</Text>
              ) : null}

              {/* Human verification */}
              {!verified ? (
                <View style={styles.captchaBox}>
                  <Text style={styles.captchaTitle}>
                    Are you human?
                  </Text>
                  <Text style={styles.captchaQuestion}>
                    {challenge.question}
                  </Text>
                  {challenge.hint && (
                    <Text style={styles.captchaHint}>
                      Hint: {challenge.hint}
                    </Text>
                  )}

                  {/* Tap-based challenges (emoji, sequence, oddone) */}
                  {challenge.options ? (
                    <View style={styles.optionsGrid}>
                      {challenge.options.map((opt, i) => (
                        <TouchableOpacity
                          key={`${opt}-${i}`}
                          style={styles.optionButton}
                          onPress={() => handleVerify(opt)}
                        >
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    /* Text-based challenges (reverse) */
                    <View style={styles.captchaRow}>
                      <TextInput
                        ref={captchaRef}
                        style={styles.captchaInput}
                        value={captchaInput}
                        onChangeText={setCaptchaInput}
                        autoCapitalize="characters"
                        placeholder="Type your answer"
                        placeholderTextColor="#999"
                        returnKeyType="done"
                        onSubmitEditing={() => handleVerify()}
                      />
                      <TouchableOpacity
                        style={styles.captchaButton}
                        onPress={() => handleVerify()}
                      >
                        <Text style={styles.captchaButtonText}>Verify</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setChallenge(generateChallenge());
                      setCaptchaInput("");
                      setErrorMsg("");
                    }}
                  >
                    <Text style={styles.captchaRefresh}>
                      New challenge
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>
                    Verified — you're human
                  </Text>
                </View>
              )}

              {/* Auth fields (shown after verification) */}
              {verified && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#999"
                    returnKeyType={authMode === "signup" ? "next" : "go"}
                    onSubmitEditing={
                      authMode === "signup"
                        ? () => confirmRef.current?.focus()
                        : handleLogin
                    }
                    blurOnSubmit={authMode !== "signup"}
                  />
                  {authMode === "signup" && (
                    <TextInput
                      ref={confirmRef}
                      style={styles.input}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholderTextColor="#999"
                      returnKeyType="go"
                      onSubmitEditing={handleSignUp}
                    />
                  )}

                  <TouchableOpacity
                    style={[styles.authButton, loading && styles.authButtonDisabled]}
                    onPress={authMode === "login" ? handleLogin : handleSignUp}
                    disabled={loading}
                  >
                    <Text style={styles.authButtonText}>
                      {loading
                        ? "Please wait..."
                        : authMode === "login"
                        ? "Log In"
                        : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* No cancel button — auth is required */}
            </View>
          </View>
        )}

        {/* Logged in indicator */}
        {session && (
          <View style={styles.loggedInBadge}>
            <Text style={styles.loggedInText}>
              Logged in as {session.user.email}
            </Text>
          </View>
        )}

        {/* App grid */}
        <View style={styles.grid}>
          {APP_LINKS.map((app) => {
            const isDisabled = !app.route;
            const needsAuth =
              "requiresAuth" in app && app.requiresAuth && !session;

            return (
              <TouchableOpacity
                key={app.title}
                style={[styles.card, isDisabled && styles.cardDisabled]}
                onPress={() => handleAppPress(app)}
                activeOpacity={isDisabled ? 1 : 0.7}
              >
                <Text style={styles.cardIcon}>{app.icon}</Text>
                <Text style={styles.cardTitle}>{app.title}</Text>
                <Text style={styles.cardDescription}>{app.description}</Text>
                {isDisabled && (
                  <Text style={styles.comingSoon}>Coming Soon</Text>
                )}
                {needsAuth && (
                  <Text style={styles.loginRequired}>Login Required</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Part of the BKB Community Network
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingTop: 60 },

  // Header
  header: { alignItems: "center", marginBottom: 24 },
  logo: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FF6B6B",
    letterSpacing: 4,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 8 },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  // Auth section
  authSection: { marginBottom: 24 },
  authCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  authTabs: { flexDirection: "row", marginBottom: 16 },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
  },
  authTabActive: { borderBottomColor: "#FF6B6B" },
  authTabText: { fontSize: 15, color: "#999", fontWeight: "500" },
  authTabTextActive: { color: "#FF6B6B", fontWeight: "700" },

  error: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#FDECEA",
    padding: 10,
    borderRadius: 8,
  },

  // Captcha
  captchaBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginBottom: 12,
  },
  captchaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  captchaQuestion: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6B6B",
    marginBottom: 12,
  },
  captchaRow: { flexDirection: "row", gap: 10, width: "100%" },
  captchaInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  captchaButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  captchaButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  captchaHint: {
    fontSize: 13,
    color: "#888",
    marginBottom: 10,
    fontStyle: "italic",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginBottom: 4,
  },
  optionButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 70,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  captchaRefresh: {
    color: "#999",
    fontSize: 13,
    marginTop: 10,
    textDecorationLine: "underline",
  },

  verifiedBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  verifiedText: { color: "#2E7D32", fontWeight: "600", fontSize: 14 },

  // Auth inputs
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  authButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  authButtonDisabled: { opacity: 0.6 },
  authButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  closeAuth: { marginTop: 12, alignItems: "center" },
  closeAuthText: { color: "#999", fontSize: 14 },

  // Logged in
  loggedInBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  loggedInText: { color: "#2E7D32", fontWeight: "500", fontSize: 13 },

  // Grid
  grid: { gap: 16 },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardDisabled: { opacity: 0.55 },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 4 },
  cardDescription: { fontSize: 14, color: "#666", lineHeight: 20 },
  comingSoon: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loginRequired: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#1565C0",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Footer
  footer: { alignItems: "center", marginTop: 40, paddingBottom: 40 },
  footerText: { fontSize: 13, color: "#999" },
});

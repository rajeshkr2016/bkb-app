import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

export default function ConfirmScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resending, setResending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setStatusMsg("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (error) {
      setIsError(true);
      setStatusMsg(error.message);
    } else {
      setIsError(false);
      setStatusMsg("A new confirmation email has been sent.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.body}>
          We sent a confirmation link to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.hint}>
          Tap the link in the email to verify your account, then come back here
          to log in.
        </Text>

        {statusMsg ? (
          <Text style={[styles.status, isError && styles.statusError]}>
            {statusMsg}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.resendButton, resending && styles.resendDisabled]}
          onPress={handleResend}
          disabled={resending}
        >
          <Text style={styles.resendText}>
            {resending ? "Sending..." : "Resend confirmation email"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>
              Already confirmed? <Text style={styles.loginBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, justifyContent: "center", padding: 24, alignItems: "center" },
  icon: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  email: { fontWeight: "600", color: "#333" },
  hint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
    width: "100%",
  },
  statusError: {
    color: "#D32F2F",
    backgroundColor: "#FDECEA",
  },
  resendButton: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  resendDisabled: { opacity: 0.5 },
  resendText: { color: "#FF6B6B", fontSize: 16, fontWeight: "600" },
  loginButton: { marginTop: 4, alignItems: "center" },
  loginText: { color: "#666", fontSize: 14 },
  loginBold: { color: "#FF6B6B", fontWeight: "600" },
});

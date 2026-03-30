import { useEffect, useRef, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const signingUp = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't auto-set session during signup — let the signup flow handle navigation
      if (signingUp.current) return;
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    signingUp.current = true;
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      // Supabase returns a user with empty identities (instead of an error)
      // when the email is already registered — detect this as a duplicate
      if (!error && data?.user?.identities?.length === 0) {
        return { message: "An account with this email already exists." };
      }
      if (error) return error;
      // Clear any auto-created session so user must confirm email first
      await supabase.auth.signOut().catch(() => {});
      return null;
    } finally {
      signingUp.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, loading, signUp, signIn, signOut };
}

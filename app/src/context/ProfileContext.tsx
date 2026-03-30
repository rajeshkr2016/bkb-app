import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

type ProfileStatus = {
  profileComplete: boolean;
  profileChecked: boolean;
  markProfileComplete: () => void;
};

const ProfileContext = createContext<ProfileStatus>({
  profileComplete: false,
  profileChecked: false,
  markProfileComplete: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { getProfile } = useProfile();
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (loading || !session) {
      setProfileChecked(false);
      setProfileComplete(false);
      return;
    }
    getProfile(session.user.id).then(({ profile }) => {
      setProfileComplete(!!profile?.name && !!profile?.date_of_birth);
      setProfileChecked(true);
    });
  }, [session, loading]);

  const markProfileComplete = () => {
    setProfileComplete(true);
  };

  return (
    <ProfileContext.Provider value={{ profileComplete, profileChecked, markProfileComplete }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileStatus = () => useContext(ProfileContext);

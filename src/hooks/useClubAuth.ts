import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CLUB_EMAILS = [
  "cie@mlrit.ac.in",
  "codeclub@mlrit.ac.in",
  "cameclub@mlrit.ac.in",
  "scopeclub@mlrit.ac.in",
  "clubliterati@mlrit.ac.in",
  "apex@mlrit.ac.in",
];

export interface ClubInfo {
  id: string;
  club_name: string;
  email: string;
  instagram_url: string;
}

export function useClubAuth() {
  const [club, setClub] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email?.toLowerCase() || null;
      setUserEmail(email);

      if (email && CLUB_EMAILS.includes(email)) {
        const { data } = await supabase
          .from("clubs")
          .select("*")
          .eq("email", email)
          .single();
        setClub(data as ClubInfo | null);
      } else {
        setClub(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase() || null;
      setUserEmail(email);

      if (email && CLUB_EMAILS.includes(email)) {
        const { data } = await supabase
          .from("clubs")
          .select("*")
          .eq("email", email)
          .single();
        setClub(data as ClubInfo | null);
      } else {
        setClub(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isClubUser = !!club;

  const logout = async () => {
    await supabase.auth.signOut();
    setClub(null);
    setUserEmail(null);
  };

  return { club, loading, isClubUser, userEmail, logout };
}

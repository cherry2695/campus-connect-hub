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
const ADMIN_EMAIL = "mlritclgadmin@mlrit.ac.in";
const STUDENT_PATTERN = /^\d{2}r\d{2}a\d{2}[a-z]\d+@mlrit\.ac\.in$/i;

export interface FacultyProfile {
  id: string;
  name: string;
  department: string;
  contact: string;
  email: string;
  avatar_url: string | null;
}

export function useFacultyAuth() {
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFaculty, setIsFaculty] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkFaculty = (email: string | null): boolean => {
    if (!email) return false;
    const e = email.toLowerCase();
    if (CLUB_EMAILS.includes(e)) return false;
    if (e === ADMIN_EMAIL) return false;
    if (STUDENT_PATTERN.test(e)) return false;
    if (!e.endsWith("@mlrit.ac.in")) return false;
    return true;
  };

  const fetchProfile = async (uid: string, email: string) => {
    const { data } = await supabase
      .from("faculty_profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (data) {
      setProfile(data as FacultyProfile);
    } else {
      // Create profile
      const newProfile: FacultyProfile = {
        id: uid,
        name: "",
        department: "",
        contact: "",
        email,
        avatar_url: null,
      };
      await supabase.from("faculty_profiles").insert(newProfile);
      setProfile(newProfile);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const email = session?.user?.email?.toLowerCase() || null;
      const uid = session?.user?.id || null;
      setUserEmail(email);
      setUserId(uid);
      const faculty = checkFaculty(email);
      setIsFaculty(faculty);

      if (faculty && uid && email) {
        await fetchProfile(uid, email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const email = session?.user?.email?.toLowerCase() || null;
      const uid = session?.user?.id || null;
      setUserEmail(email);
      setUserId(uid);
      const faculty = checkFaculty(email);
      setIsFaculty(faculty);

      if (faculty && uid && email) {
        await fetchProfile(uid, email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<FacultyProfile>) => {
    if (!userId) return;
    const { error } = await supabase
      .from("faculty_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    return error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsFaculty(false);
  };

  return { profile, loading, isFaculty, userId, userEmail, updateProfile, logout, setProfile };
}

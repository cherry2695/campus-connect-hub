import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFacultyAuth } from "@/hooks/useFacultyAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Loader2, LogOut, User, ChevronLeft, ChevronRight, Search,
  Calendar, MapPin, Clock, Tag, Upload, X, CheckCircle2, Bell, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

import icasmmt from "@/assets/slides/icasmmt.png";
import startupDay from "@/assets/slides/startup-day.png";
import mlritLogo from "@/assets/mlrit-logo.png";

const SLIDES = [
  { src: icasmmt, alt: "ICASMMT 2025" },
  { src: startupDay, alt: "National Startup Day" },
];

interface Program {
  id: string;
  title: string;
  short_description: string;
  description: string;
  program_type: string;
  mode: string;
  start_datetime: string;
  end_datetime: string;
  venue: string;
  banner_image_url: string;
  status: string;
}

interface Registration {
  id: string;
  program_id: string;
  faculty_name: string;
  registered_at: string;
}

export default function FacultyDashboard() {
  const { profile, loading, isFaculty, userId, userEmail, updateProfile, logout, setProfile } = useFacultyAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showRegister, setShowRegister] = useState<Program | null>(null);
  const [regForm, setRegForm] = useState({ faculty_name: "", department: "", contact: "", organization_role: "" });
  const [savingReg, setSavingReg] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", department: "", contact: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !isFaculty) navigate("/login", { replace: true });
  }, [loading, isFaculty]);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isFaculty) return;
    fetchPrograms();
    fetchRegistrations();
  }, [isFaculty]);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name, department: profile.department, contact: profile.contact });
    }
  }, [profile]);

  useEffect(() => {
    if (showRegister && profile) {
      setRegForm({
        faculty_name: profile.name,
        department: profile.department,
        contact: profile.contact,
        organization_role: "",
      });
    }
  }, [showRegister, profile]);

  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    const { data } = await supabase
      .from("faculty_programs")
      .select("*")
      .order("start_datetime", { ascending: false });
    setPrograms((data as Program[]) || []);
    setLoadingPrograms(false);
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from("faculty_registrations")
      .select("id, program_id, faculty_name, registered_at");
    setRegistrations((data as Registration[]) || []);
  };

  const isRegistered = (programId: string) => registrations.some((r) => r.program_id === programId);

  const handleRegister = async () => {
    if (!showRegister || !userId || !userEmail) return;
    if (!regForm.faculty_name || !regForm.department || !regForm.contact) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSavingReg(true);
    const { error } = await supabase.from("faculty_registrations").insert({
      program_id: showRegister.id,
      faculty_id: userId,
      faculty_name: regForm.faculty_name,
      department: regForm.department,
      contact: regForm.contact,
      email: userEmail,
      organization_role: regForm.organization_role,
    });
    setSavingReg(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Successfully registered for the program" });
      setShowRegister(null);
      fetchRegistrations();
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    let avatar_url = profile?.avatar_url || null;

    if (avatarFile && userId) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl + "?t=" + Date.now();
      }
    }

    const err = await updateProfile({ ...profileForm, avatar_url });
    setSavingProfile(false);
    if (err) {
      toast({ title: "Error saving profile", variant: "destructive" });
    } else {
      if (avatar_url && profile) setProfile({ ...profile, ...profileForm, avatar_url });
      toast({ title: "Profile saved!" });
      setShowProfile(false);
      setAvatarFile(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const filtered = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return programs.filter((program) => {
      const normalizedType = program.program_type.toLowerCase();
      const normalizedMode = program.mode.toLowerCase();
      const searchableText = [program.title, program.short_description, program.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (filterType !== "all" && normalizedType !== filterType.toLowerCase()) return false;
      if (filterMode !== "all" && normalizedMode !== filterMode.toLowerCase()) return false;
      if (normalizedSearch && !searchableText.includes(normalizedSearch)) return false;

      return true;
    });
  }, [filterMode, filterType, programs, searchQuery]);

  const featured = programs.filter((p) => p.status === "upcoming").slice(0, 4);
  const available = filtered.filter((p) => p.status !== "completed");
  const past = filtered.filter((p) => p.status === "completed");
  const myPrograms = filtered.filter((p) => isRegistered(p.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isFaculty) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={mlritLogo} alt="MLRIT" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-gray-900 hidden sm:block">Faculty Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {profile?.name || "Profile"}
              </span>
            </button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <section className="relative w-full overflow-hidden bg-gray-900 max-w-7xl mx-auto mt-4 rounded-2xl" style={{ aspectRatio: "16 / 5" }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={slideIndex}
            src={SLIDES[slideIndex].src}
            alt={SLIDES[slideIndex].alt}
            className="absolute inset-0 w-full h-full object-cover object-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="w-full px-6 pb-6 sm:pb-8">
            <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-bold drop-shadow-lg">
              Explore Faculty Programs & Development Opportunities
            </h2>
            <p className="text-white/70 text-sm mt-1">Stay updated with the latest happenings</p>
          </div>
        </div>
        <button
          onClick={() => setSlideIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        <button
          onClick={() => setSlideIndex((i) => (i + 1) % SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === slideIndex ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Featured Programs */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Featured Programs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <ProgramCard key={p.id} program={p} registered={isRegistered(p.id)} onRegister={() => setShowRegister(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="available">Available Programs</TabsTrigger>
            <TabsTrigger value="my">My Programs</TabsTrigger>
            <TabsTrigger value="past">Past Programs</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FDP">FDP</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Startup Program">Startup Program</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="w-40 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="available">
            {loadingPrograms ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : available.length === 0 ? (
              <EmptyState text="No programs available at the moment." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {available.map((p) => (
                  <ProgramCard key={p.id} program={p} registered={isRegistered(p.id)} onRegister={() => setShowRegister(p)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            {myPrograms.length === 0 ? (
              <EmptyState text="You haven't registered for any programs yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} registered={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState text="No past programs found." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {past.map((p) => (
                  <Card key={p.id} className="overflow-hidden bg-white border-gray-200">
                    {p.banner_image_url && (
                      <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                        <img src={p.banner_image_url} alt={p.title} className="h-full w-full object-cover object-center" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{format(new Date(p.start_datetime), "MMM dd, yyyy")}</p>
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">Completed</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Registration Modal */}
      <Dialog open={!!showRegister} onOpenChange={() => setShowRegister(null)}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {showRegister?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Faculty Name *</Label>
              <Input value={regForm.faculty_name} onChange={(e) => setRegForm((p) => ({ ...p, faculty_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Department *</Label>
              <Input value={regForm.department} onChange={(e) => setRegForm((p) => ({ ...p, department: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Contact Number *</Label>
              <Input value={regForm.contact} onChange={(e) => setRegForm((p) => ({ ...p, contact: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={userEmail || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label>Organization/Department Role (optional)</Label>
              <Input value={regForm.organization_role} onChange={(e) => setRegForm((p) => ({ ...p, organization_role: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegister(null)}>Cancel</Button>
            <Button onClick={handleRegister} disabled={savingReg} className="bg-blue-600 hover:bg-blue-700 text-white">
              {savingReg ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering...</> : "Submit Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              )}
              <label className="cursor-pointer text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Upload className="h-4 w-4" /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </label>
              {avatarFile && <span className="text-xs text-gray-500">{avatarFile.name}</span>}
            </div>
            <div className="space-y-1">
              <Label>Faculty Name</Label>
              <Input value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Department</Label>
              <Input value={profileForm.department} onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Contact Number</Label>
              <Input value={profileForm.contact} onChange={(e) => setProfileForm((p) => ({ ...p, contact: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={userEmail || ""} readOnly className="bg-gray-50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowProfile(false); setAvatarFile(null); }}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700 text-white">
              {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500 mt-8">
        © 2026 MLRIT Campus Connect — Faculty Portal
      </footer>
    </div>
  );
}

function ProgramCard({ program, registered, onRegister }: { program: Program; registered: boolean; onRegister?: () => void }) {
  const statusColor = program.status === "upcoming" ? "bg-blue-100 text-blue-700" : program.status === "ongoing" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
  return (
    <Card className="overflow-hidden bg-white border-gray-200 hover:shadow-md transition-shadow">
      {program.banner_image_url && (
        <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
          <img src={program.banner_image_url} alt={program.title} className="h-full w-full object-cover object-center" />
        </div>
      )}
      {!program.banner_image_url && (
        <div className="aspect-[4/5] w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <Calendar className="h-10 w-10 text-blue-300" />
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{program.title}</h3>
          <Badge className={statusColor + " shrink-0 capitalize"}>{program.status}</Badge>
        </div>
        {program.short_description && (
          <p className="text-sm text-gray-500 line-clamp-2">{program.short_description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(program.start_datetime), "MMM dd, yyyy")}</span>
          <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{program.program_type}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{program.mode}</span>
        </div>
        {onRegister && !registered && program.status !== "completed" && (
          <Button size="sm" onClick={onRegister} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
            Register
          </Button>
        )}
        {registered && (
          <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
            <CheckCircle2 className="h-4 w-4" /> Registered
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>{text}</p>
    </div>
  );
}

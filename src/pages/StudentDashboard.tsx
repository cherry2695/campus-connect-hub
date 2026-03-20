import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Calendar, Clock, ChevronLeft, ChevronRight, X, CheckCircle2, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

import ecstacy from "@/assets/events/ecstacy.png";
import equinox from "@/assets/events/equinox.jpeg";
import innovation from "@/assets/events/innovation-challenge.png";
import kiteFestival from "@/assets/events/kite-festival.jpg";
import trishna from "@/assets/events/trishna.jpg";
import workshopCarnival from "@/assets/events/workshop-carnival.png";
import zenith from "@/assets/events/zenith.jpg";
import zignasa from "@/assets/events/zignasa.jpeg";

// Banner slides
import slideB2b from "@/assets/slides/b2b.png";
import slideEquinox from "@/assets/slides/equinox.png";
import slideZignasa from "@/assets/slides/zignasa.png";
import slideMetaLoop from "@/assets/slides/meta-loop.png";
import slideProjectExpo from "@/assets/slides/project-expo.png";

// Club logos
import cieLogo from "@/assets/clubs/cie.png";
import codeClubLogo from "@/assets/clubs/codeclub.png";
import cameClubLogo from "@/assets/clubs/cameclub.png";
import scopeClubLogo from "@/assets/clubs/scopeclub.png";
import clubLiteratiLogo from "@/assets/clubs/clubliterati.png";
import apexLogo from "@/assets/clubs/apex.png";

// ---------- DATA ----------
const heroSlides = [slideB2b, slideEquinox, slideZignasa, slideMetaLoop, slideProjectExpo];

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  status: "live" | "upcoming" | "past";
  fee: number;
}

const EVENTS: EventData[] = [
  { id: "1", title: "Workshop Carnival", description: "Create. Innovate. Excel – Workshops on UI/UX, Web Dev, AI & more", date: "10-11 Apr 2025", time: "9:00 AM", image: workshopCarnival, status: "live", fee: 200 },
  { id: "2", title: "Ecstacy 2025", description: "Rock On and Rave Off – Annual music & cultural fest by CAME Club", date: "26 Apr 2025", time: "5:30 PM", image: ecstacy, status: "past", fee: 150 },
  { id: "3", title: "Zenith 2025", description: "The Cloud Voyage – 2-Day Hackathon & AWS Community Day", date: "18-20 Dec 2024", time: "10:00 AM", image: zenith, status: "past", fee: 300 },
  { id: "4", title: "Zignasa 2025", description: "24HR National Level Hackathon – Domains: AI, Web Dev, UI/UX", date: "28-29 Nov 2024", time: "9:00 AM", image: zignasa, status: "past", fee: 250 },
  { id: "5", title: "Equinox E-Summit 2K24", description: "Where Passion Meets Perseverance – Startup Expo, Ideathon & more", date: "28-30 Nov 2024", time: "10:00 AM", image: equinox, status: "past", fee: 200 },
  { id: "6", title: "Innovation Challenge 2K25", description: "Project Expo with ₹18,000 prize pool in collaboration with S&H Dept", date: "25 Jan 2025", time: "9:00 AM", image: innovation, status: "past", fee: 100 },
  { id: "7", title: "Kite Festival 2025", description: "Annual kite flying celebration at MLRIT Grounds", date: "10 Jan 2025", time: "2:00 PM", image: kiteFestival, status: "past", fee: 50 },
  { id: "8", title: "Trishna 2K25", description: "21st Annual Day celebrations – Save the Date!", date: "13 Mar 2025", time: "5:00 PM", image: trishna, status: "past", fee: 100 },
];

const CLUBS = [
  { id: "cie", name: "CIE", logo: cieLogo },
  { id: "codeclub", name: "Code Club", logo: codeClubLogo },
  { id: "cameclub", name: "CAME Club", logo: cameClubLogo },
  { id: "scopeclub", name: "SCOPE Club", logo: scopeClubLogo },
  { id: "clubliterati", name: "Club Literati", logo: clubLiteratiLogo },
  { id: "apex", name: "APEX", logo: apexLogo },
];

const DEPARTMENTS = ["CSE", "CSM", "CSD", "IT", "CSIT", "ECE", "EEE", "MECH", "AERO"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

type Tab = "home" | "bookings" | "past";

interface ProfileData {
  name: string;
  photo: string | null;
  year: string;
  department: string;
  contact: string;
  personalEmail: string;
}

interface RegistrationData {
  studentName: string;
  rollNo: string;
  department: string;
  year: string;
  teamName: string;
}

type RegistrationStep = "form" | "payment" | "success";

// ---------- COMPONENTS ----------

const DashboardNavbar: React.FC<{
  onProfileClick: () => void;
  onLogout: () => void;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  avatarUrl: string | null;
}> = ({ onProfileClick, onLogout, activeTab, setActiveTab, avatarUrl }) => (
  <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
      <span className="font-bold text-lg sm:text-xl text-primary shrink-0">Campus Connect</span>
      <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
        {(["home", "bookings", "past"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          >
            {tab === "home" ? "Home" : tab === "bookings" ? "Bookings" : "Past Events"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onProfileClick} className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors flex items-center justify-center bg-secondary">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-xs">
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </div>
    </div>
  </nav>
);

const HeroSlider: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setIndex(i => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex(i => (i + dir + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-foreground" style={{ aspectRatio: "3 / 1" }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={index}
          src={heroSlides[index]}
          alt={`Event ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover object-center"
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">Discover Campus Events</h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1">Stay updated with the latest happenings</p>
      </div>
      <button onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1.5 sm:p-2 shadow transition-all" aria-label="Previous">
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground rounded-full p-1.5 sm:p-2 shadow transition-all" aria-label="Next">
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "bg-white w-5" : "bg-white/50 w-1.5"}`} />
        ))}
      </div>
    </section>
  );
};

const EventCard: React.FC<{ event: EventData; onRegister?: (e: EventData) => void; isPast?: boolean }> = ({ event, onRegister, isPast }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
  >
    <div className="aspect-[4/5] overflow-hidden bg-secondary">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-tight">{event.title}</h3>
        {isPast && <Badge variant="secondary" className="bg-secondary text-muted-foreground text-[10px] shrink-0">Completed</Badge>}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
      </div>
      {!isPast && onRegister && (
        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs" onClick={() => onRegister(event)}>
          Register • ₹{event.fee}
        </Button>
      )}
    </div>
  </motion.div>
);

const BrowseByClub: React.FC = () => (
  <section>
    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Browse by Club</h2>
    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-3 scrollbar-hide">
      {CLUBS.map(club => (
        <motion.button key={club.id} whileHover={{ scale: 1.12 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className="w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full border-2 border-border group-hover:border-primary overflow-hidden transition-all duration-300 shadow-sm group-hover:shadow-lg bg-white">
            <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-primary font-medium transition-colors whitespace-nowrap">{club.name}</span>
        </motion.button>
      ))}
    </div>
  </section>
);

const RegisterModal: React.FC<{
  event: EventData;
  onClose: () => void;
  onComplete: (data: RegistrationData) => void;
  profileName: string;
  profileDept: string;
  profileYear: string;
}> = ({ event, onClose, onComplete, profileName, profileDept, profileYear }) => {
  const [step, setStep] = useState<RegistrationStep>("form");
  const [formData, setFormData] = useState<RegistrationData>({
    studentName: profileName,
    rollNo: "",
    department: profileDept,
    year: profileYear,
    teamName: "",
  });

  const canSubmitForm = formData.studentName.trim() && formData.rollNo.trim() && formData.department && formData.year;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>

        {step === "form" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Register for {event.title}</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><Label>Student Name *</Label><Input value={formData.studentName} onChange={e => setFormData(d => ({ ...d, studentName: e.target.value }))} placeholder="Your name" className="mt-1" /></div>
              <div><Label>Roll Number *</Label><Input value={formData.rollNo} onChange={e => setFormData(d => ({ ...d, rollNo: e.target.value }))} placeholder="e.g. 22R11A0501" className="mt-1" /></div>
              <div>
                <Label>Department *</Label>
                <select value={formData.department} onChange={e => setFormData(d => ({ ...d, department: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Pursuing Year *</Label>
                <select value={formData.year} onChange={e => setFormData(d => ({ ...d, year: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div><Label>Team Name (Optional)</Label><Input value={formData.teamName} onChange={e => setFormData(d => ({ ...d, teamName: e.target.value }))} placeholder="Enter team name" className="mt-1" /></div>
              <Button className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={!canSubmitForm} onClick={() => setStep("payment")}>
                Proceed to Payment • ₹{event.fee}
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Payment</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="flex flex-col items-center py-6">
              <p className="text-sm text-muted-foreground mb-4">Scan the QR code to pay <span className="font-bold text-foreground">₹{event.fee}</span></p>
              <div className="w-48 h-48 bg-secondary border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center mb-6">
                <QrCode className="h-20 w-20 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Dummy QR Scanner</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Event: {event.title}</p>
              <p className="text-xs text-muted-foreground mb-6">Student: {formData.studentName} ({formData.rollNo})</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setStep("success")}>
                Payment Done
              </Button>
              <button onClick={() => setStep("form")} className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to form</button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-foreground mb-2">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Successfully registered for <span className="font-semibold text-foreground">{event.title}</span>
            </p>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 w-full text-sm space-y-1 mb-6">
              <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{formData.studentName}</span></p>
              <p><span className="text-muted-foreground">Roll No:</span> <span className="font-medium text-foreground">{formData.rollNo}</span></p>
              <p><span className="text-muted-foreground">Amount Paid:</span> <span className="font-medium text-green-600">₹{event.fee}</span></p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => { onComplete(formData); onClose(); }}>
              Done
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ProfileModal: React.FC<{
  profile: ProfileData;
  onSave: (p: ProfileData, file: File | null) => void;
  onClose: () => void;
  saving: boolean;
}> = ({ profile, onSave, onClose, saving }) => {
  const [data, setData] = useState(profile);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Profile</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-secondary border-2 border-border overflow-hidden mb-3 flex items-center justify-center">
            {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="h-10 w-10 text-muted-foreground" />}
          </div>
          <label className="text-sm text-primary hover:text-primary/80 cursor-pointer font-medium">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        <div className="space-y-4">
          <div><Label>Student Name</Label><Input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} className="mt-1" /></div>
          <div>
            <Label>Student Year</Label>
            <select value={data.year} onChange={e => setData(d => ({ ...d, year: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <Label>Department</Label>
            <select value={data.department} onChange={e => setData(d => ({ ...d, department: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><Label>Contact Number</Label><Input value={data.contact} onChange={e => setData(d => ({ ...d, contact: e.target.value }))} placeholder="+91 XXXXXXXXXX" className="mt-1" /></div>
          <div><Label>Personal Email</Label><Input type="email" value={data.personalEmail} onChange={e => setData(d => ({ ...d, personalEmail: e.target.value }))} placeholder="your@email.com" className="mt-1" /></div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={() => onSave(data, photoFile)} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ---------- MAIN ----------
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showProfile, setShowProfile] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<ProfileData>({ name: "", photo: null, year: "", department: "", contact: "", personalEmail: "" });
  const [userId, setUserId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Check auth & load profile
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUserId(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load profile when userId is set
  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) {
        setProfile({
          name: data.name || "",
          photo: data.avatar_url || null,
          year: data.year || "",
          department: data.department || "",
          contact: data.contact || "",
          personalEmail: data.personal_email || "",
        });
      }
      // Load registrations
      const { data: regs } = await supabase.from("event_registrations").select("event_id").eq("user_id", userId);
      if (regs) {
        setRegisteredIds(new Set(regs.map(r => r.event_id)));
      }
    };
    loadProfile();
  }, [userId]);

  const handleSaveProfile = useCallback(async (p: ProfileData, photoFile: File | null) => {
    if (!userId) return;
    setSavingProfile(true);

    let avatarUrl = p.photo;

    // Upload photo if new file selected
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const filePath = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, photoFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl + "?t=" + Date.now();
      }
    }

    await supabase.from("profiles").update({
      name: p.name,
      year: p.year,
      department: p.department,
      contact: p.contact,
      personal_email: p.personalEmail,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    setProfile({ ...p, photo: avatarUrl });
    setSavingProfile(false);
    setShowProfile(false);
    setSuccessMsg("Profile saved successfully");
  }, [userId]);

  const handleRegistrationComplete = useCallback(async (formData: RegistrationData) => {
    if (!registerEvent || !userId) return;
    setRegisteredIds(prev => new Set(prev).add(registerEvent.id));

    await supabase.from("event_registrations").insert({
      user_id: userId,
      event_id: registerEvent.id,
      student_name: formData.studentName,
      roll_no: formData.rollNo,
      department: formData.department,
      year: formData.year,
      team_name: formData.teamName,
      amount_paid: registerEvent.fee,
    });

    setSuccessMsg(`Successfully registered for ${registerEvent.title}`);
  }, [registerEvent, userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Auto-dismiss success toast
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const liveEvents = EVENTS.filter(e => e.status === "live" || e.status === "upcoming");
  const pastEvents = EVENTS.filter(e => e.status === "past");

  return (
    <div className="min-h-screen bg-secondary/50 overflow-x-hidden">
      <DashboardNavbar
        onProfileClick={() => setShowProfile(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        avatarUrl={profile.photo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {activeTab === "home" && (
          <>
            <HeroSlider />
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Live Now</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {liveEvents.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <EventCard event={event} onRegister={registeredIds.has(event.id) ? undefined : setRegisterEvent} />
                  </motion.div>
                ))}
              </div>
            </section>
            <BrowseByClub />
          </>
        )}

        {activeTab === "bookings" && (
          <section className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Available Events</h2>
              {liveEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">No events available right now.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {liveEvents.map(event => (
                    <EventCard key={event.id} event={event} onRegister={registeredIds.has(event.id) ? undefined : setRegisterEvent} />
                  ))}
                </div>
              )}
            </div>
            {registeredIds.size > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground/80 mb-3">Your Registrations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {EVENTS.filter(e => registeredIds.has(e.id)).map(event => (
                    <div key={event.id} className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm text-foreground">{event.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground/80 mb-3">Past Events Attended</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {EVENTS.filter(e => ["2", "3", "4"].includes(e.id)).map(event => (
                  <div key={event.id} className="bg-white rounded-xl border border-primary/20 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{event.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary text-[10px]">Attended</Badge>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "past" && (
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Past Events</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {pastEvents.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <EventCard event={event} isPast />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {registerEvent && (
          <RegisterModal
            event={registerEvent}
            onClose={() => setRegisterEvent(null)}
            onComplete={handleRegistrationComplete}
            profileName={profile.name}
            profileDept={profile.department}
            profileYear={profile.year}
          />
        )}
        {showProfile && (
          <ProfileModal
            profile={profile}
            onSave={handleSaveProfile}
            onClose={() => setShowProfile(false)}
            saving={savingProfile}
          />
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;

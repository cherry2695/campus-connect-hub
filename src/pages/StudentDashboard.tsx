import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Calendar, Clock, ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import mlritLogo from "@/assets/mlrit-logo.png";

import ecstacy from "@/assets/events/ecstacy.png";
import equinox from "@/assets/events/equinox.jpeg";
import innovation from "@/assets/events/innovation-challenge.png";
import kiteFestival from "@/assets/events/kite-festival.jpg";
import trishna from "@/assets/events/trishna.jpg";
import workshopCarnival from "@/assets/events/workshop-carnival.png";
import zenith from "@/assets/events/zenith.jpg";
import zignasa from "@/assets/events/zignasa.jpeg";

// 8x4 banner slides
import slideB2b from "@/assets/slides/b2b.png";
import slideEquinox from "@/assets/slides/equinox.png";
import slideWorkshop from "@/assets/slides/workshop-carnival.jpg";
import slideZignasa from "@/assets/slides/zignasa.png";
import slideMetaLoop from "@/assets/slides/meta-loop.jpg";

// ---------- DATA ----------
const heroSlides = [slideB2b, slideEquinox, slideWorkshop, slideZignasa, slideMetaLoop];

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image: string;
  status: "live" | "upcoming" | "past";
}

const EVENTS: EventData[] = [
  { id: "1", title: "Ecstacy 2025", description: "Rock On and Rave Off – Annual music & cultural fest by CAME Club", date: "26 Apr 2025", time: "5:30 PM", image: ecstacy, status: "live" },
  { id: "2", title: "Workshop Carnival", description: "Create. Innovate. Excel – Workshops on UI/UX, Web Dev, AI & more", date: "10-11 Apr 2025", time: "9:00 AM", image: workshopCarnival, status: "live" },
  { id: "3", title: "Zenith 2025", description: "The Cloud Voyage – 2-Day Hackathon & AWS Community Day", date: "18-20 Dec 2025", time: "10:00 AM", image: zenith, status: "upcoming" },
  { id: "4", title: "Zignasa 2025", description: "24HR National Level Hackathon – Domains: AI, Web Dev, UI/UX", date: "28-29 Nov 2025", time: "9:00 AM", image: zignasa, status: "upcoming" },
  { id: "5", title: "Equinox E-Summit 2K24", description: "Where Passion Meets Perseverance – Startup Expo, Ideathon & more", date: "28-30 Nov 2024", time: "10:00 AM", image: equinox, status: "past" },
  { id: "6", title: "Innovation Challenge 2K25", description: "Project Expo with ₹18,000 prize pool in collaboration with S&H Dept", date: "25 Jan 2025", time: "9:00 AM", image: innovation, status: "past" },
  { id: "7", title: "Kite Festival 2026", description: "Annual kite flying celebration at MLRIT Grounds", date: "10 Jan 2026", time: "2:00 PM", image: kiteFestival, status: "past" },
  { id: "8", title: "Trishna 2K26", description: "21st Annual Day celebrations – Save the Date!", date: "13 Mar 2026", time: "5:00 PM", image: trishna, status: "past" },
];

const CLUBS = [
  { id: "cie", name: "CIE", color: "hsl(220,80%,55%)" },
  { id: "codeclub", name: "Code Club", color: "hsl(150,70%,40%)" },
  { id: "cameclub", name: "CAME Club", color: "hsl(340,75%,55%)" },
  { id: "scopeclub", name: "SCOPE Club", color: "hsl(260,65%,55%)" },
  { id: "clubliterati", name: "Club Literati", color: "hsl(30,80%,50%)" },
  { id: "apex", name: "APEX", color: "hsl(190,75%,45%)" },
];

const DEPARTMENTS = ["CSE", "CSM", "CSD", "IT", "CSIT", "ECE", "EEE", "MECH", "AERO"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

type Tab = "home" | "bookings" | "past";

// ---------- COMPONENTS ----------

const DashboardNavbar: React.FC<{ onProfileClick: () => void; onLogout: () => void; activeTab: Tab; setActiveTab: (t: Tab) => void }> = ({ onProfileClick, onLogout, activeTab, setActiveTab }) => (
  <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
      <div className="flex items-center gap-3">
        <img src={mlritLogo} alt="MLRIT" className="h-10 w-auto object-contain" />
        <span className="font-bold text-lg text-gray-800 hidden sm:block">Campus Connect</span>
      </div>
      <div className="flex items-center gap-1">
        {(["home", "bookings", "past"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
          >
            {tab === "home" ? "Home" : tab === "bookings" ? "Bookings" : "Past Events"}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onProfileClick} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600">
          <User className="h-5 w-5" />
        </button>
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
          <LogOut className="h-4 w-4" /> Logout
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
    <section className="relative w-full aspect-[21/9] max-h-[420px] overflow-hidden rounded-2xl bg-gray-100">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={index}
          src={heroSlides[index]}
          alt={`Event ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 40 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Discover Campus Events</h2>
        <p className="text-white/80 text-sm mt-1">Stay updated with the latest happenings</p>
      </div>
      <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition-all" aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition-all" aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "bg-white w-6" : "bg-white/50 w-1.5"}`} />
        ))}
      </div>
    </section>
  );
};

const EventCard: React.FC<{ event: EventData; onRegister?: (e: EventData) => void; isPast?: boolean }> = ({ event, onRegister, isPast }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
  >
    <div className="aspect-[4/5] overflow-hidden bg-gray-50">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{event.title}</h3>
        {isPast && <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] shrink-0">Completed</Badge>}
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
      </div>
      {!isPast && onRegister && (
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={() => onRegister(event)}>
          Register
        </Button>
      )}
    </div>
  </motion.div>
);

const BrowseByClub: React.FC = () => (
  <section>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Browse by Club</h2>
    <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
      {CLUBS.map(club => (
        <motion.button key={club.id} whileHover={{ scale: 1.1 }}
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-200 group-hover:border-blue-400 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md"
            style={{ background: `linear-gradient(135deg, ${club.color}15, ${club.color}08)` }}>
            <span className="text-lg font-bold" style={{ color: club.color }}>{club.name.charAt(0)}</span>
          </div>
          <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium transition-colors whitespace-nowrap">{club.name}</span>
        </motion.button>
      ))}
    </div>
  </section>
);

const RegisterModal: React.FC<{ event: EventData; onClose: () => void; onSubmit: (name: string, team: string) => void; profileName: string }> = ({ event, onClose, onSubmit, profileName }) => {
  const [name, setName] = useState(profileName);
  const [team, setTeam] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Register for {event.title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Student Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1" />
          </div>
          <div>
            <Label>Team Name (Optional)</Label>
            <Input value={team} onChange={e => setTeam(e.target.value)} placeholder="Enter team name" className="mt-1" />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!name.trim()} onClick={() => onSubmit(name, team)}>
            Submit Registration
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SuccessToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
      <CheckCircle2 className="h-5 w-5" /> {message}
    </motion.div>
  );
};

const ProfileModal: React.FC<{ profile: ProfileData; onSave: (p: ProfileData) => void; onClose: () => void }> = ({ profile, onSave, onClose }) => {
  const [data, setData] = useState(profile);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo || null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result as string); setData(d => ({ ...d, photo: reader.result as string })); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Profile</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-3 flex items-center justify-center">
            {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="h-10 w-10 text-gray-300" />}
          </div>
          <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
            Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Student Name</Label>
            <Input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Student Year</Label>
            <select value={data.year} onChange={e => setData(d => ({ ...d, year: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Year</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <Label>Department</Label>
            <select value={data.department} onChange={e => setData(d => ({ ...d, department: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select Department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label>Contact Number</Label>
            <Input value={data.contact} onChange={e => setData(d => ({ ...d, contact: e.target.value }))} placeholder="+91 XXXXXXXXXX" className="mt-1" />
          </div>
          <div>
            <Label>Personal Email</Label>
            <Input type="email" value={data.personalEmail} onChange={e => setData(d => ({ ...d, personalEmail: e.target.value }))} placeholder="your@email.com" className="mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => onSave(data)}>Save Changes</Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ---------- TYPES ----------
interface ProfileData {
  name: string;
  photo: string | null;
  year: string;
  department: string;
  contact: string;
  personalEmail: string;
}

// ---------- MAIN ----------
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showProfile, setShowProfile] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventData | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<ProfileData>({ name: "", photo: null, year: "", department: "", contact: "", personalEmail: "" });

  const liveEvents = EVENTS.filter(e => e.status === "live" || e.status === "upcoming");
  const pastEvents = EVENTS.filter(e => e.status === "past");

  const handleRegister = (name: string, _team: string) => {
    if (registerEvent) {
      setRegisteredIds(prev => new Set(prev).add(registerEvent.id));
      setRegisterEvent(null);
      setSuccessMsg(`Successfully registered for ${registerEvent.title}`);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <DashboardNavbar onProfileClick={() => setShowProfile(true)} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {activeTab === "home" && (
          <>
            <HeroSlider />

            {/* Live Now */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xl font-bold text-gray-800">Live Now</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Events</h2>
            {liveEvents.length === 0 ? (
              <p className="text-gray-400 text-center py-16">No events available right now.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {liveEvents.map(event => (
                  <EventCard key={event.id} event={event}
                    onRegister={registeredIds.has(event.id) ? undefined : setRegisterEvent} />
                ))}
              </div>
            )}
            {registeredIds.size > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Registrations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {EVENTS.filter(e => registeredIds.has(e.id)).map(event => (
                    <div key={event.id} className="bg-white rounded-xl border border-green-100 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm text-gray-800">{event.title}</span>
                      </div>
                      <p className="text-xs text-gray-400">{event.date} • {event.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "past" && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Past Events</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <RegisterModal event={registerEvent} onClose={() => setRegisterEvent(null)} onSubmit={handleRegister} profileName={profile.name} />
        )}
        {showProfile && (
          <ProfileModal profile={profile} onSave={(p) => { setProfile(p); setShowProfile(false); setSuccessMsg("Profile saved successfully"); }} onClose={() => setShowProfile(false)} />
        )}
        {successMsg && <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;

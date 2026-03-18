import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, GraduationCap, Users, BookOpen, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mlritLogo from "@/assets/mlrit-logo.png";
import loginBg from "@/assets/login-bg.png";

type Role = "student" | "club" | "faculty" | "admin";

const CLUB_EMAILS = [
  "cie@mlrit.ac.in",
  "codeclub@mlrit.ac.in",
  "cameclub@mlrit.ac.in",
  "scopeclub@mlrit.ac.in",
  "clubliterati@mlrit.ac.in",
  "apex@mlrit.ac.in",
];
const ADMIN_EMAIL = "mlritclgadmin@mlrit.ac.in";
const STATIC_PASSWORD = "Mlrit@123";
const STUDENT_PATTERN = /^\d{2}r\d{2}a\d{2}[a-z]\d+@mlrit\.ac\.in$/i;

const ROLES: { key: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "student", label: "Student", icon: <GraduationCap className="h-8 w-8" />, desc: "Access your student portal" },
  { key: "club", label: "Club", icon: <Users className="h-8 w-8" />, desc: "Manage club activities" },
  { key: "faculty", label: "Faculty", icon: <BookOpen className="h-8 w-8" />, desc: "Faculty resources & tools" },
  { key: "admin", label: "Admin", icon: <ShieldCheck className="h-8 w-8" />, desc: "Administrative controls" },
];

function validateEmail(role: Role, email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;
  if (!trimmed.endsWith("@mlrit.ac.in")) return "Only @mlrit.ac.in emails are allowed";
  switch (role) {
    case "student":
      if (CLUB_EMAILS.includes(trimmed) || trimmed === ADMIN_EMAIL || !STUDENT_PATTERN.test(trimmed))
        return "Only valid student college email IDs are allowed";
      return null;
    case "club":
      if (!CLUB_EMAILS.includes(trimmed)) return "Access restricted to authorized club email IDs only";
      return null;
    case "faculty":
      if (STUDENT_PATTERN.test(trimmed) || CLUB_EMAILS.includes(trimmed) || trimmed === ADMIN_EMAIL)
        return "Only faculty email IDs are allowed";
      return null;
    case "admin":
      if (trimmed !== ADMIN_EMAIL) return "Only admin is authorized to access this portal";
      return null;
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false });

  const emailError = useMemo(
    () => (touched.email && selectedRole ? validateEmail(selectedRole, email) : null),
    [email, selectedRole, touched.email]
  );

  const isFormValid = useMemo(() => {
    if (!selectedRole || !email || !password) return false;
    return !validateEmail(selectedRole, email);
  }, [selectedRole, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!isFormValid) return;
    if (password !== STATIC_PASSWORD) {
      setPasswordError("Invalid password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    if (selectedRole === "student") {
      setTimeout(() => navigate("/student-dashboard"), 1500);
    }
  };

  const handleBack = () => {
    if (success) { setSuccess(false); setSelectedRole(null); setEmail(""); setPassword(""); return; }
    if (selectedRole) { setSelectedRole(null); setEmail(""); setPassword(""); setPasswordError(""); setTouched({ email: false }); return; }
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})` }}
      />

      {/* Back button */}
      <div className="relative z-10 p-4 sm:p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md backdrop-blur-sm bg-card/80 border border-border rounded-2xl p-10 text-center shadow-[var(--shadow-hover)]"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground">
                Login successful! Redirecting to your portal...
              </h2>
            </motion.div>
          ) : !selectedRole ? (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-10">
                <img src={mlritLogo} alt="MLRIT Logo" className="h-20 w-auto mx-auto mb-4 object-contain drop-shadow-lg" />
                <h1 className="text-3xl font-bold text-foreground">Campus Connect Login</h1>
                <p className="text-muted-foreground mt-2">Select your role to continue</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ROLES.map((role, i) => (
                  <motion.button
                    key={role.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedRole(role.key)}
                    className="group relative backdrop-blur-sm bg-card/80 border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] hover:border-primary/30 cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      {role.icon}
                    </div>
                    <h3 className="text-foreground font-semibold text-lg">{role.label}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed hidden sm:block">{role.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 60, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -60, rotateY: 15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md"
              style={{ perspective: 1000 }}
            >
              <div className="backdrop-blur-sm bg-card/80 border border-border rounded-2xl p-8 shadow-[var(--shadow-hover)]">
                <div className="flex flex-col items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-primary/10">
                    {ROLES.find((r) => r.key === selectedRole)?.icon &&
                      React.cloneElement(ROLES.find((r) => r.key === selectedRole)!.icon as React.ReactElement, {
                        className: "h-8 w-8 text-primary",
                      })}
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">
                      {ROLES.find((r) => r.key === selectedRole)?.label} Login
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Access your portal securely</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched({ email: true })}
                      className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                        className={`pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full shadow-lg shadow-primary/20"
                    size="lg"
                    disabled={!isFormValid || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 py-4 text-center text-sm text-muted-foreground">
        © 2026 MLRIT Campus Connect
      </footer>
    </div>
  );
};

export default Login;

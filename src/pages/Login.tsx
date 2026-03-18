import React, { useState, useMemo } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import mlritLogo from "@/assets/mlrit-logo.png";

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

function validateEmail(role: Role, email: string): string | null {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) return null; // no error while empty
  if (!trimmed.endsWith("@mlrit.ac.in")) return "Only @mlrit.ac.in emails are allowed";

  switch (role) {
    case "student":
      if (CLUB_EMAILS.includes(trimmed) || trimmed === ADMIN_EMAIL || !STUDENT_PATTERN.test(trimmed))
        return "Only valid student college email IDs are allowed";
      return null;

    case "club":
      if (!CLUB_EMAILS.includes(trimmed))
        return "Access restricted to authorized club email IDs only";
      return null;

    case "faculty":
      if (STUDENT_PATTERN.test(trimmed)) return "Only faculty email IDs are allowed";
      if (CLUB_EMAILS.includes(trimmed)) return "Only faculty email IDs are allowed";
      if (trimmed === ADMIN_EMAIL) return "Only faculty email IDs are allowed";
      return null;

    case "admin":
      if (trimmed !== ADMIN_EMAIL)
        return "Only admin is authorized to access this portal";
      return null;
  }
}

const Login: React.FC = () => {
  const [role, setRole] = useState<Role | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = useMemo(
    () => (touched.email && role ? validateEmail(role as Role, email) : null),
    [email, role, touched.email]
  );

  const isFormValid = useMemo(() => {
    if (!role || !email || !password) return false;
    return !validateEmail(role as Role, email);
  }, [role, email, password]);

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
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-hover)]">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold text-foreground text-center">
              Login successful! Redirecting to your portal...
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary/50">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-[var(--shadow-hover)]">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8">
            {/* Logo & Title */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <img src={mlritLogo} alt="MLRIT Logo" className="h-16 w-16 object-contain" />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Campus Connect Login</h1>
                <p className="text-sm text-muted-foreground mt-1">Access your portal securely</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={role} onValueChange={(v) => { setRole(v as Role); setTouched((t) => ({ ...t, email: !!email })); }}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your college email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={passwordError ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
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
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
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
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © 2026 MLRIT Campus Connect
      </footer>
    </div>
  );
};

export default Login;

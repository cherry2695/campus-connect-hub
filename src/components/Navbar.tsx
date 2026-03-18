import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import mlritLogo from "@/assets/mlrit-logo.png";

const navItems = ["Home", "About", "Features", "Contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id.toLowerCase());
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <a href="#home" onClick={() => handleNav("Home")} className="flex items-center gap-2">
          <img src={mlritLogo} alt="MLRIT Logo" className="h-10" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg active:scale-95"
          >
            Login
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNav(item)}
              className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => handleNav("Contact")}
            className="w-full bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

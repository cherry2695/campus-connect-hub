import { motion } from "framer-motion";
import { Search, ClipboardCheck, ShieldCheck, Settings2 } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Event Discovery",
    desc: "Browse upcoming events across departments, clubs, and campus-wide initiatives.",
  },
  {
    icon: ClipboardCheck,
    title: "Easy Registration",
    desc: "Register for events in seconds — no paperwork, no hassle.",
  },
  {
    icon: ShieldCheck,
    title: "Secure College Login",
    desc: "Verified access with @mlrit.ac.in email ensures only authorized participation.",
  },
  {
    icon: Settings2,
    title: "Club & Faculty Management",
    desc: "Powerful tools for clubs and faculty to create, manage, and analyze events.",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-secondary/50">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" style={{ textWrap: "balance" as any }}>
          Everything you need, in one place
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {features.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            className="bg-background rounded-2xl p-6 cursor-default"
            style={{
              boxShadow: "0 0 0 1px rgba(0,0,0,.03), 0 2px 4px rgba(0,0,0,.05), 0 12px 24px rgba(0,0,0,.03)",
            }}
            whileHover={{
              y: -4,
              boxShadow: "0 0 0 1px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.06), 0 20px 40px rgba(0,0,0,.04)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5">
              <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;

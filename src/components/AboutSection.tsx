import { Users, CalendarCheck, GraduationCap } from "lucide-react";

const items = [
  {
    icon: Users,
    title: "For Students",
    desc: "Discover, register, and participate in campus events — all from one platform.",
  },
  {
    icon: CalendarCheck,
    title: "For Clubs",
    desc: "Host events, manage registrations, and track participation effortlessly.",
  },
  {
    icon: GraduationCap,
    title: "For Faculty",
    desc: "Oversee development programs and monitor student engagement in real-time.",
  },
];

const AboutSection = () => (
  <section id="about" className="py-24 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">About</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4" style={{ textWrap: "balance" as any }}>
          One platform for your entire campus
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Campus Connect bridges students, clubs, and faculty — creating a unified ecosystem for events, engagement, and growth at MLRIT.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;

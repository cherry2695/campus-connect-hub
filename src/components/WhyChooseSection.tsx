import { Globe, ShieldCheck, Activity, Zap } from "lucide-react";

const reasons = [
  { icon: Globe, title: "Centralized Event Platform", desc: "All campus events in one accessible hub." },
  { icon: ShieldCheck, title: "Verified College Access", desc: "Only @mlrit.ac.in users can participate." },
  { icon: Activity, title: "Real-time Tracking", desc: "Monitor participation and engagement live." },
  { icon: Zap, title: "Simplified Management", desc: "Create, manage, and analyze events effortlessly." },
];

const WhyChooseSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Why Campus Connect</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" style={{ textWrap: "balance" as any }}>
          Built for MLRIT, by Chanikya
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {reasons.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseSection;

const Footer = () => {
  const handleNav = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-foreground text-background/70 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-lg font-bold text-background mb-2">Campus Connect</h3>
            <p className="text-sm leading-relaxed">
              MLR Institute of Technology<br />
              Dundigal, Hyderabad — 500043
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background mb-4 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["Home", "About", "Features", "Contact"].map((item) => (
                <li key={item}>
                  <button onClick={() => handleNav(item.toLowerCase())} className="hover:text-background transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background mb-4 uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4 text-sm">
              <a href="https://www.instagram.com/mlritofficial/" target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">Instagram</a>
              <span className="hover:text-background transition-colors cursor-pointer">LinkedIn</span>
              <span className="hover:text-background transition-colors cursor-pointer">Twitter</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center text-xs text-background/40">
          © 2026 CampusConnect MLRIT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

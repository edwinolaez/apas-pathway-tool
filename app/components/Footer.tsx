export default function Footer() {
  const footerLinks = {
    Resources: ["Program Library", "Labour Market", "Assessment Guide", "FAQs"],
    Support: ["Help Center", "Contact Us", "Feedback", "Accessibility"],
    Company: ["About APAS", "Roadmap", "Privacy Policy", "Terms of Service"],
  };

  return (
    <footer className="w-full bg-navy text-white py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="text-2xl font-bold tracking-tight">
              Pathr<span className="text-primary">.</span>
            </div>
            <p className="text-sm font-light opacity-70">
              Intelligent post-secondary guidance for Alberta students.
            </p>
            <p className="text-sm font-light opacity-70">support@apas.ca</p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="font-semibold text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-light opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-xs font-light opacity-50">
            (c) 2026 APAS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

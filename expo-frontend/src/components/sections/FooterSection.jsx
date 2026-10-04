import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { C } from "../../constants/colors";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#howitworks" },
  { label: "Highlights", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const EXPLORE_LINKS = [
  { label: "Upcoming Exhibitions", href: "#testimonials" },
  { label: "Venue Highlights", href: "#features" },
  { label: "Ticket Access", href: "#features" },
  { label: "Event Enquiry", href: "#contact" },
];

const CONTACT_ITEMS = [
  { icon: Mail, label: "support@exposphere.com" },
  { icon: Phone, label: "+91 98765 43210" },
  { icon: MapPin, label: "Chennai, India" },
];

export default function FooterSection() {
  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #420847 0%, #2c022f 100%)",
        color: "white",
        padding: "64px 20px 28px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <div>
            <h3 style={{ marginBottom: "14px", fontSize: "24px" }}>ExpoSphere</h3>
            <p
              style={{
                fontSize: "14px",
                opacity: "0.86",
                lineHeight: "1.8",
                marginBottom: "18px",
              }}
            >
              Explore exhibitions, discover inspiring venues, and enjoy a public-friendly website that is simple to
              understand and easy to access.
            </p>

            <a
              href="#home"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: C.pinkMid,
                textDecoration: "none",
                fontWeight: "700",
              }}
            >
              Back to top <ArrowUpRight size={16} />
            </a>
          </div>

          <div>
            <h4 style={{ marginBottom: "14px" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", opacity: "0.9", lineHeight: "2.2" }}>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} style={{ color: "inherit", textDecoration: "none" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: "14px" }}>Explore</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", opacity: "0.9", lineHeight: "2.2" }}>
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href} style={{ color: "inherit", textDecoration: "none" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: "14px" }}>Contact</h4>
            <div style={{ display: "grid", gap: "14px" }}>
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    style={{
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.08)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={C.pinkMid} />
                    </div>
                    <div style={{ fontSize: "14px", opacity: "0.9" }}>{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: "20px",
            textAlign: "center",
            fontSize: "13px",
            opacity: "0.74",
          }}
        >
          {"\u00A9"} {new Date().getFullYear()} ExpoSphere. Public exhibition discovery made simple.
        </div>
      </div>
    </footer>
  );
}

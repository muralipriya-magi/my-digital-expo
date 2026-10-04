import { CalendarRange, Home, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

import { C } from "../../constants/colors";

const LOGO_MARK = "\uD83C\uDFAA";

const NAV_ITEMS = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Sparkles, label: "Features", id: "features" },
  { icon: CalendarRange, label: "How It Works", id: "howitworks" },
  { icon: MessageCircle, label: "Highlights", id: "testimonials" },
  { icon: Phone, label: "Contact", id: "contact" },
];

export default function Sidebar({ active, onNav, open, setOpen }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current) return;

    if (open) {
      gsap.fromTo(panelRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(40,4,46,0.38)",
          backdropFilter: "blur(6px)",
          zIndex: 100,
        }}
      />

      <aside
        ref={panelRef}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          bottom: 16,
          width: "min(300px, calc(100vw - 32px))",
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: "30px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 28px 60px rgba(61,0,64,0.16)",
          backdropFilter: "blur(18px)",
          zIndex: 120,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px 22px 18px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {LOGO_MARK}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "800", color: C.text }}>ExpoSphere</div>
              <div style={{ fontSize: "12px", color: C.textLight }}>Navigation</div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            style={{
              border: "none",
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: C.pinkPale,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={18} color={C.text} />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNav(item.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  borderRadius: "18px",
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? `linear-gradient(135deg, ${C.pink}, ${C.violetMid})` : "rgba(255,255,255,0.72)",
                  color: isActive ? "white" : C.textMid,
                  fontWeight: isActive ? "700" : "600",
                  boxShadow: isActive ? "0 14px 28px rgba(168,85,247,0.16)" : "none",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "20px",
            borderTop: `1px solid ${C.border}`,
            background: "linear-gradient(180deg, rgba(255,248,252,0.8), rgba(255,240,245,0.9))",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "20px",
              background: "white",
              boxShadow: "0 14px 30px rgba(61,0,64,0.06)",
            }}
          >
            <div style={{ fontWeight: "800", color: C.text, marginBottom: "6px" }}>Explore exhibitions</div>
            <div style={{ fontSize: "13px", color: C.textLight, lineHeight: "1.6", marginBottom: "12px" }}>
              Discover featured exhibitions, venue highlights, and event details in one simple website.
            </div>
            <button
              onClick={() => {
                onNav("contact");
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "14px",
                border: "none",
                background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Talk to Us
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

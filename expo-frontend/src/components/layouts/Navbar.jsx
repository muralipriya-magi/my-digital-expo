import { useEffect, useMemo, useRef, useState } from "react";
import { LogIn, Menu, Sparkles } from "lucide-react";
import gsap from "gsap";

import { C } from "../../constants/colors";

const LOGO_MARK = "\uD83C\uDFAA";

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "How It Works", id: "howitworks" },
  { label: "Highlights", id: "testimonials" },
  { label: "Contact", id: "contact" },
];

export default function Navbar({ active, onNav, onStart, toggleSidebar }) {
  const navRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 960);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 960);
      setIsCompact(window.innerWidth < 640);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const navItems = useMemo(() => NAV_ITEMS, []);

  return (
    <header
      ref={navRef}
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        right: 16,
        height: isCompact ? "68px" : "74px",
        background: "rgba(255,255,255,0.74)",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: isCompact ? "20px" : "24px",
        boxShadow: "0 18px 44px rgba(61,0,64,0.08)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isCompact ? "0 14px" : "0 20px",
        zIndex: 110,
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isCompact ? "10px" : "14px", minWidth: 0 }}>
        {!isDesktop && (
          <button
            onClick={toggleSidebar}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <Menu size={24} />
          </button>
        )}

        <div
          style={{
            width: isCompact ? "38px" : "42px",
            height: isCompact ? "38px" : "42px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            flexShrink: 0,
            fontSize: isCompact ? "18px" : "22px",
          }}
        >
          {LOGO_MARK}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: "800", color: C.text, fontSize: isCompact ? "15px" : "16px", whiteSpace: "nowrap" }}>
            ExpoSphere
          </div>
          {!isCompact && <div style={{ fontSize: "12px", color: C.textLight }}>Premium expo platform</div>}
        </div>
      </div>

      {isDesktop && (
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.78)",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "12px 16px",
                borderRadius: "999px",
                background: active === item.id ? `linear-gradient(135deg, ${C.pink}, ${C.violetMid})` : "transparent",
                color: active === item.id ? "white" : C.textMid,
                fontWeight: active === item.id ? "700" : "600",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <button
        onClick={onStart}
        style={{
          padding: isDesktop ? "12px 18px" : "12px 14px",
          borderRadius: "999px",
          border: "none",
          background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
          color: "white",
          fontWeight: "700",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 14px 30px rgba(168,85,247,0.18)",
          flexShrink: 0,
        }}
      >
        {isDesktop ? "Admin Login" : isCompact ? "Admin" : <Sparkles size={18} />}
        {(isDesktop || isCompact) && <LogIn size={18} />}
      </button>
    </header>
  );
}

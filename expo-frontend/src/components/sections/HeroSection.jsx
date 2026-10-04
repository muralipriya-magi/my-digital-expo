import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import api from "../../api/axios";
import { C } from "../../constants/colors";

const FALLBACK_FEATURED_EXPO = {
  title: "South India Trade Exhibition",
  city: "Chennai",
  venue: "Chennai Trade Center",
  start_date: "2026-04-28",
  end_date: "2026-04-30",
};

const FALLBACK_EXPOS = [
  { id: "fallback-1", title: "Industrial Machinery Expo", city: "Chennai" },
  { id: "fallback-2", title: "Textile & Fashion Exhibition", city: "Mumbai" },
  { id: "fallback-3", title: "Food Products Exhibition", city: "Bengaluru" },
];

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Dates to be announced";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates to be announced";
  }

  return `${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })}`;
}

export default function HeroSection({ onCTA }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const previewRef = useRef(null);
  const orbLeftRef = useRef(null);
  const orbRightRef = useRef(null);
  const [expos, setExpos] = useState([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 520);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCompact(window.innerWidth < 520);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        previewRef.current,
        { y: 60, opacity: 0, rotate: 2 },
        { y: 0, opacity: 1, rotate: 0, duration: 1.1, ease: "power4.out", delay: 0.2 }
      );

      gsap.to(orbLeftRef.current, {
        y: -18,
        x: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(orbRightRef.current, {
        y: 16,
        x: -12,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let active = true;

    Promise.allSettled([api.get("expos/featured/"), api.get("expos/list/")])
      .then(([featuredResult, listResult]) => {
        if (active) {
          const featuredData = featuredResult.status === "fulfilled" ? featuredResult.value.data : null;
          const allExpos = listResult.status === "fulfilled" && Array.isArray(listResult.value.data) ? listResult.value.data : [];
          const featuredExpo = featuredData ? [featuredData] : [];
          const merged = [...featuredExpo, ...allExpos.filter((expo) => expo.id !== featuredData?.id)];
          setExpos(merged);
        }
      })
      .catch(() => {
        if (active) {
          setExpos([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredExpo = expos[0] || FALLBACK_FEATURED_EXPO;
  const listedExpos = expos.slice(0, 3).length ? expos.slice(0, 3) : FALLBACK_EXPOS;

  return (
    <section
      id="home"
      ref={sectionRef}
      style={{
        padding: isMobile ? "108px 18px 72px" : "120px 30px 110px",
        background: "radial-gradient(circle at top left, #fff5f8 0%, #ffe4ee 28%, white 64%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        ref={orbRightRef}
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(255,181,200,0.65) 0%, rgba(255,181,200,0) 70%)",
          borderRadius: "50%",
          opacity: "0.9",
        }}
      />

      <div
        ref={orbLeftRef}
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "20%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(192,132,252,0.38) 0%, rgba(192,132,252,0) 72%)",
          borderRadius: "50%",
          opacity: "0.8",
        }}
      />

      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: isMobile ? "28px" : "60px",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div ref={contentRef}>
          <div
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(255,143,171,0.26)",
              boxShadow: "0 16px 45px rgba(255,143,171,0.14)",
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: "30px",
              fontSize: isCompact ? "11px" : "12px",
              fontWeight: "700",
              marginBottom: "24px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={14} color={C.pink} />
              Welcome to a world of exhibitions
            </span>
          </div>

          <h1
            style={{
              fontSize: isCompact ? "38px" : isMobile ? "46px" : "56px",
              fontWeight: "900",
              lineHeight: "1.05",
              color: C.text,
              marginBottom: "20px",
              letterSpacing: "-0.03em",
            }}
          >
            Step into memorable
            <br />
            exhibition experiences
          </h1>

          <p
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: C.textMid,
              marginBottom: "32px",
              maxWidth: "520px",
              lineHeight: "1.7",
            }}
          >
            ExpoSphere brings exhibitions to life with inspiring spaces, vibrant showcases, and memorable moments
            that make every event feel special.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={onCTA}
              style={{
                padding: isCompact ? "14px 22px" : "14px 28px",
                borderRadius: "30px",
                border: "none",
                background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 18px 42px rgba(168,85,247,0.22)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Get Started <ArrowRight size={18} />
            </button>

            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: isCompact ? "14px 22px" : "14px 28px",
                borderRadius: "30px",
                border: "1px solid rgba(255,143,171,0.28)",
                background: "rgba(255,255,255,0.82)",
                color: C.text,
                fontWeight: "600",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              See Features
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "30px",
              fontSize: isCompact ? "13px" : "14px",
              color: C.textLight,
              flexWrap: "wrap",
              rowGap: "10px",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} color={C.pink} /> Secure ticket flow
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={16} color={C.pink} /> Multi-city launches
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Users size={16} color={C.pink} /> Vendor-ready platform
            </span>
          </div>
        </div>

        <div
          ref={previewRef}
          style={{
            background: "rgba(255,255,255,0.76)",
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "28px",
            padding: isMobile ? "20px" : "30px",
            boxShadow: "0 30px 90px rgba(61,0,64,0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <h3 style={{ color: C.text, margin: 0, fontSize: isCompact ? "20px" : "24px" }}>Featured Expo Spotlight</h3>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background: C.pinkLight,
                color: C.text,
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Live View
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: "14px", marginBottom: "18px" }}>
            <div
              onClick={() => featuredExpo.id && navigate(`/expos/${featuredExpo.id}`)}
              style={{
                padding: "18px",
                borderRadius: "20px",
                background: "linear-gradient(145deg, rgba(255,143,171,0.16), rgba(192,132,252,0.12))",
                cursor: featuredExpo.id ? "pointer" : "default",
              }}
            >
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: C.textLight, marginBottom: "8px" }}>
                Featured Expo
              </div>
              <div style={{ fontSize: isCompact ? "20px" : "22px", fontWeight: "800", color: C.text, marginBottom: "8px" }}>{featuredExpo.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: C.textMid, marginBottom: "10px" }}>
                <CalendarRange size={16} color={C.pink} />
                {formatDateRange(featuredExpo.start_date, featuredExpo.end_date)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: C.textMid }}>
                <MapPin size={16} color={C.pink} />
                {featuredExpo.venue}
              </div>
            </div>

            <div style={{ padding: "18px", borderRadius: "20px", background: "#fff", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "12px", color: C.textLight, marginBottom: "8px" }}>Public Listings</div>
              <div style={{ fontSize: "30px", fontWeight: "900", color: C.text }}>{expos.length || listedExpos.length}</div>
              <div style={{ fontSize: "13px", color: C.textMid }}>approved exhibitions live</div>
            </div>
          </div>

          {listedExpos.map((expo, index) => (
            <div
              key={expo.id || expo.title}
              style={{
                padding: "14px",
                border: `1px solid ${C.border}`,
                borderRadius: "16px",
                marginBottom: "12px",
                transition: "0.2s",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              <div>
                <strong>{expo.title}</strong>
                <div
                  style={{
                    fontSize: "13px",
                    color: C.textLight,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "4px",
                  }}
                >
                  <MapPin size={14} color={C.pink} /> {expo.city}
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: C.violetLight,
                  color: C.textMid,
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {index === 0 ? "Featured" : index === 1 ? "Popular" : "Trending"}
              </div>
            </div>
          ))}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr 1fr",
              gap: "10px",
              marginTop: "24px",
            }}
          >
            {[
              { value: `${new Set(listedExpos.map((expo) => expo.city)).size || 1}`, label: "Cities", color: C.pink },
              { value: `${expos.length || listedExpos.length}`, label: "Events", color: C.violet },
              { value: "Live", label: "Updates", color: C.cyan },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  textAlign: "center",
                  padding: "16px",
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.72)",
                }}
              >
                <strong style={{ color: stat.color, fontSize: "20px" }}>{stat.value}</strong>
                <div style={{ fontSize: "12px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

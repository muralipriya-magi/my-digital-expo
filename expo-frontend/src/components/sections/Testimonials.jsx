import { useEffect, useRef } from "react";
import { Activity, BadgeCheck, CalendarClock, Users } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { C } from "../../constants/colors";

gsap.registerPlugin(ScrollTrigger);

const LIVE_CARDS = [
  {
    icon: Activity,
    eyebrow: "Featured Exhibitions",
    title: "Explore upcoming exhibition highlights",
    text: "Discover event highlights, featured exhibitions, and exciting moments that create a stronger first impression.",
    accent: "linear-gradient(135deg, rgba(255,143,171,0.2), rgba(192,132,252,0.16))",
    metrics: [
      { value: "12+", label: "featured exhibitions" },
      { value: "8", label: "popular venues" },
    ],
  },
  {
    icon: CalendarClock,
    eyebrow: "Event Moments",
    title: "See schedules, launches, and venue details",
    text: "Help visitors understand what is happening, where it is happening, and when each exhibition experience begins.",
    accent: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(192,132,252,0.16))",
    metrics: [
      { value: "24 Apr", label: "next opening date" },
      { value: "5", label: "cities covered" },
    ],
  },
  {
    icon: BadgeCheck,
    eyebrow: "Visitor Experience",
    title: "Make the website simple and easy to trust",
    text: "A clean exhibition website should feel welcoming, clear, and easy to access from the first section to the last.",
    accent: "linear-gradient(135deg, rgba(255,232,255,1), rgba(255,228,238,0.92))",
    metrics: [
      { value: "Easy", label: "public access flow" },
      { value: "Clear", label: "section-based browsing" },
    ],
  },
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 74%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      style={{
        padding: "100px 30px",
        background: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: C.text,
            marginBottom: "10px",
          }}
        >
          Exhibition Highlights
        </h2>

        <p
          style={{
            color: C.textMid,
            marginBottom: "60px",
            maxWidth: "720px",
            marginInline: "auto",
            lineHeight: "1.7",
          }}
        >
          This section should help the public understand your exhibition website quickly with featured events, timings, and easy-to-read highlights.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {LIVE_CARDS.map((card, index) => {
            const Icon = card.icon;

            return (
            <div
              key={card.title}
              ref={(element) => {
                cardsRef.current[index] = element;
              }}
              style={{
                padding: "32px",
                border: `1px solid ${C.border}`,
                borderRadius: "24px",
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,248,252,0.96) 100%)",
                boxShadow: "0 16px 36px rgba(61,0,64,0.06)",
                transition: "0.3s",
                cursor: "pointer",
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "0 auto auto 0",
                  width: "100%",
                  height: "5px",
                  background: card.accent,
                }}
              />

              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "18px",
                  background: card.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                <Icon size={26} color={C.text} />
              </div>

              <div
                style={{
                  color: C.pink,
                  fontSize: "12px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "10px",
                }}
              >
                {card.eyebrow}
              </div>

              <h3
                style={{
                  color: C.text,
                  margin: "0 0 12px",
                  fontSize: "22px",
                  lineHeight: "1.25",
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontSize: "15px",
                  color: C.textLight,
                  lineHeight: "1.75",
                  marginBottom: "24px",
                }}
              >
                {card.text}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {card.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    style={{
                      padding: "14px",
                      borderRadius: "18px",
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "18px", marginBottom: "4px" }}>
                      {metric.value}
                    </div>
                    <div style={{ color: C.textMid, fontSize: "12px", lineHeight: "1.5" }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              {index === 2 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px 16px",
                    borderRadius: "18px",
                    background: "rgba(255,143,171,0.08)",
                    color: C.textMid,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    lineHeight: "1.6",
                  }}
                >
                  <Users size={18} color={C.pink} />
                  A friendly exhibition website should feel simple, public, and easy to understand.
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}

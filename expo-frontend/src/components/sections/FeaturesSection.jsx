import { useEffect, useRef } from "react";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MapPinned,
  QrCode,
  Search,
  Ticket,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { C } from "../../constants/colors";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Search,
    title: "Explore Upcoming Exhibitions",
    desc: "Browse exhibitions across industries, cities, and themes from one polished discovery space.",
  },
  {
    icon: CalendarDays,
    title: "Exhibition Schedules",
    desc: "View exhibition dates, timings, and launch windows with a clean and easy browsing experience.",
  },
  {
    icon: MapPinned,
    title: "Venue and City Details",
    desc: "See where each exhibition is happening with venue highlights and city-based discovery.",
  },
  {
    icon: Ticket,
    title: "Easy Ticket Access",
    desc: "Make exhibition entry simple with clear ticket information and a smooth booking experience.",
  },
  {
    icon: QrCode,
    title: "Smart Entry Experience",
    desc: "Support modern exhibition entry with secure QR-based access and faster check-in flow.",
  },
  {
    icon: BarChart3,
    title: "Live Exhibition Insights",
    desc: "Showcase exhibition momentum with visitor activity, bookings, and event performance at a glance.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{
        padding: "100px 30px",
        background: "linear-gradient(180deg, white 0%, #fff8fc 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
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
          Powerful Features
        </h2>

        <p
          style={{
            color: C.textMid,
            maxWidth: "600px",
            margin: "auto",
            marginBottom: "60px",
          }}
        >
          Everything you need to explore exhibitions, discover venues, view schedules, and enjoy a smoother event experience.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
          }}
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  padding: "32px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "22px",
                  transition: "0.3s",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 20px 50px rgba(61,0,64,0.05)",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 24px 60px rgba(61,0,64,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 20px 50px rgba(61,0,64,0.05)";
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(255,143,171,0.18), rgba(192,132,252,0.14))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Icon color={C.pink} />
                </div>

                <h3
                  style={{
                    marginBottom: "10px",
                    color: C.text,
                    fontSize: "20px",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: C.textLight,
                    lineHeight: "1.7",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { DoorOpen, Search, Ticket } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { C } from "../../constants/colors";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Discover Expos",
    desc: "Browse premium exhibitions happening across cities and categories.",
  },
  {
    icon: Ticket,
    step: "02",
    title: "Book Tickets or Stalls",
    desc: "Visitors book access while vendors reserve their showcase space online.",
  },
  {
    icon: DoorOpen,
    step: "03",
    title: "Attend the Event",
    desc: "Enter the expo using secure QR verification and streamlined gate flow.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stepsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.16,
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
      id="howitworks"
      ref={sectionRef}
      style={{
        padding: "100px 30px",
        background: "linear-gradient(180deg, #fff0f5 0%, #ffe4ee 100%)",
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
          How It Works
        </h2>

        <p
          style={{
            color: C.textMid,
            marginBottom: "60px",
          }}
        >
          A smoother exhibition journey for organizers, vendors, and visitors.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "40px",
          }}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.step}
                ref={(element) => {
                  stepsRef.current[index] = element;
                }}
                style={{
                  padding: "30px",
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.88)",
                  boxShadow: "0 18px 42px rgba(61,0,64,0.08)",
                  transition: "0.3s",
                  cursor: "pointer",
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
                    top: "-30px",
                    right: "-20px",
                    fontSize: "80px",
                    fontWeight: "800",
                    color: "rgba(255,143,171,0.12)",
                  }}
                >
                  {step.step}
                </div>

                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(255,143,171,0.18), rgba(192,132,252,0.16))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                    marginBottom: "20px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Icon size={28} color={C.pink} />
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: C.pink,
                    marginBottom: "10px",
                  }}
                >
                  Step {step.step}
                </div>

                <h3
                  style={{
                    marginBottom: "10px",
                    color: C.text,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: "14px",
                    color: C.textLight,
                    lineHeight: "1.7",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

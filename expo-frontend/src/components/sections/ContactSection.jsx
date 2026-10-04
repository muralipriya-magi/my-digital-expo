import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Phone, SendHorizonal } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import toast from "react-hot-toast";

import api from "../../api/axios.jsx";
import { C } from "../../constants/colors";

gsap.registerPlugin(ScrollTrigger);

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactSection() {
  const sectionRef = useRef(null);
  const panelRef = useRef(null);
  const formRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [panelRef.current, formRef.current],
        { y: 55, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 76%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = form.name.trim();
    const cleanEmail = form.email.trim();
    const cleanMessage = form.message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      toast.error("Please fill out all contact fields.");
      return;
    }

    try {
      setSending(true);
      await api.post("users/contact/", {
        name: cleanName,
        email: cleanEmail,
        message: cleanMessage,
      });
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Message sent to admin successfully.");
    } catch {
      toast.error("Unable to send your message right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        padding: "100px 30px",
        background: "linear-gradient(180deg, #ffe4ee 0%, #fff4f8 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: C.text,
              marginBottom: "10px",
            }}
          >
            Contact Us
          </h2>

          <p
            style={{
              color: C.textMid,
            }}
          >
            Have questions about exhibitions or vendor bookings? Our team is here to help.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "34px",
            alignItems: "stretch",
          }}
        >
          <div
            ref={panelRef}
            style={{
              background: "rgba(255,255,255,0.62)",
              border: "1px solid rgba(255,255,255,0.7)",
              backdropFilter: "blur(14px)",
              borderRadius: "26px",
              padding: "34px",
              boxShadow: "0 24px 50px rgba(61,0,64,0.08)",
            }}
          >
            <h3
              style={{
                marginBottom: "20px",
                color: C.text,
                fontSize: "24px",
              }}
            >
              Get in Touch
            </h3>

            <p
              style={{
                marginBottom: "30px",
                color: C.textLight,
                lineHeight: "1.7",
              }}
            >
              Whether you're organizing an expo, booking a stall, or looking for exciting events to attend,
              ExpoSphere keeps the experience polished and simple.
            </p>

            {[
              { icon: Mail, label: "Email", value: "support@exposphere.com" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Location", value: "Chennai, India" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} style={{ display: "flex", gap: "14px", marginBottom: "22px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, rgba(255,143,171,0.18), rgba(192,132,252,0.16))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon color={C.pink} size={20} />
                  </div>

                  <div>
                    <strong>{item.label}</strong>
                    <div style={{ fontSize: "14px", color: C.textLight, marginTop: "3px" }}>{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{
              background: "white",
              padding: "34px",
              borderRadius: "26px",
              boxShadow: "0 18px 44px rgba(61,0,64,0.08)",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your Name"
                disabled={sending}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Email Address"
                disabled={sending}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <textarea
                rows="5"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                placeholder="Tell us what you're planning"
                disabled={sending}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: `1px solid ${C.border}`,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {sending ? "Sending..." : "Send Message"} <SendHorizonal size={18} />
            </button>

            {submitted && (
              <p style={{ marginTop: "16px", color: "#166534", lineHeight: "1.6" }}>
                Thanks. Your message has been sent to the admin team successfully.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react"
import { Building2, CalendarRange, Link as LinkIcon, Mail, MapPin, Phone, ShieldCheck, Sparkles, Ticket, UserRound } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../../api/axios"
import { C } from "../../constants/colors"

const ROLE_OPTIONS = [
  {
    value: "VISITOR",
    label: "Visitor",
    icon: Ticket,
    description: "Discover exhibitions and book your entry with ease.",
  },
  {
    value: "VENDOR",
    label: "Vendor",
    icon: Sparkles,
    description: "Join exhibitions and present your products professionally.",
  },
  {
    value: "ORGANIZER",
    label: "Organizer",
    icon: CalendarRange,
    description: "Create exhibition listings and wait for admin approval.",
  },
]

function Signup() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestedRole = (params.get("role") || "").toUpperCase()
  const initialRole = ROLE_OPTIONS.some((role) => role.value === requestedRole) ? requestedRole : "VISITOR"
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: initialRole,
    phone_number: "",
    company_name: "",
    business_type: "",
    city: "",
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [usernameEditable, setUsernameEditable] = useState(false)
  const [emailEditable, setEmailEditable] = useState(false)
  const [passwordEditable, setPasswordEditable] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 520)

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsCompact(window.innerWidth < 520)
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const needsBusinessDetails = form.role === "ORGANIZER" || form.role === "VENDOR"
  const companyLabel = form.role === "ORGANIZER" ? "Organization Name" : "Business Name"
  const businessTypeLabel = form.role === "ORGANIZER" ? "Organization Type" : "Business Type"

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setMessage("Please accept the terms and account policy to continue.")
      toast.error("Please accept the terms and account policy to continue.")
      return
    }

    if (form.password !== form.confirm_password) {
      setMessage("Password and confirm password must match.")
      toast.error("Password and confirm password must match.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const payload = {
        ...form,
      }
      delete payload.confirm_password

      await api.post("users/signup/", payload)
      setMessage("Account created successfully. You can log in now.")
      toast.success("Account created successfully.")
      const nextUrl =
        form.role === "ORGANIZER"
          ? `/login?role=${form.role.toLowerCase()}&signup=submitted`
          : `/login?role=${form.role.toLowerCase()}`
      navigate(nextUrl)
    } catch (err) {
      const data = err.response?.data
      const firstError = typeof data === "object" ? Object.values(data)[0]?.[0] : null
      setMessage(firstError || "Unable to create account")
      toast.error(firstError || "Unable to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #fff5f8 0%, #ffe4ee 30%, white 68%)",
        padding: isCompact ? "14px" : isMobile ? "18px" : "28px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1160px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: isMobile ? "18px" : "28px",
          alignItems: "stretch",
        }}
      >
        <section
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,240,245,0.92) 100%)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: "30px",
            padding: isCompact ? "22px" : isMobile ? "28px" : "38px",
            boxShadow: "0 24px 60px rgba(61,0,64,0.08)",
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.8)",
              color: C.textMid,
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "22px",
            }}
          >
            <Sparkles size={14} color={C.pink} />
            Join ExpoSphere
          </div>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize: isCompact ? "34px" : isMobile ? "40px" : "48px",
              lineHeight: "1.05",
              color: C.text,
              letterSpacing: "-0.03em",
            }}
          >
            Create your place
            <br />
            in the exhibition world
          </h1>

          <p
            style={{
              color: C.textMid,
              lineHeight: "1.8",
              maxWidth: "520px",
              marginBottom: "26px",
              fontSize: isMobile ? "15px" : "16px",
            }}
          >
            Create your ExpoSphere account, choose your role, and continue into the exhibition platform with a simple signup flow.
          </p>

          <div style={{ display: "grid", gap: "16px", marginBottom: "28px" }}>
            {ROLE_OPTIONS.map((role) => {
              const Icon = role.icon
              const isSelected = form.role === role.value

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => updateField("role", role.value)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "18px",
                    borderRadius: "22px",
                    border: isSelected ? "none" : `1px solid ${C.border}`,
                    background: isSelected
                      ? `linear-gradient(135deg, ${C.pink} 0%, ${C.violetMid} 100%)`
                      : "rgba(255,255,255,0.82)",
                    color: isSelected ? "white" : C.text,
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 18px 38px rgba(168,85,247,0.18)" : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "16px",
                      background: isSelected ? "rgba(255,255,255,0.18)" : "linear-gradient(135deg, rgba(255,143,171,0.18), rgba(192,132,252,0.16))",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color={isSelected ? "white" : C.pink} />
                  </div>

                  <div>
                    <div style={{ fontWeight: "800", marginBottom: "4px" }}>{role.label}</div>
                    <div style={{ lineHeight: "1.6", opacity: isSelected ? 0.92 : 1 }}>{role.description}</div>
                  </div>
                </button>
              )
            })}
          </div>

          <div
            style={{
              padding: "18px 20px",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.78)",
              border: `1px solid ${C.border}`,
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: C.text }}>
              <ShieldCheck size={18} color={C.pink} />
              <strong>Approval Note</strong>
            </div>
            <div style={{ color: C.textLight, lineHeight: "1.7", fontSize: "14px" }}>
              Organizer registrations require admin approval before dashboard access. Visitor and vendor accounts can
              continue more quickly after signup.
            </div>
          </div>
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.84)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: "30px",
            padding: isCompact ? "22px" : isMobile ? "28px" : "38px",
            boxShadow: "0 24px 60px rgba(61,0,64,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "18px",
                background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                color: "white",
                display: "grid",
                placeItems: "center",
                fontWeight: "800",
                fontSize: "24px",
                marginBottom: "18px",
              }}
            >
              {"\uD83C\uDFAA"}
            </div>

            <h2 style={{ margin: "0 0 8px", color: C.text, fontSize: isCompact ? "28px" : "34px" }}>Create Account</h2>
            <p style={{ margin: 0, color: C.textMid, lineHeight: "1.7" }}>
              Enter your details to continue with account registration.
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <input
              type="text"
              name="prevent_autofill_signup_username"
              autoComplete="username"
              tabIndex={-1}
              value=""
              readOnly
              aria-hidden="true"
              style={{ display: "none" }}
            />

            <input
              type="password"
              name="prevent_autofill_signup_password"
              autoComplete="new-password"
              tabIndex={-1}
              value=""
              readOnly
              aria-hidden="true"
              style={{ display: "none" }}
            />

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>Username</label>
              <div style={{ position: "relative" }}>
                <UserRound size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                <input
                  name="signup_username_field"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  onFocus={() => setUsernameEditable(true)}
                  readOnly={!usernameEditable}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    outline: "none",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                <input
                  type="email"
                  name="signup_email_field"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onFocus={() => setEmailEditable(true)}
                  readOnly={!emailEditable}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    outline: "none",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>Password</label>
              <div style={{ position: "relative" }}>
                <LinkIcon size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="signup_password_field"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  onFocus={() => setPasswordEditable(true)}
                  readOnly={!passwordEditable}
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "14px 88px 14px 44px",
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    outline: "none",
                    fontSize: "16px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: C.violet,
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <ShieldCheck size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirm_password}
                  onChange={(e) => updateField("confirm_password", e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 44px",
                    borderRadius: "16px",
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    outline: "none",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            {needsBusinessDetails && (
              <>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>Phone Number</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                    <input
                      placeholder="Enter phone number"
                      value={form.phone_number}
                      onChange={(e) => updateField("phone_number", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        borderRadius: "16px",
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        outline: "none",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>{companyLabel}</label>
                  <div style={{ position: "relative" }}>
                    <Building2 size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                    <input
                      placeholder={`Enter ${companyLabel.toLowerCase()}`}
                      value={form.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        borderRadius: "16px",
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        outline: "none",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>{businessTypeLabel}</label>
                  <div style={{ position: "relative" }}>
                    <Sparkles size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                    <input
                      placeholder={`Enter ${businessTypeLabel.toLowerCase()}`}
                      value={form.business_type}
                      onChange={(e) => updateField("business_type", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        borderRadius: "16px",
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        outline: "none",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: C.text, fontWeight: "700" }}>City</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={18} color={C.textLight} style={{ position: "absolute", top: "50%", left: "14px", transform: "translateY(-50%)" }} />
                    <input
                      placeholder="Enter city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px 14px 14px 44px",
                        borderRadius: "16px",
                        border: `1px solid ${C.border}`,
                        background: C.white,
                        outline: "none",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginTop: "18px",
              marginBottom: "18px",
              color: C.textLight,
              lineHeight: "1.7",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ marginTop: "4px" }}
            />
            <span>I agree to the platform terms, account policy, and responsible use of ExpoSphere.</span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "16px",
              border: "none",
              background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
              color: "white",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 18px 38px rgba(168,85,247,0.18)",
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {message && (
            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "16px",
                border: `1px solid ${message.toLowerCase().includes("success") ? "#86EFAC" : "#F5C2C7"}`,
                background: message.toLowerCase().includes("success") ? "#F0FDF4" : "#FFF4F4",
                color: message.toLowerCase().includes("success") ? "#166534" : "#B42318",
                lineHeight: "1.6",
                fontSize: "14px",
              }}
            >
              {message}
            </div>
          )}

          <p style={{ textAlign: "center", marginTop: "20px", color: C.textLight }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: C.pink, fontWeight: "700", textDecoration: "none" }}>
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Signup

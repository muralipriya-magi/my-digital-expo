import { useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../../api/axios"
import { C } from "../../constants/colors"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const { data } = await api.post("users/password-reset/", { email })
      setMessage(data.message)
      toast.success("Check your email for a reset link.")
    } catch (error) {
      const detail = error.response?.data?.email?.[0] || "Unable to request a password reset. Please try again."
      setMessage(detail)
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={iconStyle}>✉</div>
        <h1 style={headingStyle}>Forgot your password?</h1>
        <p style={copyStyle}>Enter your account email. If it exists, we will send a secure reset link.</p>
        <form onSubmit={submit}>
          <label style={labelStyle} htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" style={inputStyle} />
          <button disabled={loading} style={buttonStyle}>{loading ? "Sending link..." : "Send reset link"}</button>
        </form>
        {message && <p style={messageStyle}>{message}</p>}
        <p style={footerStyle}><Link to="/login" style={linkStyle}>Back to login</Link></p>
      </section>
    </main>
  )
}

const pageStyle = { minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px", background: `linear-gradient(160deg, ${C.pinkLight}, white 65%)` }
const cardStyle = { width: "100%", maxWidth: "440px", padding: "38px", borderRadius: "22px", background: C.white, boxShadow: "0 20px 50px rgba(61,0,64,0.12)" }
const iconStyle = { width: "54px", height: "54px", display: "grid", placeItems: "center", borderRadius: "18px", margin: "0 auto 18px", background: C.gradientPrimary, color: "white", fontSize: "24px" }
const headingStyle = { margin: "0 0 12px", textAlign: "center", color: C.text }
const copyStyle = { margin: "0 0 24px", textAlign: "center", color: C.textMid, lineHeight: 1.6 }
const labelStyle = { display: "block", marginBottom: "8px", color: C.text, fontWeight: 700 }
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: "10px", border: `1px solid ${C.border}`, fontSize: "16px" }
const buttonStyle = { width: "100%", marginTop: "18px", padding: "14px", border: 0, borderRadius: "10px", background: C.gradientPrimary, color: "white", fontWeight: 700, cursor: "pointer" }
const messageStyle = { margin: "18px 0 0", padding: "12px", borderRadius: "10px", background: C.successBg, color: C.success, lineHeight: 1.5 }
const footerStyle = { margin: "22px 0 0", textAlign: "center" }
const linkStyle = { color: C.pink, fontWeight: 700, textDecoration: "none" }

import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../../api/axios"
import { C } from "../../constants/colors"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const uid = params.get("uid")
  const token = params.get("token")
  const linkIsValid = Boolean(uid && token)

  async function submit(event) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const { data } = await api.post("users/password-reset/confirm/", { uid, token, password, confirm_password: confirmPassword })
      setMessage(data.message)
      toast.success("Password reset successfully.")
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      const data = error.response?.data
      const detail = data?.detail || data?.password?.[0] || data?.confirm_password?.[0] || "Unable to reset your password. Request a new link and try again."
      setMessage(detail)
      toast.error(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={iconStyle}>🔐</div>
        <h1 style={headingStyle}>Choose a new password</h1>
        <p style={copyStyle}>{linkIsValid ? "Use a strong password you do not use elsewhere." : "This reset link is incomplete. Please request a new one."}</p>
        {linkIsValid && <form onSubmit={submit}>
          <label style={labelStyle} htmlFor="new-password">New password</label>
          <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" style={inputStyle} />
          <label style={{ ...labelStyle, marginTop: "16px" }} htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" style={inputStyle} />
          <button disabled={loading} style={buttonStyle}>{loading ? "Resetting password..." : "Reset password"}</button>
        </form>}
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

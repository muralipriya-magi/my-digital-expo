import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

import api, { clearStoredSession } from "../../api/axios"
import { C } from "../../constants/colors"

function getLoginErrorMessage(err) {
  const data = err.response?.data

  if (typeof data?.detail === "string") {
    return data.detail
  }

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0]
  }

  if (Array.isArray(data) && data[0]) {
    return data[0]
  }

  if (typeof data === "string") {
    return data
  }

  return err.message || "Unable to login."
}

export default function Login(){
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const role = params.get("role")
  const signupState = params.get("signup")
  const nextPath = params.get("next")

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailEditable, setEmailEditable] = useState(false)
  const [passwordEditable, setPasswordEditable] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    setEmail("")
    setPassword("")
    setError("")
    setShowPassword(false)
    setEmailEditable(false)
    setPasswordEditable(false)
  }, [role])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")
    clearStoredSession()

    try{
      const { data } = await api.post("users/login/", {
        email,
        password
      })

      localStorage.setItem("access",data.access)
      localStorage.setItem("refresh",data.refresh)

      const resolvedRole = (data.role || role || "").toLowerCase()

      if (role && resolvedRole && resolvedRole !== role.toLowerCase()) {
        const roleMessage = `This account belongs to ${resolvedRole}, not ${role}. Please use the correct role login.`
        clearStoredSession()
        setError(roleMessage)
        toast.error(roleMessage)
        return
      }

      localStorage.setItem("role", resolvedRole)

      setEmail("")
      setPassword("")
      setError("")
      setShowPassword(false)

      const dashboardByRole = {
        organizer: "/organizer-dashboard",
        vendor: "/vendor-dashboard",
        visitor: "/visitor-dashboard",
        admin: "/admin-dashboard",
      }
      const dashboardPath = dashboardByRole[resolvedRole] || "/"
      const safeNextPath = nextPath?.startsWith(dashboardPath) ? nextPath : dashboardPath
      navigate(safeNextPath)

      toast.success("Logged in successfully.")
    }
    catch(err){
      const message = getLoginErrorMessage(err)
      setError(message)
      toast.error(message || "Unable to login.")
    }
    finally{
      setLoading(false)
    }
  }

  return(
    <div
      style={{
        minHeight:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        background:`linear-gradient(160deg, ${C.pinkLight} 0%, white 60%)`,
        padding:isMobile ? "16px" : "30px"
      }}
    >
      <div
        style={{
          width:"100%",
          maxWidth:"420px",
          background:"white",
          padding:isMobile ? "24px" : "40px",
          borderRadius:isMobile ? "14px" : "16px",
          boxShadow:"0 15px 40px rgba(0,0,0,0.1)"
        }}
      >
        <div
          style={{
            width:"56px",
            height:"56px",
            borderRadius:"18px",
            background:`linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
            color:"white",
            display:"grid",
            placeItems:"center",
            fontSize:"26px",
            margin:"0 auto 18px"
          }}
        >
          {"\uD83C\uDFAA"}
        </div>

        <h2
          style={{
            textAlign:"center",
            marginBottom:"10px",
            color:C.text,
            fontSize:isMobile ? "28px" : "32px"
          }}
        >
          Login
        </h2>

        <p
          style={{
            textAlign:"center",
            color:C.textMid,
            marginBottom:"30px"
          }}
        >
          Login as <strong>{role}</strong>
        </p>

        {role === "organizer" && (
          <div
            style={{
              marginBottom:"18px",
              padding:"12px 14px",
              borderRadius:"10px",
              background:"#FFF6FA",
              border:`1px solid ${C.border}`,
              color:C.textMid,
              fontSize:"14px",
              lineHeight:"1.6"
            }}
          >
            Only approved organizers can enter the organizer dashboard. If your account is pending or rejected,
            you will see the status message here when you try to log in.
          </div>
        )}

        {(role === "visitor" || role === "vendor") && (
          <div
            style={{
              marginBottom:"18px",
              padding:"12px 14px",
              borderRadius:"10px",
              background:"#FFF6FA",
              border:`1px solid ${C.border}`,
              color:C.textMid,
              fontSize:"14px",
              lineHeight:"1.6"
            }}
          >
            New {role}?{" "}
            <Link to={`/signup?role=${role}`} style={{ color:C.pink, fontWeight:"700", textDecoration:"none" }}>
              Create your {role} account
            </Link>
            {role === "visitor" ? " to browse expos and book tickets." : " to request stalls at approved expos."}
          </div>
        )}

        {role === "organizer" && signupState === "submitted" && (
          <div
            style={{
              marginBottom:"18px",
              padding:"12px 14px",
              borderRadius:"10px",
              background:"#F0FDF4",
              border:"1px solid #86EFAC",
              color:"#166534",
              fontSize:"14px",
              lineHeight:"1.6"
            }}
          >
            Your organizer account has been submitted successfully. Admin approval is required before you can log in.
          </div>
        )}

        {role === "organizer" && (
          <div
            style={{
              marginBottom:"18px",
              padding:"12px 14px",
              borderRadius:"10px",
              background:"white",
              border:`1px solid ${C.border}`,
              color:C.textMid,
              fontSize:"14px",
              lineHeight:"1.6"
            }}
          >
            New organizer?{" "}
            <Link to="/signup?role=organizer" style={{ color:C.pink, fontWeight:"700", textDecoration:"none" }}>
              Register here
            </Link>{" "}
            and wait for admin approval before logging in.
          </div>
        )}

        {!role && (
          <div
            style={{
              marginBottom:"18px",
              padding:"12px 14px",
              borderRadius:"10px",
              background:"#FFF6FA",
              border:`1px solid ${C.border}`,
              color:C.textMid,
              fontSize:"14px"
            }}
          >
            Choose a role first from the role selection page, then log in with that account.
          </div>
        )}

        <form key={role || "login-form"} onSubmit={handleLogin} autoComplete="off">
          <input
            type="text"
            name="prevent_autofill_username"
            autoComplete="username"
            tabIndex={-1}
            value=""
            readOnly
            aria-hidden="true"
            style={{ display: "none" }}
          />

          <input
            type="password"
            name="prevent_autofill_password"
            autoComplete="new-password"
            tabIndex={-1}
            value=""
            readOnly
            aria-hidden="true"
            style={{ display: "none" }}
          />

          <input
            type="email"
            name="login_email_field"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            onFocus={() => setEmailEditable(true)}
            readOnly={!emailEditable}
            autoComplete="off"
            required
            style={{
              width:"100%",
              padding:"12px",
              marginBottom:"16px",
              borderRadius:"8px",
              border:`1px solid ${C.border}`,
              fontSize:"16px"
            }}
          />

          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="login_password_field"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              onFocus={() => setPasswordEditable(true)}
              readOnly={!passwordEditable}
              autoComplete="new-password"
              required
              style={{
                width:"100%",
                padding:"12px 88px 12px 12px",
                borderRadius:"8px",
                border:`1px solid ${C.border}`,
                fontSize:"16px"
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: C.violetMid,
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "16px" }}>
            <Link to="/forgot-password" style={{ color: C.pink, fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div
              style={{
                color:"red",
                marginBottom:"12px",
                fontSize:"14px",
                background:"#FFF4F4",
                border:"1px solid #F5C2C7",
                borderRadius:"10px",
                padding:"12px"
              }}
            >
              {error}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              width:"100%",
              padding:"14px",
              border:"none",
              borderRadius:"10px",
              background:`linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
              color:"white",
              fontWeight:"600",
              cursor:"pointer"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

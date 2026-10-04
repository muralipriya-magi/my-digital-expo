import { Navigate } from "react-router-dom"
import { clearStoredSession } from "../api/axios"

function decodeJwtPayload(token) {
  const [, payload] = token.split(".")
  if (!payload) {
    throw new Error("Missing JWT payload")
  }

  const normalized = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(payload.length / 4) * 4, "=")

  return JSON.parse(atob(normalized))
}

function isTokenExpired(token) {
  try {
    const payload = decodeJwtPayload(token)
    if (!payload.exp) {
      return false
    }
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export default function ProtectedRoute({ children, allowedRole }){

  const token = localStorage.getItem("access")
  const storedRole = (localStorage.getItem("role") || "").toLowerCase()

  if(!token || isTokenExpired(token)){
    clearStoredSession()

    return <Navigate to="/roles"/>

  }

  if (allowedRole && storedRole !== allowedRole.toLowerCase()) {
    return <Navigate to="/roles"/>
  }

  return children

}

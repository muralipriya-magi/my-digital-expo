import axios from "axios"

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").trim()

export function clearStoredSession() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("role")
}

const api = axios.create({
  baseURL: apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url || "")
    const isAuthRequest = requestUrl.includes("users/login/") || requestUrl.includes("users/signup/")

    if (typeof window !== "undefined" && !isAuthRequest && (status === 401 || status === 403)) {
      clearStoredSession()
      if (window.location.pathname !== "/roles") {
        window.location.assign("/roles")
      }
    }

    return Promise.reject(error)
  }
)

export default api

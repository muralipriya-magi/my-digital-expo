import { useEffect, useState } from "react"
import { CalendarRange, MapPin, Tag, Ticket } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import api from "../../api/axios"
import { C } from "../../constants/colors"
import { getThemeImage } from "../../utils/themeImage"

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function PublicExpoDetail() {
  const { id } = useParams()
  const [expo, setExpo] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get(`expos/detail/${id}/`)
      .then(({ data }) => setExpo(data))
      .catch(() => setError("Unable to load expo details."))
  }, [id])

  if (error) return <div style={{ padding: "40px" }}>{error}</div>
  if (!expo) return <div style={{ padding: "40px" }}>Loading expo details...</div>

  const imageSrc = getThemeImage(expo.theme, expo.theme_image)

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #fff7fb 0%, white 100%)", padding: "32px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Link to="/" style={{ color: C.textMid, textDecoration: "none", fontWeight: "700" }}>
          ← Back to Home
        </Link>

        <div
          style={{
            marginTop: "24px",
            borderRadius: "32px",
            overflow: "hidden",
            background: "white",
            boxShadow: "0 24px 60px rgba(61,0,64,0.08)",
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ height: "360px", background: "#fff0f5" }}>
            <img src={imageSrc} alt={expo.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div style={{ padding: "30px", display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(280px,0.75fr)", gap: "24px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: C.pinkPale, color: C.textMid, fontWeight: "700", marginBottom: "16px" }}>
                <Tag size={14} /> {expo.theme}
              </div>

              <h1 style={{ margin: "0 0 12px", color: C.text, fontSize: "42px", lineHeight: "1.1" }}>{expo.title}</h1>
              <p style={{ color: C.textMid, lineHeight: "1.8", marginBottom: "22px" }}>{expo.description}</p>

              <div style={{ display: "grid", gap: "12px", color: C.textMid }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <MapPin size={18} color={C.pink} /> {expo.city} - {expo.venue}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CalendarRange size={18} color={C.pink} /> {formatDate(expo.start_date)} - {formatDate(expo.end_date)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(180deg, #fff8fc 0%, white 100%)",
                border: `1px solid ${C.border}`,
                borderRadius: "24px",
                padding: "22px",
              }}
            >
              <div style={{ color: C.text, fontWeight: "800", fontSize: "22px", marginBottom: "18px" }}>Expo Details</div>
              <div style={{ display: "grid", gap: "14px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
                  <span style={{ color: C.textLight }}>Ticket Price</span>
                  <strong style={{ color: C.text }}>Rs. {expo.ticket_price}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
                  <span style={{ color: C.textLight }}>Child Ticket</span>
                  <strong style={{ color: C.text }}>Rs. {expo.child_ticket_price}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "14px" }}>
                  <span style={{ color: C.textLight }}>Stall Price</span>
                  <strong style={{ color: C.text }}>Rs. {expo.stall_price}</strong>
                </div>
              </div>

              <Link
                to={`/login?role=visitor&next=${encodeURIComponent(`/visitor-dashboard?expo=${expo.id}`)}`}
                style={{
                  display: "inline-flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${C.pink}, ${C.violetMid})`,
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "800",
                }}
              >
                <Ticket size={18} /> Book Tickets
              </Link>

              <div style={{ marginTop: "14px", textAlign: "center", color: C.textMid, fontSize: "14px", lineHeight: "1.6" }}>
                Want to exhibit at this expo?{" "}
                <Link
                  to={`/login?role=vendor&next=${encodeURIComponent(`/vendor-dashboard?expo=${expo.id}`)}`}
                  style={{ color: C.pink, fontWeight: "800", textDecoration: "none" }}
                >
                  Register or log in as a Vendor to request a stall.
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

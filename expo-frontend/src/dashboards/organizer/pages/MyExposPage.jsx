import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"
import { getThemeImage } from "../../../utils/themeImage"

const statusNotes = {
  PENDING: "Waiting for admin review before this expo can move forward.",
  APPROVED: "Approved by admin and ready for the next activation step.",
  ACTIVE: "Live and available for vendors and visitors.",
  REJECTED: "Rejected by admin. Review your details before creating a revised expo.",
  COMPLETED: "This expo has finished.",
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function Metric({ label, value, accent = C.text }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "16px",
        background: "#FFF8FC",
        border: `1px solid ${C.border}`,
      }}
    >
      <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ color: accent, fontWeight: "800", fontSize: "20px" }}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.textLight }}>{label}</span>
      <strong style={{ color: C.text, textAlign: "right" }}>{value}</strong>
    </div>
  )
}

export default function MyExposPage() {
  const [expos, setExpos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExpoId, setSelectedExpoId] = useState(null)

  useEffect(() => {
    let cancelled = false

    api.get("expos/organizer-expos/")
      .then(({ data }) => {
        if (!cancelled) {
          setExpos(data)
          if (data[0]) {
            setSelectedExpoId(data[0].id)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.response?.data?.detail || "Unable to load your expos")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => ({
    total: expos.length,
    pending: expos.filter((expo) => expo.status === "PENDING").length,
    approved: expos.filter((expo) => expo.status === "APPROVED").length,
    active: expos.filter((expo) => expo.status === "ACTIVE").length,
  }), [expos])

  const selectedExpo = useMemo(
    () => expos.find((expo) => expo.id === selectedExpoId) || null,
    [expos, selectedExpoId]
  )

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>My Expos</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          This page shows every expo you have submitted, along with admin status, schedule, venue, pricing, and capacity details.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Expos" value={counts.total} hint="All expos created from your organizer account." tone="pink" />
        <StatCard label="Pending Review" value={counts.pending} hint="Expos still waiting for admin approval." tone="amber" />
        <StatCard label="Approved" value={counts.approved} hint="Expos approved and ready for the next stage." tone="violet" />
        <StatCard label="Active" value={counts.active} hint="Expos currently live on the platform." tone="cyan" />
      </div>

      {loading && <p style={{ color: C.textMid }}>Loading your expos...</p>}

      {!loading && expos.length === 0 && (
        <div
          style={{
            padding: "22px",
            borderRadius: "22px",
            background: "white",
            border: `1px solid ${C.border}`,
            boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
            color: C.textMid,
          }}
        >
          No expos created yet. Once you submit a new expo from the Create Expo page, it will appear here with its latest admin status.
        </div>
      )}

      {!loading && expos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 0.95fr) minmax(0, 1.3fr)", gap: "22px", alignItems: "start" }}>
          <div
            style={{
              background: "white",
              border: `1px solid ${C.border}`,
              borderRadius: "26px",
              padding: "18px",
              boxShadow: "0 18px 42px rgba(61,0,64,0.05)",
              display: "grid",
              gap: "16px",
            }}
          >
            {expos.map((expo) => {
              const isSelected = expo.id === selectedExpoId
              const imageSrc = getThemeImage(expo.theme, expo.theme_image)

              return (
                <button
                  key={expo.id}
                  type="button"
                  onClick={() => setSelectedExpoId(expo.id)}
                  style={{
                    textAlign: "left",
                    border: isSelected ? "2px solid #C2185B" : `1px solid ${C.border}`,
                    borderRadius: "22px",
                    padding: "0",
                    background: isSelected ? "#FFF7FB" : "white",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 14px 30px rgba(194,24,91,0.10)" : "none",
                  }}
                >
                  <div style={{ height: "168px", overflow: "hidden", background: "#FFF0F5" }}>
                    <img
                      src={imageSrc}
                      alt={expo.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                      {expo.theme}
                    </div>
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "21px", marginBottom: "8px" }}>{expo.title}</div>
                    <div style={{ color: C.textMid, marginBottom: "6px" }}>{expo.city}</div>
                    <div style={{ color: C.textLight, marginBottom: "14px" }}>
                      {formatDate(expo.start_date)} - {formatDate(expo.end_date)}
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "9px 14px",
                        borderRadius: "999px",
                        background: isSelected ? "#3D0040" : "linear-gradient(135deg, #FF8FAB, #C084FC)",
                        color: "white",
                        fontWeight: "700",
                      }}
                    >
                      {isSelected ? "Viewing Details" : "View Details"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedExpo && (
            <div
              style={{
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: "30px",
                overflow: "hidden",
                boxShadow: "0 20px 48px rgba(61,0,64,0.08)",
              }}
            >
              <div
                style={{
                  minHeight: "260px",
                  padding: "30px",
                  color: "white",
                  background: selectedExpo.theme_image
                    ? `linear-gradient(rgba(61,0,64,0.58), rgba(123,45,94,0.88)), url(${selectedExpo.theme_image}) center/cover`
                    : "linear-gradient(135deg, #7B2D5E, #C2185B)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.88, marginBottom: "10px" }}>
                  Expo Details
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: "36px", lineHeight: "1.15" }}>{selectedExpo.title}</h3>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", opacity: 0.94 }}>
                  <span>{selectedExpo.theme}</span>
                  <span>{selectedExpo.city}</span>
                  <span>{selectedExpo.venue}</span>
                  <span>{formatDate(selectedExpo.start_date)} - {formatDate(selectedExpo.end_date)}</span>
                </div>
              </div>

              <div style={{ padding: "28px 30px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,0.9fr)", gap: "26px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "22px" }}>About This Expo</div>
                    <StatusBadge status={selectedExpo.status} />
                  </div>

                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: "#FFF8FC",
                      border: `1px solid ${C.border}`,
                      color: C.textMid,
                      lineHeight: "1.6",
                    }}
                  >
                    <strong style={{ color: C.text }}>Status update:</strong> {statusNotes[selectedExpo.status] || "Current expo status is available above."}
                  </div>

                  <p style={{ margin: 0, color: C.textMid, lineHeight: "1.85" }}>
                    {selectedExpo.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FFF6FA, #FFFFFF)",
                      border: `1px solid ${C.border}`,
                      borderRadius: "24px",
                      padding: "20px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ color: C.text, fontWeight: "800", marginBottom: "12px" }}>Submitted Details</div>
                    <DetailRow label="Theme" value={selectedExpo.theme} />
                    <DetailRow label="City" value={selectedExpo.city} />
                    <DetailRow label="Venue" value={selectedExpo.venue} />
                    <DetailRow label="Dates" value={`${formatDate(selectedExpo.start_date)} - ${formatDate(selectedExpo.end_date)}`} />
                    <DetailRow label="Commission %" value="70%" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px" }}>
                    <Metric label="Max Stalls" value={selectedExpo.max_stalls} accent="#7C3AED" />
                    <Metric label="Max Visitors" value={selectedExpo.max_visitors} accent="#0891B2" />
                    <Metric label="Stall Price" value={`Rs. ${selectedExpo.stall_price}`} accent="#C2185B" />
                    <Metric label="Ticket Price" value={`Rs. ${selectedExpo.ticket_price}`} accent="#B45309" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

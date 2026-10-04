import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"
import { getThemeImage } from "../../../utils/themeImage"

const injectStyles = `
  @keyframes cardPop {
    0%   { opacity: 0; transform: scale(0.93) translateY(14px); }
    60%  { transform: scale(1.02) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,143,171,0.40); }
    50%       { box-shadow: 0 0 0 7px rgba(255,143,171,0); }
  }
  @keyframes stripSlideIn {
    from { opacity: 0; transform: translateX(22px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .expo-strip-track {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding: 6px 4px 14px;
    scrollbar-width: thin;
    scrollbar-color: #F9A8C9 #FFF0F7;
  }
  .expo-strip-track::-webkit-scrollbar { height: 5px; }
  .expo-strip-track::-webkit-scrollbar-track { background: #FFF0F7; border-radius: 999px; }
  .expo-strip-track::-webkit-scrollbar-thumb { background: #F9A8C9; border-radius: 999px; }

  .expo-strip-card {
    position: relative;
    flex-shrink: 0;
    width: 148px;
    height: 200px;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    border: 2.5px solid transparent;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .expo-strip-card:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(255,143,171,0.28); }
  .expo-strip-card.selected {
    border-color: #FF8FAB;
    box-shadow: 0 14px 32px rgba(255,143,171,0.32);
  }

  .expo-strip-card img {
    position: absolute; inset: 0;
    width: 100%; height: 100%; object-fit: cover;
    filter: saturate(0.35) brightness(1.08);
    transition: transform 0.4s ease;
  }
  .expo-strip-card:hover img { transform: scale(1.07); }

  .expo-strip-tint {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(255,228,238,0.18) 0%,
      rgba(255,181,200,0.38) 40%,
      rgba(255,143,171,0.72) 100%
    );
  }
  .expo-strip-card.selected .expo-strip-tint {
    background: linear-gradient(
      to bottom,
      rgba(255,228,238,0.22) 0%,
      rgba(255,181,200,0.48) 40%,
      rgba(255,100,150,0.80) 100%
    );
  }

  .expo-strip-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12px 12px 13px;
    z-index: 2;
    display: flex; flex-direction: column; gap: 7px;
  }
  .expo-strip-badge {
    align-self: flex-start;
    background: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.55);
    color: #fff; font-size: 9px; font-weight: 700;
    padding: 3px 9px; border-radius: 999px;
    letter-spacing: 0.07em; text-transform: uppercase;
    animation: badgePulse 2s ease-in-out infinite;
  }
  .expo-strip-name {
    font-size: 13px; font-weight: 800;
    color: #fff; line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .expo-strip-btn {
    align-self: flex-start;
    border: 1.5px solid rgba(255,255,255,0.65);
    background: rgba(255,255,255,0.16);
    color: #fff; font-size: 10px; font-weight: 700;
    padding: 4px 11px; border-radius: 999px;
    white-space: nowrap; cursor: pointer;
    transition: background 0.18s;
  }
  .expo-strip-card.selected .expo-strip-btn {
    background: rgba(255,143,171,0.55);
    border-color: rgba(255,255,255,0.90);
  }

  .action-btn {
    border: none; border-radius: 999px;
    padding: 12px 16px; color: white; font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }
  .action-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .action-btn:active:not(:disabled) { transform: translateY(0); }
`

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  })
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.textLight }}>{label}</span>
      <strong style={{ color: C.text, textAlign: "right" }}>{value}</strong>
    </div>
  )
}

export default function ExposPage() {
  const [expos, setExpos] = useState([])
  const [featuredExpos, setFeaturedExpos] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [featuredLoadingId, setFeaturedLoadingId] = useState(null)
  const [selectedExpoId, setSelectedExpoId] = useState(null)
  const [selectedFeaturedId, setSelectedFeaturedId] = useState(null)

  const loadExpos = () => {
    api.get("expos/pending-expos/")
      .then(({ data }) => {
        setExpos(data)
        setSelectedExpoId((current) => {
          if (data.find((e) => e.id === current)) return current
          return data[0]?.id ?? null
        })
      })
      .catch(() => toast.error("Unable to load expo approvals"))
  }

  const loadFeaturedExpos = () => {
    api.get("expos/list/")
      .then(({ data }) => {
        setFeaturedExpos(data)
        setSelectedFeaturedId((current) => {
          if (data.find((e) => e.id === current)) return current
          return data.find((e) => e.is_featured)?.id ?? data[0]?.id ?? null
        })
      })
      .catch(() => toast.error("Unable to load featured expo options"))
  }

  useEffect(() => { loadExpos(); loadFeaturedExpos() }, [])

  const selectedExpo = useMemo(
    () => expos.find((e) => e.id === selectedExpoId) || null,
    [expos, selectedExpoId]
  )
  const selectedFeaturedExpo = useMemo(
    () => featuredExpos.find((e) => e.id === selectedFeaturedId) || null,
    [featuredExpos, selectedFeaturedId]
  )

  const updateExpo = async (expoId, status) => {
    try {
      setLoadingId(expoId)
      await api.patch(`expos/expo-approve/${expoId}/`, { status })
      toast.success(`Expo ${status.toLowerCase()} successfully.`)
      loadExpos()
      loadFeaturedExpos()
    } catch {
      toast.error("Unable to update expo status")
    } finally {
      setLoadingId(null)
    }
  }

  const updateFeaturedExpo = async (expoId, isFeatured) => {
    try {
      setFeaturedLoadingId(expoId)
      await api.patch(`expos/expo-approve/${expoId}/`, { is_featured: isFeatured })
      toast.success(isFeatured ? "Featured expo updated successfully." : "Featured expo removed successfully.")
      loadFeaturedExpos()
    } catch (error) {
      const message =
        error?.response?.data?.is_featured?.[0] ||
        error?.response?.data?.detail ||
        "Unable to update featured expo"
      toast.error(message)
    } finally {
      setFeaturedLoadingId(null)
    }
  }

  return (
    <div>
      <style>{injectStyles}</style>

      {/* ── EXPO APPROVALS ── */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Expo Approvals</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Review new expo submissions, validate pricing and capacity, and move ready expos toward activation.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Pending Expos" value={expos.length} hint="Submissions currently awaiting admin action." tone="pink" />
        <StatCard label="Public Expos" value={featuredExpos.length} hint="Approved or active expos available on the public site." tone="purple" />
      </div>

      {expos.length === 0 && <p style={{ color: C.textMid }}>No pending expo approvals.</p>}

      {expos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 0.95fr) minmax(0, 1.3fr)", gap: "22px", alignItems: "start" }}>

          {/* LEFT — pending expo cards */}
          <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "26px", padding: "18px", boxShadow: "0 18px 42px rgba(61,0,64,0.05)", display: "grid", gap: "16px" }}>
            {expos.map((expo, idx) => {
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
                    borderRadius: "22px", padding: "0",
                    background: isSelected ? "#FFF7FB" : "white",
                    overflow: "hidden", cursor: "pointer",
                    boxShadow: isSelected ? "0 14px 30px rgba(194,24,91,0.10)" : "none",
                    animation: `cardPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both`,
                    animationDelay: `${idx * 80}ms`,
                    transition: "border 0.18s, box-shadow 0.18s, background 0.18s, transform 0.18s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = "translateY(-3px)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)" }}
                >
                  <div style={{ height: "168px", overflow: "hidden", background: "#FFF0F5" }}>
                    <img
                      src={imageSrc} alt={expo.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s ease" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{expo.theme}</div>
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "21px", marginBottom: "8px" }}>{expo.title}</div>
                    <div style={{ color: C.textMid, marginBottom: "6px" }}>{expo.city}</div>
                    <div style={{ color: C.textLight, marginBottom: "14px" }}>{formatDate(expo.start_date)} - {formatDate(expo.end_date)}</div>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "9px 14px", borderRadius: "999px",
                      background: isSelected ? C.text : C.gradientPrimary,
                      color: "white", fontWeight: "700", transition: "background 0.2s",
                    }}>
                      {isSelected ? "Viewing Details" : "View Details"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* RIGHT — approval detail panel */}
          {selectedExpo && (
            <div
              key={selectedExpo.id}
              style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "30px", overflow: "hidden", boxShadow: "0 20px 48px rgba(61,0,64,0.08)", animation: "fadeSlideIn 0.32s ease both" }}
            >
              <div style={{
                minHeight: "260px", padding: "30px", color: "white",
                background: selectedExpo.theme_image
                  ? `linear-gradient(rgba(61,0,64,0.58), rgba(123,45,94,0.88)), url(${selectedExpo.theme_image}) center/cover`
                  : "linear-gradient(135deg, #7B2D5E, #C2185B)",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
              }}>
                <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.88, marginBottom: "10px" }}>Expo Approval Details</div>
                <h3 style={{ margin: "0 0 10px", fontSize: "36px", lineHeight: "1.15" }}>{selectedExpo.title}</h3>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", opacity: 0.94 }}>
                  <span>{selectedExpo.theme}</span>
                  <span>{selectedExpo.city}</span>
                  <span>{selectedExpo.venue}</span>
                  <span>{formatDate(selectedExpo.start_date)} - {formatDate(selectedExpo.end_date)}</span>
                </div>
              </div>

              <div style={{ padding: "28px 30px 0 30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
                  <div style={{ color: C.text, fontWeight: "800", fontSize: "22px" }}>About This Expo</div>
                  <StatusBadge status={selectedExpo.status} />
                </div>
                <p style={{ margin: "0 0 18px", color: C.textMid, lineHeight: "1.85" }}>{selectedExpo.description}</p>
                <div style={{ background: "linear-gradient(135deg, #FFF6FA, #FFFFFF)", border: `1px solid ${C.border}`, borderRadius: "24px", padding: "20px" }}>
                  <div style={{ color: C.text, fontWeight: "800", marginBottom: "12px" }}>Submitted Expo Details</div>
                  <DetailRow label="Theme" value={selectedExpo.theme} />
                  <DetailRow label="City" value={selectedExpo.city} />
                  <DetailRow label="Venue" value={selectedExpo.venue} />
                  <DetailRow label="Dates" value={`${formatDate(selectedExpo.start_date)} - ${formatDate(selectedExpo.end_date)}`} />
                  <DetailRow label="Stall Price" value={`Rs. ${selectedExpo.stall_price}`} />
                  <DetailRow label="Ticket Price" value={`Rs. ${selectedExpo.ticket_price}`} />
                  <DetailRow label="Max Stalls" value={selectedExpo.max_stalls} />
                  <DetailRow label="Max Visitors" value={selectedExpo.max_visitors} />
                </div>
              </div>

              {/* Admin Action — full width below */}
              <div style={{ padding: "20px 30px 28px 30px" }}>
                <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "24px", padding: "20px" }}>
                  <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px", fontSize: "20px" }}>Admin Action</div>
                  <div style={{ marginBottom: "16px", padding: "14px 16px", borderRadius: "16px", background: "#FFF8FC", border: `1px solid ${C.border}`, color: C.textMid, lineHeight: "1.7" }}>
                    Revenue split is fixed for every expo: <strong style={{ color: C.text }}>70% platform</strong> and <strong style={{ color: C.text }}>30% organizer</strong>.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <button type="button" className="action-btn" onClick={() => updateExpo(selectedExpo.id, "APPROVED")} disabled={loadingId === selectedExpo.id} style={{ background: C.success }}>
                      {loadingId === selectedExpo.id ? "Updating..." : "Approve Expo"}
                    </button>
                    <button type="button" className="action-btn" onClick={() => updateExpo(selectedExpo.id, "REJECTED")} disabled={loadingId === selectedExpo.id} style={{ background: C.danger }}>
                      {loadingId === selectedExpo.id ? "Updating..." : "Reject Expo"}
                    </button>
                    <button type="button" className="action-btn" onClick={() => updateExpo(selectedExpo.id, "ACTIVE")} disabled={loadingId === selectedExpo.id} style={{ background: C.info }}>
                      {loadingId === selectedExpo.id ? "Updating..." : "Mark Active"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          FEATURED EXPO CONTROL
      ══════════════════════════════════════════ */}
      <div style={{ marginTop: "40px", marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Featured Expo Control</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Choose which approved expo appears first on the landing page hero section.
        </p>
      </div>

      {featuredExpos.length === 0 && (
        <p style={{ color: C.textMid }}>No approved or active expos are available to feature yet.</p>
      )}

      {featuredExpos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── HORIZONTAL SCROLL STRIP ── */}
          <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "26px", padding: "18px 20px 8px", boxShadow: "0 10px 32px rgba(61,0,64,0.05)" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.09em", textTransform: "uppercase", color: C.textLight, marginBottom: "4px" }}>
              Select an expo to feature
            </div>
            <div className="expo-strip-track">
              {featuredExpos.map((expo, idx) => {
                const isSelected = expo.id === selectedFeaturedId
                const imageSrc = getThemeImage(expo.theme, expo.theme_image)
                return (
                  <div
                    key={expo.id}
                    className={`expo-strip-card${isSelected ? " selected" : ""}`}
                    style={{ animation: `stripSlideIn 0.38s cubic-bezier(0.34,1.3,0.64,1) both`, animationDelay: `${idx * 60}ms` }}
                    onClick={() => setSelectedFeaturedId(expo.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && setSelectedFeaturedId(expo.id)}
                  >
                    <img src={imageSrc} alt={expo.title} />
                    <div className="expo-strip-tint" />
                    <div className="expo-strip-content">
                      {expo.is_featured && <span className="expo-strip-badge">★ Featured</span>}
                      <span className="expo-strip-name">{expo.title}</span>
                      <span className="expo-strip-btn">{isSelected ? "Editing" : "Choose"}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── FULL WIDTH DETAIL + FEATURE ACTIONS ── */}
          {selectedFeaturedExpo && (
            <div
              key={selectedFeaturedExpo.id}
              style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "30px", overflow: "hidden", boxShadow: "0 20px 48px rgba(61,0,64,0.08)", animation: "fadeSlideIn 0.32s ease both" }}
            >
              {/* Hero banner */}
              <div style={{
                minHeight: "260px", padding: "30px", color: "white",
                background: selectedFeaturedExpo.theme_image
                  ? `linear-gradient(rgba(61,0,64,0.60), rgba(123,45,94,0.88)), url(${selectedFeaturedExpo.theme_image}) center/cover`
                  : "linear-gradient(135deg, #7B2D5E, #C2185B)",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
              }}>
                <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.88, marginBottom: "10px" }}>Landing Page Spotlight</div>
                <h3 style={{ margin: "0 0 10px", fontSize: "36px", lineHeight: "1.15" }}>{selectedFeaturedExpo.title}</h3>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", opacity: 0.94 }}>
                  <span>{selectedFeaturedExpo.theme}</span>
                  <span>{selectedFeaturedExpo.city}</span>
                  <span>{selectedFeaturedExpo.venue}</span>
                  <span>{formatDate(selectedFeaturedExpo.start_date)} - {formatDate(selectedFeaturedExpo.end_date)}</span>
                </div>
              </div>

              {/* Two-col body: preview details + feature actions */}
              <div style={{ padding: "28px 30px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "28px" }}>

                {/* Left — public expo preview */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "22px" }}>Public Expo Preview</div>
                    <StatusBadge status={selectedFeaturedExpo.status} />
                  </div>
                  <p style={{ margin: "0 0 18px", color: C.textMid, lineHeight: "1.85" }}>{selectedFeaturedExpo.description}</p>
                  <div style={{ background: "linear-gradient(135deg, #FFF6FA, #FFFFFF)", border: `1px solid ${C.border}`, borderRadius: "24px", padding: "20px" }}>
                    <div style={{ color: C.text, fontWeight: "800", marginBottom: "12px" }}>What Visitors Will See</div>
                    <DetailRow label="Theme" value={selectedFeaturedExpo.theme} />
                    <DetailRow label="City" value={selectedFeaturedExpo.city} />
                    <DetailRow label="Venue" value={selectedFeaturedExpo.venue} />
                    <DetailRow label="Dates" value={`${formatDate(selectedFeaturedExpo.start_date)} - ${formatDate(selectedFeaturedExpo.end_date)}`} />
                    <DetailRow label="Stall Price" value={`Rs. ${selectedFeaturedExpo.stall_price}`} />
                    <DetailRow label="Ticket Price" value={`Rs. ${selectedFeaturedExpo.ticket_price}`} />
                  </div>
                </div>

                {/* Right — feature actions (fixed 360px, no overflow) */}
                <div>
                  <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "24px", padding: "20px" }}>
                    <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px", fontSize: "20px" }}>Feature Actions</div>
                    <div style={{ marginBottom: "16px", padding: "14px 16px", borderRadius: "16px", background: "#FFF6FA", border: `1px solid ${C.border}`, color: C.textMid, lineHeight: "1.7" }}>
                      Only one expo can be featured at a time. Choosing a new expo will automatically replace the previous one on the landing page.
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => updateFeaturedExpo(selectedFeaturedExpo.id, true)}
                        disabled={featuredLoadingId === selectedFeaturedExpo.id || selectedFeaturedExpo.is_featured}
                        style={{
                          background: selectedFeaturedExpo.is_featured ? C.textMid : C.violet,
                          cursor: selectedFeaturedExpo.is_featured ? "default" : "pointer",
                          opacity: selectedFeaturedExpo.is_featured ? 0.8 : 1,
                        }}
                      >
                        {featuredLoadingId === selectedFeaturedExpo.id
                          ? "Updating..."
                          : selectedFeaturedExpo.is_featured
                            ? "Currently Featured"
                            : "Set As Featured Expo"}
                      </button>
                      {selectedFeaturedExpo.is_featured && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => updateFeaturedExpo(selectedFeaturedExpo.id, false)}
                          disabled={featuredLoadingId === selectedFeaturedExpo.id}
                          style={{ background: C.muted }}
                        >
                          {featuredLoadingId === selectedFeaturedExpo.id ? "Updating..." : "Remove Featured Tag"}
                        </button>
                      )}
                    </div>
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

import { useEffect, useMemo, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`
}

function ProgressCard({ label, value, max, accent, helper }) {
  const safeMax = Math.max(Number(max || 0), 0)
  const safeValue = Math.max(Number(value || 0), 0)
  const percentage = safeMax > 0 ? Math.min((safeValue / safeMax) * 100, 100) : 0

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${C.border}`,
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <div style={{ color: C.text, fontWeight: "700" }}>{label}</div>
        <div style={{ color: accent, fontWeight: "800" }}>{safeValue}/{safeMax}</div>
      </div>
      <div
        style={{
          height: "12px",
          borderRadius: "999px",
          background: "#FCE7F3",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            borderRadius: "999px",
            background: accent,
          }}
        />
      </div>
      <div style={{ color: C.textMid, lineHeight: "1.6" }}>
        {helper} <strong>{percentage.toFixed(0)}%</strong>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [expos, setExpos] = useState([])
  const [selectedExpoId, setSelectedExpoId] = useState("")
  const [dashboard, setDashboard] = useState(null)
  const [finance, setFinance] = useState(null)
  const [expoStats, setExpoStats] = useState(null)
  const [expoRevenue, setExpoRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expoLoading, setExpoLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      setError("")

      try {
        const [exposRes, dashboardRes, financeRes] = await Promise.all([
          api.get("expos/organizer-expos/"),
          api.get("expos/organizer-dashboard/"),
          api.get("finance/organizer-financial/"),
        ])

        const organizerExpos = exposRes.data
        setExpos(organizerExpos)
        setDashboard(dashboardRes.data)
        setFinance(financeRes.data)

        if (organizerExpos[0]) {
          setSelectedExpoId(String(organizerExpos[0].id))
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load organizer analytics.")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedExpoId) {
      setExpoStats(null)
      setExpoRevenue(null)
      return
    }

    const loadExpoAnalytics = async () => {
      setExpoLoading(true)
      setError("")

      try {
        const [statsRes, revenueRes] = await Promise.all([
          api.get(`expos/expo-stats/${selectedExpoId}/`),
          api.get(`finance/expo-revenue/${selectedExpoId}/`),
        ])
        setExpoStats(statsRes.data)
        setExpoRevenue(revenueRes.data)
      } catch (err) {
        setError(err.response?.data?.detail || "Unable to load the selected expo analytics.")
      } finally {
        setExpoLoading(false)
      }
    }

    loadExpoAnalytics()
  }, [selectedExpoId])

  const selectedExpo = useMemo(
    () => expos.find((expo) => String(expo.id) === String(selectedExpoId)),
    [expos, selectedExpoId],
  )

  if (loading) return <p>Loading analytics...</p>
  if (error && !dashboard && !finance) return <p>{error}</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Analytics</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Track organizer earnings, expo performance, ticket utilization, and stall fill rate from one deeper reporting view.
        </p>
      </div>

      {dashboard && finance && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "28px" }}>
          <StatCard label="Organizer Earnings" value={formatCurrency(finance.total_income)} hint="Net organizer income across all successful expo transactions." tone="pink" />
          <StatCard label="Stall Income" value={formatCurrency(finance.stall_income)} hint="Income driven by approved exhibitor demand." tone="violet" />
          <StatCard label="Ticket Income" value={formatCurrency(finance.ticket_income)} hint="Income generated from visitor ticket purchases." tone="cyan" />
          <StatCard label="Avg. Tickets Per Expo" value={dashboard.total_expos ? (dashboard.total_tickets / dashboard.total_expos).toFixed(1) : "0.0"} hint="A quick signal for audience traction across your portfolio." tone="amber" />
        </div>
      )}

      <div
        style={{
          background: "white",
          border: `1px solid ${C.border}`,
          borderRadius: "22px",
          padding: "20px",
          boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: C.text, fontWeight: "800", marginBottom: "6px" }}>Expo Performance Drilldown</div>
            <div style={{ color: C.textMid }}>Choose one expo to inspect revenue, capacity usage, and on-ground entry behavior.</div>
          </div>

          <select
            value={selectedExpoId}
            onChange={(e) => setSelectedExpoId(e.target.value)}
            style={{ minWidth: "260px", padding: "12px", borderRadius: "12px", border: "1px solid #ddd" }}
          >
            {expos.length === 0 && <option value="">No expos available</option>}
            {expos.map((expo) => (
              <option key={expo.id} value={expo.id}>
                {expo.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p style={{ color: "#B42318" }}>{error}</p>}
      {expoLoading && <p>Loading selected expo analytics...</p>}

      {!expoLoading && selectedExpo && expoStats && expoRevenue && (
        <>
          <div
            style={{
              background: selectedExpo.theme_image
                ? `linear-gradient(rgba(61, 0, 64, 0.78), rgba(123, 45, 94, 0.90)), url(${selectedExpo.theme_image}) center/cover`
                : "linear-gradient(135deg, #C2185B, #7B2D5E)",
              color: "white",
              borderRadius: "26px",
              padding: "26px 28px",
              marginBottom: "24px",
              boxShadow: "0 18px 44px rgba(61,0,64,0.12)",
            }}
          >
            <div style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.88, marginBottom: "8px" }}>
              Selected Expo
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "30px" }}>{selectedExpo.title}</h3>
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", opacity: 0.92 }}>
              <span>{selectedExpo.city}</span>
              <span>{selectedExpo.venue}</span>
              <span>{new Date(selectedExpo.start_date).toLocaleDateString()} - {new Date(selectedExpo.end_date).toLocaleDateString()}</span>
              <span>Status: {selectedExpo.status}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
            <StatCard label="Expo Revenue" value={formatCurrency(expoRevenue.total_revenue)} hint="Gross transaction volume recorded for this expo." tone="pink" />
            <StatCard label="Organizer Share" value={formatCurrency(expoRevenue.organizer_income)} hint="The net amount retained by you after commission." tone="violet" />
            <StatCard label="Platform Commission" value={formatCurrency(expoRevenue.platform_commission)} hint="Commission withheld by the platform for this expo." tone="cyan" />
            <StatCard label="Entry Conversion" value={expoStats.tickets_booked ? `${((expoStats.tickets_verified / expoStats.tickets_booked) * 100).toFixed(0)}%` : "0%"} hint="Booked tickets that actually converted into venue entries." tone="amber" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px", marginBottom: "24px" }}>
            <ProgressCard
              label="Visitor Capacity Usage"
              value={expoStats.tickets_booked}
              max={expoStats.max_visitors}
              accent="#C2185B"
              helper="Booked visitor capacity used:"
            />
            <ProgressCard
              label="Verified Entry Usage"
              value={expoStats.tickets_verified}
              max={expoStats.max_visitors}
              accent="#0891B2"
              helper="Verified venue entry against total visitor capacity:"
            />
            <ProgressCard
              label="Stall Fill Rate"
              value={expoStats.stalls_approved}
              max={expoStats.max_stalls}
              accent="#7C3AED"
              helper="Approved stalls against total stall capacity:"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
            <div
              style={{
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
              }}
            >
              <div style={{ color: C.text, fontWeight: "800", marginBottom: "14px" }}>Revenue Mix</div>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: C.textMid }}>Stall Revenue</span>
                  <strong style={{ color: C.text }}>{formatCurrency(expoRevenue.stall_revenue)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: C.textMid }}>Ticket Revenue</span>
                  <strong style={{ color: C.text }}>{formatCurrency(expoRevenue.ticket_revenue)}</strong>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
              }}
            >
              <div style={{ color: C.text, fontWeight: "800", marginBottom: "14px" }}>Operational Snapshot</div>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: C.textMid }}>Tickets Remaining</span>
                  <strong style={{ color: C.text }}>{expoStats.tickets_remaining}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: C.textMid }}>Stalls Requested</span>
                  <strong style={{ color: C.text }}>{expoStats.stalls_booked}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ color: C.textMid }}>Approved Stalls</span>
                  <strong style={{ color: C.text }}>{expoStats.stalls_approved}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

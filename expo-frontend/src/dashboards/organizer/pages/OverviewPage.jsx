import { useEffect, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [finance, setFinance] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("expos/organizer-dashboard/"),
      api.get("finance/organizer-financial/"),
    ])
      .then(([statsRes, financeRes]) => {
        setStats(statsRes.data)
        setFinance(financeRes.data)
      })
      .catch((err) => setError(err.response?.data?.detail || "Unable to load organizer stats"))
  }, [])

  if (error) return <p>{error}</p>
  if (!stats || !finance) return <p>Loading...</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Organizer Overview</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Watch your expo pipeline, approvals, audience growth, and earnings from one organizer command center.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Expos" value={stats.total_expos} hint="Expos created under your organizer account." tone="pink" />
        <StatCard label="Total Stall Requests" value={stats.total_stalls} hint="Vendor requests received across your expos." tone="violet" />
        <StatCard label="Approved Stalls" value={stats.approved_stalls} hint="Vendor requests you have approved." tone="cyan" />
        <StatCard label="Total Tickets" value={stats.total_tickets} hint="Visitor tickets booked for your expos." tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Total Revenue</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {stats.total_revenue}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Organizer earnings recorded from both stall and ticket transactions.</p>
        </div>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Stall Income</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {finance.stall_income}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Revenue contributed by exhibitor stall bookings.</p>
        </div>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Ticket Income</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {finance.ticket_income}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Revenue contributed by visitor ticket purchases.</p>
        </div>
      </div>
    </div>
  )
}

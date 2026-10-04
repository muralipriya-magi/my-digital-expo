import { useEffect, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

export default function OverviewPage() {
  const [finance, setFinance] = useState(null)
  const [counts, setCounts] = useState({ organizers: 0, expos: 0 })
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("finance/financial-dashboard/"),
      api.get("users/organizers/?status=PENDING"),
      api.get("expos/pending-expos/"),
    ])
      .then(([financeRes, organizersRes, exposRes]) => {
        setFinance(financeRes.data)
        setCounts({
          organizers: organizersRes.data.length,
          expos: exposRes.data.length,
        })
      })
      .catch(() => setError("Unable to load admin overview"))
  }, [])

  if (error) return <p>{error}</p>
  if (!finance) return <p>Loading...</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Platform Overview</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Monitor marketplace revenue, approval queues, and platform-level financial performance at a glance.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Revenue" value={`Rs. ${finance.total_revenue}`} hint="Gross payment volume across stalls and tickets." tone="pink" />
        <StatCard label="Platform Commission" value={`Rs. ${finance.platform_commission}`} hint="Revenue retained by the platform." tone="violet" />
        <StatCard label="Organizer Earnings" value={`Rs. ${finance.organizer_earnings}`} hint="Total organizer payout share." tone="cyan" />
        <StatCard label="Pending Organizer Approvals" value={counts.organizers} hint="Organizer accounts waiting for admin action." tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Pending Expo Approvals</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>{counts.expos}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Expo submissions currently waiting for admin review and status decisions.</p>
        </div>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Stall Revenue</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {finance.stall_revenue}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Gross revenue generated from exhibitor stall payments.</p>
        </div>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Ticket Revenue</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {finance.ticket_revenue}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>Gross revenue generated from visitor ticket purchases.</p>
        </div>
      </div>
    </div>
  )
}

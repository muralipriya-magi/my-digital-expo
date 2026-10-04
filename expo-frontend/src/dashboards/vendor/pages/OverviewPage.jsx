import { useEffect, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

export default function OverviewPage() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("expos/vendor-dashboard/"),
      api.get("finance/my-transactions/"),
    ])
      .then(([statsRes, transactionsRes]) => {
        setStats(statsRes.data)
        setTransactions(transactionsRes.data.filter((item) => item.transaction_type === "STALL"))
      })
      .catch(() => setError("Unable to load vendor stats"))
  }, [])

  if (error) return <p>{error}</p>
  if (!stats) return <p>Loading...</p>

  const totalSpend = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Vendor Overview</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Track your stall requests, approvals, and spending like a real exhibitor dashboard.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Vendor" value={stats.vendor} hint="Current signed-in exhibitor account." tone="pink" />
        <StatCard label="Total Stall Requests" value={stats.total_stalls} hint="All expo stall requests you have created." tone="violet" />
        <StatCard label="Approved Bookings" value={stats.approved_stalls} hint="Requests approved by organizers." tone="cyan" />
        <StatCard label="Pending Bookings" value={stats.pending_stalls} hint="Requests still waiting for organizer action." tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "16px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Total Stall Spend</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>Rs. {totalSpend.toFixed(2)}</div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>
            The total value of your recorded stall payment transactions across active and past expos.
          </p>
        </div>

        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Rejected Requests</div>
          <div style={{ color: C.text, fontSize: "30px", fontWeight: "800", marginBottom: "8px" }}>
            {stats.rejected_stalls ?? 0}
          </div>
          <p style={{ color: C.textMid, margin: 0, lineHeight: "1.6" }}>
            Stall requests that were declined by organizers and may need a better pitch or a different expo.
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`
}

function ProgressRow({ label, value, total, accent }) {
  const safeTotal = Math.max(Number(total || 0), 0)
  const safeValue = Math.max(Number(value || 0), 0)
  const percentage = safeTotal > 0 ? Math.min((safeValue / safeTotal) * 100, 100) : 0

  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
        <span style={{ color: C.textMid }}>{label}</span>
        <strong style={{ color: C.text }}>{safeValue}</strong>
      </div>
      <div style={{ height: "10px", borderRadius: "999px", background: "#FCE7F3", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: accent, borderRadius: "999px" }} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [finance, setFinance] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("finance/financial-dashboard/"),
      api.get("finance/platform-analytics/"),
      api.get("finance/monthly-revenue/"),
    ])
      .then(([financeRes, analyticsRes, monthlyRes]) => {
        setFinance(financeRes.data)
        setAnalytics(analyticsRes.data)
        setMonthlyRevenue(monthlyRes.data)
      })
      .catch((err) => setError(err.response?.data?.detail || "Unable to load admin analytics"))
  }, [])

  const totals = useMemo(() => {
    if (!analytics) {
      return { organizerTotal: 0, expoTotal: 0, monthlyPeak: 0, monthlyAverage: 0 }
    }

    const organizerTotal = Object.values(analytics.organizers || {}).reduce((sum, item) => sum + Number(item || 0), 0)
    const expoTotal = Object.values(analytics.expos || {}).reduce((sum, item) => sum + Number(item || 0), 0)
    const revenueValues = monthlyRevenue.map((item) => Number(item.revenue || 0))
    const monthlyPeak = revenueValues.length ? Math.max(...revenueValues) : 0
    const monthlyAverage = revenueValues.length
      ? revenueValues.reduce((sum, item) => sum + item, 0) / revenueValues.length
      : 0

    return { organizerTotal, expoTotal, monthlyPeak, monthlyAverage }
  }, [analytics, monthlyRevenue])

  const maxMonthlyRevenue = useMemo(
    () => Math.max(...monthlyRevenue.map((item) => Number(item.revenue || 0)), 0),
    [monthlyRevenue],
  )

  if (error) return <p>{error}</p>
  if (!finance || !analytics) return <p>Loading analytics...</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Analytics</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Analyze platform growth, approval pipelines, top-performing expos, and monthly revenue momentum in one admin reporting view.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "28px" }}>
        <StatCard label="Platform Revenue" value={formatCurrency(finance.total_revenue)} hint="Gross transaction volume across the full marketplace." tone="pink" />
        <StatCard label="Monthly Revenue Peak" value={formatCurrency(totals.monthlyPeak)} hint="Highest recorded month from successful platform transactions." tone="violet" />
        <StatCard label="Avg. Monthly Revenue" value={formatCurrency(totals.monthlyAverage)} hint="Average monthly gross revenue across all recorded months." tone="cyan" />
        <StatCard label="Tracked Expos" value={totals.expoTotal} hint="All expos currently tracked across statuses." tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Organizer Approval Breakdown</div>
          <ProgressRow label="Pending" value={analytics.organizers.pending} total={totals.organizerTotal} accent="#B45309" />
          <ProgressRow label="Approved" value={analytics.organizers.approved} total={totals.organizerTotal} accent="#166534" />
          <ProgressRow label="Rejected" value={analytics.organizers.rejected} total={totals.organizerTotal} accent="#B42318" />
        </div>

        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Expo Status Breakdown</div>
          <ProgressRow label="Pending" value={analytics.expos.pending} total={totals.expoTotal} accent="#B45309" />
          <ProgressRow label="Approved" value={analytics.expos.approved} total={totals.expoTotal} accent="#7C3AED" />
          <ProgressRow label="Active" value={analytics.expos.active} total={totals.expoTotal} accent="#0891B2" />
          <ProgressRow label="Completed" value={analytics.expos.completed} total={totals.expoTotal} accent="#166534" />
          <ProgressRow label="Rejected" value={analytics.expos.rejected} total={totals.expoTotal} accent="#B42318" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Monthly Revenue Trend</div>

          {monthlyRevenue.length === 0 && <p style={{ color: C.textMid, margin: 0 }}>No successful transactions recorded yet.</p>}

          {monthlyRevenue.length > 0 && (
            <div style={{ display: "grid", gap: "14px" }}>
              {monthlyRevenue.map((item) => {
                const value = Number(item.revenue || 0)
                const width = maxMonthlyRevenue > 0 ? Math.max((value / maxMonthlyRevenue) * 100, 4) : 4
                return (
                  <div key={item.month}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                      <span style={{ color: C.textMid }}>
                        {new Date(item.month).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                      </span>
                      <strong style={{ color: C.text }}>{formatCurrency(value)}</strong>
                    </div>
                    <div style={{ height: "12px", borderRadius: "999px", background: "#FCE7F3", overflow: "hidden" }}>
                      <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(135deg, #FF8FAB, #A855F7)", borderRadius: "999px" }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Revenue Mix</div>
          <div style={{ display: "grid", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: C.textMid }}>Platform Commission</span>
              <strong style={{ color: C.text }}>{formatCurrency(finance.platform_commission)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: C.textMid }}>Organizer Earnings</span>
              <strong style={{ color: C.text }}>{formatCurrency(finance.organizer_earnings)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: C.textMid }}>Stall Revenue</span>
              <strong style={{ color: C.text }}>{formatCurrency(finance.stall_revenue)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <span style={{ color: C.textMid }}>Ticket Revenue</span>
              <strong style={{ color: C.text }}>{formatCurrency(finance.ticket_revenue)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
        <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Top Performing Expos</div>

        {analytics.top_expos.length === 0 && (
          <p style={{ color: C.textMid, margin: 0 }}>No expo performance data yet.</p>
        )}

        {analytics.top_expos.length > 0 && (
          <div style={{ display: "grid", gap: "14px" }}>
            {analytics.top_expos.map((expo, index) => (
              <div
                key={expo.expo_id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: "18px",
                  padding: "18px",
                  background: index === 0 ? "linear-gradient(135deg, #FFF2F7, #FFFFFF)" : "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: "800" }}>{expo.title}</div>
                    <div style={{ color: C.textMid, fontSize: "14px" }}>{expo.transactions} successful transactions</div>
                  </div>
                  <div style={{ color: "#C2185B", fontWeight: "800" }}>{formatCurrency(expo.revenue)}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px" }}>
                  <div style={{ color: C.textMid }}>Commission: <strong style={{ color: C.text }}>{formatCurrency(expo.commission)}</strong></div>
                  <div style={{ color: C.textMid }}>Organizer Income: <strong style={{ color: C.text }}>{formatCurrency(expo.organizer_income)}</strong></div>
                  <div style={{ color: C.textMid }}>Tickets Booked: <strong style={{ color: C.text }}>{expo.tickets_booked}</strong></div>
                  <div style={{ color: C.textMid }}>Approved Stalls: <strong style={{ color: C.text }}>{expo.approved_stalls}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

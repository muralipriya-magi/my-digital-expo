import { useEffect, useMemo, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import { C } from "../../../constants/colors"

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toFixed(2)}`
}

function MetricRow({ label, value, accent = C.text }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
      <span style={{ color: C.textMid }}>{label}</span>
      <strong style={{ color: accent }}>{value}</strong>
    </div>
  )
}

export default function FinancePage() {
  const [finance, setFinance] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("finance/financial-dashboard/"),
      api.get("finance/monthly-revenue/"),
      api.get("finance/platform-analytics/"),
    ])
      .then(([financeRes, monthlyRes, analyticsRes]) => {
        setFinance(financeRes.data)
        setMonthlyRevenue(monthlyRes.data)
        setAnalytics(analyticsRes.data)
      })
      .catch((err) => setError(err.response?.data?.detail || "Unable to load finance dashboard"))
  }, [])

  const derived = useMemo(() => {
    if (!finance) {
      return {
        commissionRate: 0,
        organizerShareRate: 0,
        stallShareRate: 0,
        ticketShareRate: 0,
        averageMonthRevenue: 0,
        peakMonthRevenue: 0,
      }
    }

    const totalRevenue = Number(finance.total_revenue || 0)
    const platformCommission = Number(finance.platform_commission || 0)
    const organizerEarnings = Number(finance.organizer_earnings || 0)
    const stallRevenue = Number(finance.stall_revenue || 0)
    const ticketRevenue = Number(finance.ticket_revenue || 0)
    const revenueSeries = monthlyRevenue.map((item) => Number(item.revenue || 0))
    const averageMonthRevenue = revenueSeries.length
      ? revenueSeries.reduce((sum, item) => sum + item, 0) / revenueSeries.length
      : 0
    const peakMonthRevenue = revenueSeries.length ? Math.max(...revenueSeries) : 0

    return {
      commissionRate: totalRevenue ? (platformCommission / totalRevenue) * 100 : 0,
      organizerShareRate: totalRevenue ? (organizerEarnings / totalRevenue) * 100 : 0,
      stallShareRate: totalRevenue ? (stallRevenue / totalRevenue) * 100 : 0,
      ticketShareRate: totalRevenue ? (ticketRevenue / totalRevenue) * 100 : 0,
      averageMonthRevenue,
      peakMonthRevenue,
    }
  }, [finance, monthlyRevenue])

  const maxMonthlyRevenue = useMemo(
    () => Math.max(...monthlyRevenue.map((item) => Number(item.revenue || 0)), 0),
    [monthlyRevenue],
  )

  if (error) return <p>{error}</p>
  if (!finance || !analytics) return <p>Loading...</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Finance Dashboard</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Review platform-wide revenue health, commission performance, monthly trends, and expo-level financial leaders from one polished reporting view.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "28px" }}>
        <StatCard label="Total Revenue" value={formatCurrency(finance.total_revenue)} hint="Gross value from all successful transactions." tone="pink" />
        <StatCard label="Platform Commission" value={formatCurrency(finance.platform_commission)} hint="Total commission retained by the platform." tone="violet" />
        <StatCard label="Organizer Earnings" value={formatCurrency(finance.organizer_earnings)} hint="Combined organizer share after commission split." tone="cyan" />
        <StatCard label="Avg. Monthly Revenue" value={formatCurrency(derived.averageMonthRevenue)} hint="Average successful monthly platform revenue." tone="amber" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Financial Split</div>
          <div style={{ display: "grid", gap: "14px" }}>
            <MetricRow label="Platform Commission Rate" value={`${derived.commissionRate.toFixed(1)}%`} accent="#7C3AED" />
            <MetricRow label="Organizer Share Rate" value={`${derived.organizerShareRate.toFixed(1)}%`} accent="#0891B2" />
            <MetricRow label="Stall Revenue Share" value={`${derived.stallShareRate.toFixed(1)}%`} accent="#C2185B" />
            <MetricRow label="Ticket Revenue Share" value={`${derived.ticketShareRate.toFixed(1)}%`} accent="#B45309" />
          </div>
        </div>

        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Revenue Mix</div>
          <div style={{ display: "grid", gap: "14px" }}>
            <MetricRow label="Stall Revenue" value={formatCurrency(finance.stall_revenue)} accent="#C2185B" />
            <MetricRow label="Ticket Revenue" value={formatCurrency(finance.ticket_revenue)} accent="#B45309" />
            <MetricRow label="Monthly Peak" value={formatCurrency(derived.peakMonthRevenue)} accent="#166534" />
            <MetricRow label="Tracked Top Expos" value={String(analytics.top_expos.length)} accent="#3D0040" />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Monthly Revenue Trend</div>

          {monthlyRevenue.length === 0 && <p style={{ color: C.textMid, margin: 0 }}>No successful monthly transactions yet.</p>}

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
                      <div
                        style={{
                          width: `${width}%`,
                          height: "100%",
                          borderRadius: "999px",
                          background: "linear-gradient(135deg, #FF8FAB, #A855F7)",
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
          <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Approval Impact Snapshot</div>
          <div style={{ display: "grid", gap: "14px" }}>
            <MetricRow label="Pending Organizers" value={String(analytics.organizers.pending)} accent="#B45309" />
            <MetricRow label="Approved Organizers" value={String(analytics.organizers.approved)} accent="#166534" />
            <MetricRow label="Pending Expos" value={String(analytics.expos.pending)} accent="#B45309" />
            <MetricRow label="Active Expos" value={String(analytics.expos.active)} accent="#0891B2" />
            <MetricRow label="Completed Expos" value={String(analytics.expos.completed)} accent="#166534" />
          </div>
        </div>
      </div>

      <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "22px", padding: "20px", boxShadow: "0 16px 36px rgba(61,0,64,0.05)" }}>
        <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px" }}>Top Expo Revenue Leaders</div>

        {analytics.top_expos.length === 0 && (
          <p style={{ color: C.textMid, margin: 0 }}>No top expo financial data yet.</p>
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
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: "800" }}>{expo.title}</div>
                    <div style={{ color: C.textMid, fontSize: "14px" }}>{expo.transactions} successful transactions</div>
                  </div>
                  <strong style={{ color: "#C2185B", fontSize: "18px" }}>{formatCurrency(expo.revenue)}</strong>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "12px" }}>
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

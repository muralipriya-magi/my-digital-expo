import { lazy, useEffect, useState } from "react"
import { C } from "../../constants/colors"
import api from "../../api/axios"
import DashboardLayout from "../../components/dashboard/DashboardLayout"
import StatCard from "../../components/dashboard/StatCard"

const ExploreExpos = lazy(() => import("./pages/ExploreExpos"))
const MyTickets = lazy(() => import("./pages/MyTickets"))
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"))

function VisitorOverview() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get("expos/list/"),
      api.get("expos/my-tickets/"),
      api.get("finance/my-transactions/"),
    ])
      .then(([exposRes, ticketsRes, transactionsRes]) => {
        const ticketPayments = transactionsRes.data.filter((item) => item.transaction_type === "TICKET")
        const totalSpend = ticketPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        setSummary({
          activeExpos: exposRes.data.length,
          totalTickets: ticketsRes.data.length,
          usedTickets: ticketsRes.data.filter((item) => item.qr_verified).length,
          totalSpend,
        })
      })
      .catch(() => setError("Unable to load visitor overview"))
  }, [])

  if (error) return <p>{error}</p>
  if (!summary) return <p>Loading...</p>

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Visitor Dashboard</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Discover live expos, open full exhibition details, and book your event entry from one visitor-friendly space.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Active Expos" value={summary.activeExpos} hint="Open expos currently available for discovery." tone="pink" />
        <StatCard label="My Tickets" value={summary.totalTickets} hint="Total visitor tickets booked under your account." tone="violet" />
        <StatCard label="Used Tickets" value={summary.usedTickets} hint="Tickets already scanned at venue entry." tone="cyan" />
        <StatCard label="Ticket Spend" value={`Rs. ${summary.totalSpend.toFixed(2)}`} hint="Your recorded visitor payment total." tone="amber" />
      </div>
    </div>
  )
}

export default function VisitorDashboard() {
  const menu = [
    { id: "overview", label: "Overview", icon: "Overview", component: VisitorOverview },
    { id: "explore", label: "Live Expos", icon: "Expos", component: ExploreExpos },
    { id: "tickets", label: "My Tickets", icon: "Tickets", component: MyTickets },
    { id: "payments", label: "Payment History", icon: "Payments", component: PaymentHistory },
  ]

  return <DashboardLayout title="Visitor Dashboard" menu={menu} />
}

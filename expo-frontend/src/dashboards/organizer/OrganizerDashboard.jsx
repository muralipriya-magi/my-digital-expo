import { lazy } from "react"

import DashboardLayout from "../../components/dashboard/DashboardLayout"

const OverviewPage = lazy(() => import("./pages/OverviewPage"))
const MyExposPage = lazy(() => import("./pages/MyExposPage"))
const CreateExpoPage = lazy(() => import("./pages/CreateExpoPage"))
const StallManagement = lazy(() => import("./pages/StallManagement"))
const TicketSales = lazy(() => import("./pages/TicketSales"))
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"))

export default function OrganizerDashboard() {
  const menu = [
    { id: "overview", label: "Overview", icon: "Overview", component: OverviewPage },
    { id: "my-expos", label: "My Expos", icon: "Expos", component: MyExposPage },
    { id: "create-expo", label: "Create Expo", icon: "Create", component: CreateExpoPage },
    { id: "stalls", label: "Stall Management", icon: "Stalls", component: StallManagement },
    { id: "tickets", label: "Ticket Sales", icon: "Tickets", component: TicketSales },
    { id: "analytics", label: "Analytics", icon: "Analytics", component: AnalyticsPage },
  ]

  return (
    <DashboardLayout
      title="Organizer Dashboard"
      menu={menu}
    />
  )
}

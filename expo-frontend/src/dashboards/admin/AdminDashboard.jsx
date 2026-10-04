import { lazy } from "react"

import DashboardLayout from "../../components/dashboard/DashboardLayout"

const OverviewPage = lazy(() => import("./pages/OverviewPage"))
const OrganizersPage = lazy(() => import("./pages/OrganizerPage"))
const ExposPage = lazy(() => import("./pages/ExposPage"))
const FinancePage = lazy(() => import("./pages/FinancePage"))
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"))

export default function AdminDashboard() {
  const menu = [
    { id: "overview", label: "Overview", icon: "Overview", component: OverviewPage },
    { id: "organizers", label: "Organizer Approvals", icon: "Organizers", component: OrganizersPage },
    { id: "expos", label: "Expo Approvals", icon: "Expos", component: ExposPage },
    { id: "finance", label: "Finance", icon: "Finance", component: FinancePage },
    { id: "analytics", label: "Analytics", icon: "Analytics", component: AnalyticsPage },
  ]

  return (
    <DashboardLayout
      title="Admin Dashboard"
      menu={menu}
    />
  )
}

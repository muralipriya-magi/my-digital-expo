import { lazy } from "react"

import DashboardLayout from "../../components/dashboard/DashboardLayout"

const OverviewPage = lazy(() => import("./pages/OverviewPage"))
const AvailableExpos = lazy(() => import("./pages/AvailableExpos"))
const MyBookings = lazy(() => import("./pages/MyBookings"))
const Payments = lazy(() => import("./pages/Payments"))

export default function VendorDashboard() {
  const menu = [
    { id: "overview", label: "Overview", icon: "Overview", component: OverviewPage },
    { id: "expos", label: "Approved Expos", icon: "Expos", component: AvailableExpos },
    { id: "bookings", label: "My Bookings", icon: "Bookings", component: MyBookings },
    { id: "payments", label: "Payments", icon: "Payments", component: Payments },
  ]

  return (
    <DashboardLayout
      title="Vendor Dashboard"
      menu={menu}
    />
  )
}

import {
  BarChart3,
  CalendarRange,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PlusSquare,
  Sparkles,
  Store,
  Ticket,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { clearStoredSession } from "../../api/axios"
import { C } from "../../constants/colors"

const iconMap = {
  Overview: LayoutDashboard,
  Organizers: Users,
  Expos: CalendarRange,
  Finance: CreditCard,
  Analytics: BarChart3,
  Create: PlusSquare,
  Stalls: Store,
  Tickets: Ticket,
  Bookings: ClipboardList,
  Payments: CreditCard,
}

export default function Sidebar({ items, active, onChange }) {
  const navigate = useNavigate()

  return (
    <aside
      style={{
        width: "250px",
        background: C.white,
        borderRight: `1px solid ${C.borderSoft}`,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontWeight: "800",
          marginBottom: "30px",
          color: C.text,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Sparkles size={24} />
        <span>ExpoSphere</span>
      </h2>

      {items.map((item) => {
        const Icon = iconMap[item.icon] ?? LayoutDashboard

        return (
          <div
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              marginBottom: "8px",
              background: active === item.id ? C.pinkLight : "transparent",
              color: C.text,
              fontWeight: "600",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Icon size={18} />
              <span>{item.label}</span>
            </span>
          </div>
        )
      })}

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={() => {
            clearStoredSession()
            navigate("/roles")
          }}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: `1px solid ${C.border}`,
            background: C.pinkPale,
            cursor: "pointer",
            color: C.text,
            fontWeight: "700",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

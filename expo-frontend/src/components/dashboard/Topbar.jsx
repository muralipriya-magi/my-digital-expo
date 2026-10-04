import { useEffect, useState } from "react"

import api from "../../api/axios"
import { C } from "../../constants/colors"

export default function Topbar({ title }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    api.get("users/notifications/")
      .then(({ data }) => {
        if (!cancelled) {
          setNotifications(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const unreadCount = notifications.filter((item) => !item.is_read).length

  const markAllRead = async () => {
    try {
      await api.post("users/notifications/mark-all-read/")
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
    } catch {
      // Keep current state if the request fails.
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: C.text,
        }}
      >
        {title}
      </h1>

      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          style={{
            background: C.pinkPale,
            padding: "8px 14px",
            borderRadius: "10px",
            border: `1px solid ${C.border}`,
            color: C.text,
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 12px)",
              width: "360px",
              maxHeight: "420px",
              overflowY: "auto",
              background: C.white,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: "16px",
              boxShadow: "0 18px 40px rgba(61,0,64,0.12)",
              padding: "16px",
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <strong style={{ color: C.text }}>Recent Updates</strong>
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.textMid,
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Mark all read
              </button>
            </div>

            {loading && <p style={{ color: C.textMid }}>Loading notifications...</p>}

            {!loading && notifications.length === 0 && (
              <p style={{ color: C.textLight, margin: 0 }}>No notifications yet.</p>
            )}

            {!loading && notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  marginBottom: "10px",
                  background: item.is_read ? C.white : "#FFF6FA",
                  border: item.is_read ? `1px solid ${C.borderSoft}` : `1px solid ${C.dangerBorder}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <strong style={{ color: C.text }}>{item.title}</strong>
                  {!item.is_read && (
                    <span style={{ color: C.danger, fontSize: "12px", fontWeight: "800" }}>New</span>
                  )}
                </div>
                <p style={{ margin: "0 0 6px", color: C.textMid, lineHeight: "1.5" }}>{item.message}</p>
                <small style={{ color: C.textLight }}>{new Date(item.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

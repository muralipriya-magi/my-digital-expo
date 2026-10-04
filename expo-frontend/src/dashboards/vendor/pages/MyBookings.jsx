import { useEffect, useState } from "react"

import api from "../../../api/axios"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"

function formatDateRange(start, end) {
  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
}

function printVendorPass(booking) {
  const passWindow = window.open("", "_blank", "width=900,height=700")
  if (!passWindow) return

  passWindow.document.write(`
    <html>
      <head>
        <title>${booking.stall_name} Booking Pass</title>
        <style>
          body { margin: 0; padding: 32px; background: #fff7fb; font-family: Arial, sans-serif; color: #3D0040; }
          .card { max-width: 860px; margin: 0 auto; border-radius: 24px; overflow: hidden; border: 1px solid #f3d5e4; background: white; box-shadow: 0 18px 44px rgba(61,0,64,0.12); }
          .hero { padding: 28px 32px; color: white; background: linear-gradient(135deg, #7B2D5E, #C2185B); }
          .body { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; padding: 28px 32px 32px; }
          .label { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #9B6B80; margin-bottom: 6px; }
          .value { font-size: 16px; font-weight: 700; margin-bottom: 18px; }
          .receipt { border-left: 1px dashed #f1c2d6; padding-left: 24px; }
          .badge { display: inline-block; padding: 8px 12px; border-radius: 999px; font-weight: 700; border: 1px solid ${booking.status === "APPROVED" ? C.successBorder : booking.status === "REJECTED" ? C.dangerBorder : C.warningBorder}; background: ${booking.status === "APPROVED" ? C.successBg : booking.status === "REJECTED" ? C.dangerBg : C.warningBg}; color: ${booking.status === "APPROVED" ? C.success : booking.status === "REJECTED" ? C.danger : C.warning}; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="hero">
            <div style="font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .85;">ExpoSphere Exhibitor Pass</div>
            <h1 style="margin: 12px 0 8px; font-size: 34px;">${booking.stall_name}</h1>
            <div style="font-size: 16px; opacity: .92;">${booking.expo_title}</div>
          </div>
          <div class="body">
            <div>
              <div class="label">Theme</div>
              <div class="value">${booking.expo_theme}</div>
              <div class="label">Venue</div>
              <div class="value">${booking.expo_venue}, ${booking.expo_city}</div>
              <div class="label">Expo Dates</div>
              <div class="value">${formatDateRange(booking.expo_start_date, booking.expo_end_date)}</div>
              <div class="label">Stall Description</div>
              <div class="value">${booking.stall_description}</div>
            </div>
            <div class="receipt">
              <div class="label">Booking Status</div>
              <div class="value"><span class="badge">${booking.status}</span></div>
              <div class="label">Amount Paid</div>
              <div class="value">Rs. ${booking.amount}</div>
              <div class="label">Payment Method</div>
              <div class="value">${booking.payment_method || "N/A"}</div>
              <div class="label">Payment Reference</div>
              <div class="value">${booking.payment_reference || "N/A"}</div>
              <div class="label">Payment Date</div>
              <div class="value">${booking.payment_date ? new Date(booking.payment_date).toLocaleString() : "N/A"}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `)
  passWindow.document.close()
  passWindow.focus()
  passWindow.print()
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("expos/vendor-bookings/")
      .then(({ data }) => setBookings(data))
      .catch(() => setError("Unable to load your bookings"))
  }, [])

  if (error) return <p>{error}</p>

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>My Bookings</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Manage your stall bookings as polished exhibitor passes, complete with payment details and print support.
        </p>
      </div>

      {bookings.length === 0 && <p>No stall bookings yet.</p>}

      <div style={{ display: "grid", gap: "22px" }}>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              borderRadius: "26px",
              overflow: "hidden",
              background: "white",
              border: `1px solid ${C.border}`,
              boxShadow: "0 18px 44px rgba(61,0,64,0.08)",
            }}
          >
            <div
              style={{
                padding: "26px 28px",
                color: "white",
                background: booking.theme_image
                  ? `linear-gradient(rgba(61, 0, 64, 0.72), rgba(123, 45, 94, 0.9)), url(${booking.theme_image}) center/cover`
                  : "linear-gradient(135deg, #7B2D5E, #C2185B)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.16)",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Exhibitor Booking Pass
              </div>
              <h3 style={{ margin: "18px 0 8px", fontSize: "30px" }}>{booking.stall_name}</h3>
              <p style={{ margin: 0, fontSize: "16px", opacity: 0.92 }}>{booking.expo_title}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(260px,0.95fr)", gap: "24px", padding: "28px" }}>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "18px" }}>
                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Theme</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{booking.expo_theme}</div>
                  </div>
                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Venue</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{booking.expo_venue}</div>
                    <div style={{ color: C.textMid, marginTop: "4px" }}>{booking.expo_city}</div>
                  </div>
                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Event Dates</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{formatDateRange(booking.expo_start_date, booking.expo_end_date)}</div>
                  </div>
                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Amount Paid</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>Rs. {booking.amount}</div>
                  </div>
                </div>

                <div style={{ marginTop: "22px" }}>
                  <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Stall Description</div>
                  <p style={{ color: C.textMid, margin: 0, lineHeight: "1.7" }}>{booking.stall_description}</p>
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <StatusBadge status={booking.status} />

                  <button
                    type="button"
                    onClick={() => printVendorPass(booking)}
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 18px",
                      background: C.gradientPrimary,
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Print Booking Pass
                  </button>
                </div>
              </div>

              <div style={{ borderLeft: `1px dashed ${C.border}`, paddingLeft: "24px" }}>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Payment Method</div>
                <div style={{ color: C.text, fontWeight: "700", marginBottom: "18px" }}>{booking.payment_method || "N/A"}</div>

                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Payment Reference</div>
                <div style={{ color: C.text, fontWeight: "700", wordBreak: "break-word", marginBottom: "18px" }}>{booking.payment_reference || "N/A"}</div>

                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Payment Status</div>
                <div style={{ color: C.text, fontWeight: "700", marginBottom: "18px" }}>{booking.payment_status || "N/A"}</div>

                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Payment Date</div>
                <div style={{ color: C.text, fontWeight: "700" }}>
                  {booking.payment_date ? new Date(booking.payment_date).toLocaleString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"

import api from "../../../api/axios"
import { C } from "../../../constants/colors"

function formatDateRange(start, end) {
  return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
}

function printTicket(ticket) {
  const ticketWindow = window.open("", "_blank", "width=900,height=700")
  if (!ticketWindow) return

  ticketWindow.document.write(`
    <html>
      <head>
        <title>${ticket.expo_title} Ticket</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #fff7fb;
            padding: 32px;
            color: #3D0040;
          }
          .ticket {
            max-width: 860px;
            margin: 0 auto;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid #f3d5e4;
            box-shadow: 0 18px 44px rgba(61, 0, 64, 0.12);
            background: #fff;
          }
          .hero {
            padding: 28px 32px;
            color: white;
            background: linear-gradient(135deg, #C2185B, #7B2D5E);
          }
          .body {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 24px;
            padding: 28px 32px 32px;
          }
          .label {
            font-size: 12px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #9B6B80;
            margin-bottom: 6px;
          }
          .value {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 18px;
          }
          .qr {
            text-align: center;
            border-left: 1px dashed #f1c2d6;
            padding-left: 24px;
          }
          .qr img {
            width: 220px;
            height: 220px;
            object-fit: contain;
            background: white;
            padding: 12px;
            border-radius: 18px;
            border: 1px solid #f3d5e4;
          }
          .status {
            display: inline-block;
            margin-top: 12px;
            padding: 8px 12px;
            border-radius: 999px;
            font-weight: 700;
            background: ${ticket.qr_verified ? "#FDECEC" : "#EEF8F0"};
            color: ${ticket.qr_verified ? "#B42318" : "#166534"};
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="hero">
            <div style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85;">ExpoSphere Entry Pass</div>
            <h1 style="margin: 12px 0 8px; font-size: 34px;">${ticket.expo_title}</h1>
            <div style="font-size: 16px; opacity: 0.92;">${ticket.expo_theme}</div>
          </div>
          <div class="body">
            <div>
              <div class="label">Venue</div>
              <div class="value">${ticket.expo_venue}, ${ticket.expo_city}</div>
              <div class="label">Ticket Type</div>
              <div class="value">${ticket.ticket_type_display}</div>
              <div class="label">Price Paid</div>
              <div class="value">Rs. ${ticket.price_paid}</div>
              <div class="label">Dates</div>
              <div class="value">${formatDateRange(ticket.expo_start_date, ticket.expo_end_date)}</div>
              <div class="label">Ticket Code</div>
              <div class="value">${ticket.ticket_code}</div>
              <div class="label">Booked On</div>
              <div class="value">${new Date(ticket.booking_date).toLocaleString()}</div>
            </div>
            <div class="qr">
              <img src="${ticket.qr_code_image}" alt="QR Code" />
              <div class="status">${ticket.qr_verified ? "Used for Entry" : "Valid for Entry"}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `)
  ticketWindow.document.close()
  ticketWindow.focus()
  ticketWindow.print()
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    api.get("expos/my-tickets/")
      .then(({ data }) => setTickets(data))
      .catch(() => setMessage("Unable to load your tickets"))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>My Tickets</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Your QR code still powers entry verification, but each booking is now displayed like a real event pass.
        </p>
      </div>

      {message && <p>{message}</p>}
      {tickets.length === 0 && <p>No tickets booked yet.</p>}

      <div style={{ display: "grid", gap: "22px" }}>
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
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
                position: "relative",
                padding: "26px 28px",
                color: "white",
                background: ticket.theme_image
                  ? `linear-gradient(rgba(61, 0, 64, 0.76), rgba(123, 45, 94, 0.9)), url(${ticket.theme_image}) center/cover`
                  : "linear-gradient(135deg, #C2185B, #7B2D5E)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.16)",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                ExpoSphere Entry Pass
              </div>

              <h3 style={{ margin: "18px 0 8px", fontSize: "30px" }}>{ticket.expo_title}</h3>
              <p style={{ margin: 0, fontSize: "16px", opacity: 0.92 }}>{ticket.expo_theme}</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.95fr)",
                gap: "24px",
                padding: "28px",
              }}
            >
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "18px" }}>
                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Venue</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{ticket.expo_venue}</div>
                    <div style={{ color: C.textMid, marginTop: "4px" }}>{ticket.expo_city}</div>
                  </div>

                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Event Dates</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{formatDateRange(ticket.expo_start_date, ticket.expo_end_date)}</div>
                  </div>

                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Ticket Type</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{ticket.ticket_type_display}</div>
                  </div>

                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Price Paid</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>Rs. {ticket.price_paid}</div>
                  </div>

                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Ticket Code</div>
                    <div style={{ color: C.text, fontWeight: "700", wordBreak: "break-word" }}>{ticket.ticket_code}</div>
                  </div>

                  <div>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Booked On</div>
                    <div style={{ color: C.text, fontWeight: "700" }}>{new Date(ticket.booking_date).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "999px",
                      fontWeight: "700",
                      background: ticket.qr_verified ? "#FDECEC" : "#EEF8F0",
                      color: ticket.qr_verified ? "#B42318" : "#166534",
                    }}
                  >
                    {ticket.qr_verified ? "Used for Entry" : "Valid for Entry"}
                  </span>

                  <button
                    type="button"
                    onClick={() => printTicket(ticket)}
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 18px",
                      background: "linear-gradient(135deg, #FF8FAB, #C084FC)",
                      color: "white",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Print Ticket
                  </button>
                </div>
              </div>

              <div
                style={{
                  borderLeft: `1px dashed ${C.border}`,
                  paddingLeft: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "220px",
                    height: "220px",
                    borderRadius: "22px",
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
                  }}
                >
                  {ticket.qr_code_image && (
                    <img
                      src={ticket.qr_code_image}
                      alt={`QR for ${ticket.expo_title}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </div>

                <p style={{ color: C.textMid, marginTop: "16px", lineHeight: "1.6", maxWidth: "250px" }}>
                  Present this QR at the venue entry desk. The QR still powers validation, but the full card is your digital event pass.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

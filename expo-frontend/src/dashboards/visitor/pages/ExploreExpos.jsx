import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import { C } from "../../../constants/colors"
import { completeRazorpayPayment } from "../../../utils/loadRazorpay"
import { getThemeImage } from "../../../utils/themeImage"

function getErrorMessage(errorData) {
  if (!errorData) {
    return "Unable to load live expos."
  }

  if (typeof errorData === "string") {
    return errorData
  }

  if (Array.isArray(errorData) && errorData[0]) {
    return String(errorData[0])
  }

  if (typeof errorData === "object") {
    if (typeof errorData.error === "string") {
      return errorData.error
    }

    const firstValue = Object.values(errorData)[0]
    if (typeof firstValue === "string") {
      return firstValue
    }
    if (Array.isArray(firstValue) && firstValue[0]) {
      return String(firstValue[0])
    }
  }

  return "Something went wrong."
}

function formatDateRange(start, end) {
  return `${new Date(start).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} - ${new Date(end).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: `1px solid ${C.border}`,
  background: "white",
  color: C.text,
  boxSizing: "border-box",
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.textLight }}>{label}</span>
      <strong style={{ color: C.text, textAlign: "right" }}>{value}</strong>
    </div>
  )
}

export default function ExploreExpos() {
  const [searchParams] = useSearchParams()
  const requestedExpoId = Number(searchParams.get("expo"))
  const [expos, setExpos] = useState([])
  const [selectedExpoId, setSelectedExpoId] = useState(null)
  const [agreementByExpo, setAgreementByExpo] = useState({})
  const [paymentMethodByExpo, setPaymentMethodByExpo] = useState({})
  const [ticketCountsByExpo, setTicketCountsByExpo] = useState({})
  const [loadingExpoId, setLoadingExpoId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    api.get("expos/list/")
      .then(({ data }) => {
        if (!cancelled) {
          setExpos(data)
          if (data[0]) {
            const requestedExpoExists = data.some((expo) => expo.id === requestedExpoId)
            setSelectedExpoId(requestedExpoExists ? requestedExpoId : data[0].id)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setMessage(getErrorMessage(err.response?.data))
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
  }, [requestedExpoId])

  const selectedExpo = useMemo(
    () => expos.find((expo) => expo.id === selectedExpoId) || null,
    [expos, selectedExpoId]
  )

  const updateTicketCounts = (expoId, field, value) => {
    const parsedValue = Math.max(0, Number(value) || 0)
    setTicketCountsByExpo((current) => ({
      ...current,
      [expoId]: {
        adult_count: 0,
        child_count: 0,
        ...current[expoId],
        [field]: parsedValue,
      },
    }))
  }

  const bookTicket = async (expoId) => {
    setMessage("")
    const counts = ticketCountsByExpo[expoId] || { adult_count: 0, child_count: 0 }
    const adultCount = Number(counts.adult_count || 0)
    const childCount = Number(counts.child_count || 0)

    if (adultCount + childCount <= 0) {
      const warning = "Please choose at least one adult or child ticket."
      setMessage(warning)
      toast.error(warning)
      return
    }

    if (!agreementByExpo[expoId]) {
      const warning = "Please confirm the visitor policy before booking your ticket."
      setMessage(warning)
      toast.error(warning)
      return
    }

    try {
      setLoadingExpoId(expoId)
      const { data: order } = await api.post("finance/razorpay/create-order/", {
        expo: expoId,
        transaction_type: "TICKET",
        payment_method: paymentMethodByExpo[expoId] || "CARD",
        adult_count: adultCount,
        child_count: childCount,
      })
      await completeRazorpayPayment(order)
      const success = "Tickets booked successfully. Your QR codes are now available in My Tickets."
      setMessage(success)
      setAgreementByExpo((current) => ({ ...current, [expoId]: false }))
      setPaymentMethodByExpo((current) => ({ ...current, [expoId]: "CARD" }))
      setTicketCountsByExpo((current) => ({
        ...current,
        [expoId]: { adult_count: 0, child_count: 0 },
      }))
      toast.success("Tickets booked successfully.")
    } catch (err) {
      const errorMessage = err.response ? getErrorMessage(err.response.data) : err.message
      setMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingExpoId(null)
    }
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 22px", color: C.text, fontSize: "32px" }}>Live Expos</h2>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: message.toLowerCase().includes("success") ? "#ECFDF3" : "#FFF4F4",
            border: message.toLowerCase().includes("success") ? "1px solid #ABEFC6" : "1px solid #F5C2C7",
            color: message.toLowerCase().includes("success") ? "#166534" : "#B42318",
          }}
        >
          {message}
        </div>
      )}

      {loading && <p style={{ color: C.textMid }}>Loading live expos...</p>}

      {!loading && expos.length === 0 && (
        <div
          style={{
            padding: "22px",
            borderRadius: "22px",
            background: "white",
            border: `1px solid ${C.border}`,
            boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
            color: C.textMid,
          }}
        >
          No live expos are available for ticket booking right now.
        </div>
      )}

      {!loading && expos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 0.95fr) minmax(0, 1.3fr)", gap: "22px", alignItems: "start" }}>
          <div
            style={{
              background: "white",
              border: `1px solid ${C.border}`,
              borderRadius: "26px",
              padding: "18px",
              boxShadow: "0 18px 42px rgba(61,0,64,0.05)",
              display: "grid",
              gap: "16px",
            }}
          >
            {expos.map((expo) => {
              const isSelected = expo.id === selectedExpoId
              const imageSrc = getThemeImage(expo.theme, expo.theme_image)

              return (
                <button
                  key={expo.id}
                  type="button"
                  onClick={() => setSelectedExpoId(expo.id)}
                  style={{
                    textAlign: "left",
                    border: isSelected ? "2px solid #C2185B" : `1px solid ${C.border}`,
                    borderRadius: "22px",
                    padding: "0",
                    background: isSelected ? "#FFF7FB" : "white",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 14px 30px rgba(194,24,91,0.10)" : "none",
                  }}
                >
                  <div style={{ height: "168px", overflow: "hidden", background: "#FFF0F5" }}>
                    <img
                      src={imageSrc}
                      alt={expo.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                      {expo.theme}
                    </div>
                    <div style={{ color: C.text, fontWeight: "800", fontSize: "21px", marginBottom: "8px" }}>{expo.title}</div>
                    <div style={{ color: C.textMid, marginBottom: "6px" }}>{expo.city}</div>
                    <div style={{ color: C.textLight, marginBottom: "14px" }}>{formatDateRange(expo.start_date, expo.end_date)}</div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "9px 14px",
                        borderRadius: "999px",
                        background: isSelected ? "#3D0040" : "linear-gradient(135deg, #FF8FAB, #C084FC)",
                        color: "white",
                        fontWeight: "700",
                      }}
                    >
                      {isSelected ? "Viewing Details" : "View Details"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedExpo && (
            <div
              style={{
                background: "white",
                border: `1px solid ${C.border}`,
                borderRadius: "30px",
                overflow: "hidden",
                boxShadow: "0 20px 48px rgba(61,0,64,0.08)",
              }}
            >
              <div
                style={{
                  minHeight: "260px",
                  padding: "30px",
                  color: "white",
                  background: selectedExpo.theme_image
                    ? `linear-gradient(rgba(61,0,64,0.58), rgba(123,45,94,0.88)), url(${selectedExpo.theme_image}) center/cover`
                    : "linear-gradient(135deg, #7B2D5E, #C2185B)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.88, marginBottom: "10px" }}>
                  Exhibition Details
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: "36px", lineHeight: "1.15" }}>{selectedExpo.title}</h3>
                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", opacity: 0.94 }}>
                  <span>{selectedExpo.theme}</span>
                  <span>{selectedExpo.city}</span>
                  <span>{selectedExpo.venue}</span>
                  <span>{formatDateRange(selectedExpo.start_date, selectedExpo.end_date)}</span>
                </div>
              </div>

              <div style={{ padding: "28px 30px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,0.95fr)", gap: "26px" }}>
                <div>
                  <div style={{ color: C.text, fontWeight: "800", marginBottom: "10px", fontSize: "22px" }}>About This Expo</div>
                  <p style={{ margin: 0, color: C.textMid, lineHeight: "1.85" }}>
                    {selectedExpo.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FFF6FA, #FFFFFF)",
                      border: `1px solid ${C.border}`,
                      borderRadius: "24px",
                      padding: "20px",
                      marginBottom: "18px",
                    }}
                  >
                    <div style={{ color: C.text, fontWeight: "800", marginBottom: "12px" }}>Expo Details</div>
                    <DetailRow label="Theme" value={selectedExpo.theme} />
                    <DetailRow label="City" value={selectedExpo.city} />
                    <DetailRow label="Venue" value={selectedExpo.venue} />
                    <DetailRow label="Dates" value={formatDateRange(selectedExpo.start_date, selectedExpo.end_date)} />
                    <DetailRow label="Adult Ticket" value={`Rs. ${selectedExpo.ticket_price}`} />
                    <DetailRow label="Child Ticket" value={`Rs. ${selectedExpo.child_ticket_price}`} />
                  </div>

                  <div
                    style={{
                      background: "white",
                      border: `1px solid ${C.border}`,
                      borderRadius: "24px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ color: C.text, fontWeight: "800", marginBottom: "16px", fontSize: "20px" }}>Book Ticket</div>

                    <div style={{ display: "grid", gap: "14px" }}>
                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: "16px",
                          background: "#FFF8FC",
                          border: `1px solid ${C.border}`,
                          color: C.textMid,
                          lineHeight: "1.7",
                        }}
                      >
                        Adult tickets use the full price. Child tickets are available at a lower price for easier family bookings.
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "12px" }}>
                        <label style={{ display: "grid", gap: "8px" }}>
                          <span style={{ color: C.text, fontWeight: "700" }}>Adult Tickets</span>
                          <input
                            type="number"
                            min="0"
                            value={ticketCountsByExpo[selectedExpo.id]?.adult_count ?? 0}
                            onChange={(e) => updateTicketCounts(selectedExpo.id, "adult_count", e.target.value)}
                            style={inputStyle}
                          />
                        </label>

                        <label style={{ display: "grid", gap: "8px" }}>
                          <span style={{ color: C.text, fontWeight: "700" }}>Child Tickets</span>
                          <input
                            type="number"
                            min="0"
                            value={ticketCountsByExpo[selectedExpo.id]?.child_count ?? 0}
                            onChange={(e) => updateTicketCounts(selectedExpo.id, "child_count", e.target.value)}
                            style={inputStyle}
                          />
                        </label>
                      </div>

                      <div
                        style={{
                          padding: "14px 16px",
                          borderRadius: "16px",
                          background: "linear-gradient(135deg, #FFF6FA, #FFFFFF)",
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ color: C.text, fontWeight: "800", marginBottom: "8px" }}>Booking Summary</div>
                        <div style={{ color: C.textMid, lineHeight: "1.7" }}>
                          Adult: {ticketCountsByExpo[selectedExpo.id]?.adult_count ?? 0} x Rs. {selectedExpo.ticket_price}
                        </div>
                        <div style={{ color: C.textMid, lineHeight: "1.7" }}>
                          Child: {ticketCountsByExpo[selectedExpo.id]?.child_count ?? 0} x Rs. {selectedExpo.child_ticket_price}
                        </div>
                        <div style={{ color: C.text, fontWeight: "800", marginTop: "10px" }}>
                          Total: Rs. {(
                            (Number(ticketCountsByExpo[selectedExpo.id]?.adult_count ?? 0) * Number(selectedExpo.ticket_price || 0)) +
                            (Number(ticketCountsByExpo[selectedExpo.id]?.child_count ?? 0) * Number(selectedExpo.child_ticket_price || 0))
                          ).toFixed(2)}
                        </div>
                      </div>

                      <label style={{ display: "grid", gap: "8px" }}>
                        <span style={{ color: C.text, fontWeight: "700" }}>Payment Method</span>
                        <select
                          value={paymentMethodByExpo[selectedExpo.id] || "CARD"}
                          onChange={(e) => setPaymentMethodByExpo((current) => ({ ...current, [selectedExpo.id]: e.target.value }))}
                          style={inputStyle}
                        >
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="NETBANKING">Net Banking</option>
                          <option value="WALLET">Wallet</option>
                        </select>
                      </label>

                      <div style={{ color: C.textLight, fontSize: "13px", lineHeight: "1.5" }}>
                        Test mode: use Razorpay test credentials only. No real money will be charged.
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          color: C.textMid,
                          lineHeight: "1.6",
                          padding: "12px 14px",
                          borderRadius: "14px",
                          background: "#FFF9FC",
                          border: `1px solid ${C.border}`,
                        }}
                        >
                          <input
                            type="checkbox"
                          checked={Boolean(agreementByExpo[selectedExpo.id])}
                          onChange={(e) => setAgreementByExpo((current) => ({ ...current, [selectedExpo.id]: e.target.checked }))}
                          style={{ marginTop: "4px" }}
                        />
                        <span>I understand these tickets are for expo entry and I will carry the QR codes at the venue.</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => bookTicket(selectedExpo.id)}
                        disabled={loadingExpoId === selectedExpo.id}
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          padding: "13px 20px",
                          background: loadingExpoId === selectedExpo.id ? "#D0B6C3" : "linear-gradient(135deg, #FF8FAB, #C084FC)",
                          color: "white",
                          fontWeight: "800",
                          cursor: loadingExpoId === selectedExpo.id ? "not-allowed" : "pointer",
                        }}
                      >
                        {loadingExpoId === selectedExpo.id ? "Opening checkout..." : "Pay with Razorpay (Test)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

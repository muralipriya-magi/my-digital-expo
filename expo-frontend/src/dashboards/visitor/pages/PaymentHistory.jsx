import { useEffect, useState } from "react"

import api from "../../../api/axios"
import { C } from "../../../constants/colors"

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("finance/my-transactions/")
      .then(({ data }) => setTransactions(data.filter((item) => item.transaction_type === "TICKET")))
      .catch(() => setError("Unable to load ticket payment history"))
  }, [])

  if (error) return <p>{error}</p>

  const totalSpend = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
  const successfulPayments = transactions.filter((transaction) => transaction.status === "SUCCESS").length

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Payment History</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Track every ticket payment, method, reference, and booking timestamp in one place.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "18px", padding: "18px" }}>
          <div style={{ fontSize: "13px", color: C.textLight, marginBottom: "6px" }}>Total Ticket Spend</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: C.text }}>Rs. {totalSpend.toFixed(2)}</div>
        </div>
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "18px", padding: "18px" }}>
          <div style={{ fontSize: "13px", color: C.textLight, marginBottom: "6px" }}>Successful Payments</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: C.text }}>{successfulPayments}</div>
        </div>
      </div>

      {transactions.length === 0 && (
        <div style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: "18px", padding: "20px" }}>
          No ticket payments yet.
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            style={{
              background: "white",
              border: `1px solid ${C.border}`,
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0 14px 34px rgba(61,0,64,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", color: C.text }}>{transaction.expo_title}</h3>
                <div style={{ color: C.textMid }}>Ticket Payment</div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  background: transaction.status === "SUCCESS" ? "#EEF8F0" : "#FFF3E6",
                  color: transaction.status === "SUCCESS" ? "#166534" : "#9A3412",
                }}
              >
                {transaction.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: "14px",
              }}
            >
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Amount</div>
                <div style={{ color: C.text, fontWeight: "700" }}>Rs. {transaction.amount}</div>
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Method</div>
                <div style={{ color: C.text, fontWeight: "700" }}>{transaction.payment_method}</div>
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Reference</div>
                <div style={{ color: C.text, fontWeight: "700", wordBreak: "break-word" }}>{transaction.payment_reference}</div>
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Paid On</div>
                <div style={{ color: C.text, fontWeight: "700" }}>{new Date(transaction.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

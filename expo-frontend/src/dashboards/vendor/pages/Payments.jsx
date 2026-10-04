import { useEffect, useState } from "react"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"

function printReceipt(transaction) {
  const receiptWindow = window.open("", "_blank", "width=850,height=700")
  if (!receiptWindow) return

  receiptWindow.document.write(`
    <html>
      <head>
        <title>${transaction.expo_title} Receipt</title>
        <style>
          body { margin: 0; padding: 32px; background: #fff7fb; font-family: Arial, sans-serif; color: #3D0040; }
          .receipt { max-width: 760px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #f3d5e4; box-shadow: 0 18px 44px rgba(61,0,64,0.12); overflow: hidden; }
          .header { padding: 28px 32px; color: white; background: linear-gradient(135deg, #7B2D5E, #C2185B); }
          .body { padding: 28px 32px; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 16px; }
          .label { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #9B6B80; margin-bottom: 6px; }
          .value { font-size: 16px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div style="font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .85;">ExpoSphere Payment Receipt</div>
            <h1 style="margin: 12px 0 8px; font-size: 32px;">${transaction.expo_title}</h1>
            <div style="font-size: 16px; opacity: .92;">Stall Booking Payment</div>
          </div>
          <div class="body">
            <div class="row">
              <div><div class="label">Amount</div><div class="value">Rs. ${transaction.amount}</div></div>
              <div><div class="label">Status</div><div class="value">${transaction.status}</div></div>
            </div>
            <div class="row">
              <div><div class="label">Payment Method</div><div class="value">${transaction.payment_method}</div></div>
              <div><div class="label">Reference</div><div class="value">${transaction.payment_reference}</div></div>
            </div>
            <div class="row">
              <div><div class="label">Platform Commission</div><div class="value">Rs. ${transaction.commission_amount}</div></div>
              <div><div class="label">Organizer Share</div><div class="value">Rs. ${transaction.organizer_amount}</div></div>
            </div>
            <div><div class="label">Date</div><div class="value">${new Date(transaction.created_at).toLocaleString()}</div></div>
          </div>
        </div>
      </body>
    </html>
  `)
  receiptWindow.document.close()
  receiptWindow.focus()
  receiptWindow.print()
}

export default function Payments() {
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("finance/my-transactions/")
      .then(({ data }) => setTransactions(data.filter((item) => item.transaction_type === "STALL")))
      .catch(() => setError("Unable to load payment summary"))
  }, [])

  if (error) return <p>{error}</p>

  const total = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
  const successful = transactions.filter((item) => item.status === "SUCCESS").length

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Payments</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Track your stall payments, receipt references, commission split, and print-ready confirmations.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Total Stall Spend" value={`Rs. ${total.toFixed(2)}`} hint="Combined amount paid for your stall requests." tone="pink" />
        <StatCard label="Successful Payments" value={successful} hint="Stall payments marked successful in the system." tone="violet" />
      </div>

      {transactions.length === 0 && <p>No stall payments yet.</p>}

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
                <div style={{ color: C.textMid }}>Stall Booking Receipt</div>
              </div>
              <button
                type="button"
                onClick={() => printReceipt(transaction)}
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
                Print Receipt
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px" }}>
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
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Status</div>
                <StatusBadge status={transaction.status} />
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Commission</div>
                <div style={{ color: C.text, fontWeight: "700" }}>Rs. {transaction.commission_amount}</div>
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Organizer Share</div>
                <div style={{ color: C.text, fontWeight: "700" }}>Rs. {transaction.organizer_amount}</div>
              </div>
              <div>
                <div style={{ color: C.textLight, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Date</div>
                <div style={{ color: C.text, fontWeight: "700" }}>{new Date(transaction.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

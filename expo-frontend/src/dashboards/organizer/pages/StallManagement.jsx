import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"

export default function StallManagement() {
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [loadingId, setLoadingId] = useState(null)

  const loadRequests = () => {
    api.get("expos/stall-requests/")
      .then(({ data }) => setRequests(data))
      .catch(() => toast.error("Unable to load stall requests"))
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const updateStatus = async (requestId, status) => {
    try {
      setLoadingId(requestId)
      await api.patch(`expos/stall-approve/${requestId}/`, { status })
      toast.success(`Request ${status.toLowerCase()} successfully.`)
      loadRequests()
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to update request")
    } finally {
      setLoadingId(null)
    }
  }

  const filteredRequests = requests.filter((request) => request.status === statusFilter)

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Vendor Stall Requests</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Review incoming vendor requests, filter by decision stage, and keep exhibitor approvals moving quickly.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Pending Requests" value={requests.filter((item) => item.status === "PENDING").length} hint="Requests waiting for your decision." tone="amber" />
        <StatCard label="Approved Requests" value={requests.filter((item) => item.status === "APPROVED").length} hint="Vendor stalls you have approved." tone="cyan" />
        <StatCard label="Rejected Requests" value={requests.filter((item) => item.status === "REJECTED").length} hint="Requests you have declined." tone="pink" />
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            style={{
              border: statusFilter === status ? "none" : `1px solid ${C.border}`,
              borderRadius: "999px",
              padding: "10px 16px",
              background: statusFilter === status ? C.gradientPrimary : C.pinkPale,
              color: statusFilter === status ? "white" : C.text,
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 && <p>No stall requests under this status yet.</p>}

      <div style={{ display: "grid", gap: "16px" }}>
        {filteredRequests.map((request) => (
          <div
            key={request.id}
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
                <h3 style={{ margin: "0 0 6px", color: C.text }}>{request.stall_name}</h3>
                <div style={{ color: C.textMid }}>Expo: {request.expo_title}</div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginBottom: "14px" }}>
              <div style={{ color: C.textMid }}>Vendor: <strong>{request.vendor_name}</strong></div>
              <div style={{ color: C.textMid }}>Email: <strong>{request.vendor_email}</strong></div>
            </div>

            <p style={{ color: C.textMid, lineHeight: "1.7", marginTop: 0 }}>{request.stall_description}</p>

            {request.status === "PENDING" && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => updateStatus(request.id, "APPROVED")}
                  disabled={loadingId === request.id}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    background: C.success,
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {loadingId === request.id ? "Updating..." : "Approve Stall"}
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(request.id, "REJECTED")}
                  disabled={loadingId === request.id}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    background: C.danger,
                    color: "white",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {loadingId === request.id ? "Updating..." : "Reject Stall"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

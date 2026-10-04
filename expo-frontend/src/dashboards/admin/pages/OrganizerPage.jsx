import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import StatCard from "../../../components/dashboard/StatCard"
import StatusBadge from "../../../components/dashboard/StatusBadge"
import { C } from "../../../constants/colors"

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState([])
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    api.get(`users/organizers/?status=${statusFilter}`)
      .then(({ data }) => setOrganizers(data))
      .catch(() => toast.error("Unable to load organizer approvals"))
  }, [statusFilter])

  const updateOrganizer = async (organizerId, status) => {
    try {
      setLoadingId(organizerId)
      await api.patch(`users/organizer-approve/${organizerId}/`, { status })
      toast.success(`Organizer ${status.toLowerCase()} successfully.`)
      const { data } = await api.get(`users/organizers/?status=${statusFilter}`)
      setOrganizers(data)
    } catch {
      toast.error("Unable to update organizer status")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Organizer Approvals</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Review organizer onboarding requests and move applicants cleanly through approval or rejection.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard label="Visible Requests" value={organizers.length} hint="Organizer records shown under the current filter." tone="pink" />
        <StatCard label="Current Filter" value={statusFilter} hint="Switch between pending, approved, and rejected organizer states." tone="violet" />
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

      {organizers.length === 0 && <p>No organizer records match this filter.</p>}

      <div style={{ display: "grid", gap: "16px" }}>
        {organizers.map((organizer) => (
          <div
            key={organizer.id}
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
                <h3 style={{ margin: "0 0 6px", color: C.text }}>{organizer.username}</h3>
                <div style={{ color: C.textMid }}>{organizer.email}</div>
              </div>
              <StatusBadge status={organizer.status} />
            </div>

            {organizer.status === "PENDING" && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => updateOrganizer(organizer.id, "APPROVED")}
                  disabled={loadingId === organizer.id}
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
                  {loadingId === organizer.id ? "Updating..." : "Approve Organizer"}
                </button>
                <button
                  type="button"
                  onClick={() => updateOrganizer(organizer.id, "REJECTED")}
                  disabled={loadingId === organizer.id}
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
                  {loadingId === organizer.id ? "Updating..." : "Reject Organizer"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

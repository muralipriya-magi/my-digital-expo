import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import api from "../../../api/axios"
import { C } from "../../../constants/colors"

const initialForm = {
  title: "",
  description: "",
  theme: "",
  city: "",
  venue: "",
  start_date: "",
  end_date: "",
  max_stalls: "",
  max_visitors: "",
  stall_price: "",
  ticket_price: "",
}

function getErrorMessage(errorData) {
  if (!errorData) {
    return "Unable to create expo."
  }

  if (typeof errorData === "string") {
    return errorData
  }

  if (Array.isArray(errorData) && errorData[0]) {
    return String(errorData[0])
  }

  if (typeof errorData === "object") {
    const firstValue = Object.values(errorData)[0]
    if (typeof firstValue === "string") {
      return firstValue
    }
    if (Array.isArray(firstValue) && firstValue[0]) {
      return String(firstValue[0])
    }
  }

  return "Unable to create expo."
}

function FieldShell({ label, hint, children }) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ color: C.text, fontWeight: "700" }}>{label}</span>
      {children}
      {hint && <span style={{ color: C.textLight, fontSize: "13px" }}>{hint}</span>}
    </label>
  )
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "14px",
  border: `1px solid ${C.border}`,
  background: "white",
  color: C.text,
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
}

export default function CreateExpoPage() {
  const [form, setForm] = useState(initialForm)
  const [confirmPolicy, setConfirmPolicy] = useState(false)
  const [meta, setMeta] = useState({ themes: [], cities: [], venues: [] })
  const [loading, setLoading] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false

    api.get("expos/metadata/")
      .then(({ data }) => {
        if (!cancelled) {
          setMeta(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const errorMessage = getErrorMessage(err.response?.data) || "Unable to load expo form options."
          setMessage(errorMessage)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMeta(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredVenues = useMemo(() => {
    if (!form.city) {
      return []
    }
    return meta.venues.filter((venue) => String(venue.city_id) === String(form.city))
  }, [form.city, meta.venues])

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "city" ? { venue: "" } : {}),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!confirmPolicy) {
      const warning = "Please confirm the expo details before submitting."
      setMessage(warning)
      toast.error(warning)
      return
    }

    if (!form.venue) {
      const warning = "Please select a venue for the chosen city."
      setMessage(warning)
      toast.error(warning)
      return
    }

    setLoading(true)
    setMessage("")

    try {
      await api.post("expos/create/", {
        ...form,
        theme: Number(form.theme),
        city: Number(form.city),
        venue: Number(form.venue),
        max_stalls: Number(form.max_stalls),
        max_visitors: Number(form.max_visitors),
        stall_price: Number(form.stall_price),
        ticket_price: Number(form.ticket_price),
      })

      setForm(initialForm)
      setConfirmPolicy(false)
      setMessage("Expo created successfully and sent for admin approval.")
      toast.success("Expo created and sent for approval.")
    } catch (err) {
      const errorMessage = getErrorMessage(err.response?.data)
      setMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px", color: C.text }}>Create Expo</h2>
        <p style={{ color: C.textMid, margin: 0 }}>
          Set up a new expo submission with clear scheduling, pricing, and venue details for admin review.
        </p>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #FFF5F8, #FFFFFF)",
          border: `1px solid ${C.border}`,
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 18px 42px rgba(61,0,64,0.05)",
        }}
      >
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

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "18px" }}>
            <FieldShell label="Expo Title" hint="Use a short, clear public-facing event name.">
              <input
                required
                placeholder="Example: South India Startup Fair 2026"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>

            <FieldShell label="Theme" hint="Choose the expo category that best matches your event.">
              <select
                required
                value={form.theme}
                onChange={(e) => updateField("theme", e.target.value)}
                disabled={loadingMeta}
                style={inputStyle}
              >
                <option value="">{loadingMeta ? "Loading themes..." : "Select theme"}</option>
                {meta.themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>{theme.name}</option>
                ))}
              </select>
            </FieldShell>
          </div>

          <FieldShell label="Description" hint="Explain the focus of the expo, target audience, and what vendors or visitors can expect.">
            <textarea
              required
              rows={5}
              placeholder="Describe the expo experience, featured categories, and why attendees should care."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical", minHeight: "140px" }}
            />
          </FieldShell>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px" }}>
            <FieldShell label="City">
              <select
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                disabled={loadingMeta}
                style={inputStyle}
              >
                <option value="">{loadingMeta ? "Loading cities..." : "Select city"}</option>
                {meta.cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </FieldShell>

            <FieldShell
              label="Venue"
              hint={!form.city ? "Choose a city first." : filteredVenues.length === 0 ? "No venue is available for this city yet." : ""}
            >
              <select
                required
                value={form.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                disabled={!form.city || filteredVenues.length === 0}
                style={{
                  ...inputStyle,
                  background: !form.city || filteredVenues.length === 0 ? "#F8F1F5" : "white",
                  color: !form.city || filteredVenues.length === 0 ? C.textLight : C.text,
                }}
              >
                <option value="">
                  {!form.city ? "Select city first" : filteredVenues.length === 0 ? "No venues available" : "Select venue"}
                </option>
                {filteredVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </FieldShell>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px" }}>
            <FieldShell label="Start Date">
              <input
                required
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>

            <FieldShell label="End Date">
              <input
                required
                type="date"
                value={form.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "18px" }}>
            <FieldShell label="Max Stalls">
              <input
                required
                min="1"
                type="number"
                placeholder="40"
                value={form.max_stalls}
                onChange={(e) => updateField("max_stalls", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>

            <FieldShell label="Max Visitors">
              <input
                required
                min="1"
                type="number"
                placeholder="1000"
                value={form.max_visitors}
                onChange={(e) => updateField("max_visitors", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>

            <FieldShell label="Stall Price">
              <input
                required
                min="0"
                type="number"
                placeholder="5000"
                value={form.stall_price}
                onChange={(e) => updateField("stall_price", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>

            <FieldShell label="Ticket Price">
              <input
                required
                min="0"
                type="number"
                placeholder="250"
                value={form.ticket_price}
                onChange={(e) => updateField("ticket_price", e.target.value)}
                style={inputStyle}
              />
            </FieldShell>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "#FFF8FC",
              border: `1px solid ${C.border}`,
              lineHeight: "1.6",
              color: C.textMid,
            }}
          >
            <input
              type="checkbox"
              checked={confirmPolicy}
              onChange={(e) => setConfirmPolicy(e.target.checked)}
              style={{ marginTop: "4px" }}
            />
            <span>
              I confirm the expo details are correct and understand that this submission will remain pending until reviewed by the admin team.
            </span>
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ color: C.textLight, fontSize: "14px" }}>
              New expos appear in <strong style={{ color: C.text }}>My Expos</strong> after submission so you can track their approval status.
            </div>
            <button
              type="submit"
              disabled={loading || loadingMeta}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "13px 22px",
                background: loading || loadingMeta ? "#D0B6C3" : "linear-gradient(135deg, #FF8FAB, #C084FC)",
                color: "white",
                fontWeight: "800",
                cursor: loading || loadingMeta ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating..." : "Create Expo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { Link } from "react-router-dom"
import { CalendarRange, MapPin, Tag } from "lucide-react"

import { getThemeImage } from "../../utils/themeImage"

export default function ThemeExpoCard({ expo, children, subtitle }) {
  const imageSrc = getThemeImage(expo.theme, expo.theme_image)

  return (
    <div
      style={{
        border: "1px solid #eee",
        marginBottom: "16px",
        borderRadius: "18px",
        background: "white",
        overflow: "hidden",
        boxShadow: "0 14px 34px rgba(61,0,64,0.05)",
      }}
    >
      <div style={{ height: "190px", overflow: "hidden", background: "#fff4f8" }}>
        <img
          src={imageSrc}
          alt={`${expo.theme} theme`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ padding: "18px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: "#FFF0F5", color: "#7B2D5E", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>
          <Tag size={14} /> {expo.theme}
        </div>

        <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#3D0040" }}>{expo.title}</h3>

        {subtitle && <p style={{ marginTop: 0, color: "#7B2D5E" }}>{subtitle}</p>}

        <p style={{ color: "#9B6B80", lineHeight: "1.6" }}>{expo.description}</p>

        <p style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7B2D5E", marginBottom: "8px" }}>
          <MapPin size={16} /> {expo.city} - {expo.venue}
        </p>

        <p style={{ display: "flex", alignItems: "center", gap: "8px", color: "#7B2D5E", marginBottom: "12px" }}>
          <CalendarRange size={16} /> {expo.start_date} to {expo.end_date}
        </p>

        <Link
          to={`/expos/${expo.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 16px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #FF8FAB, #C084FC)",
            color: "white",
            textDecoration: "none",
            fontWeight: "700",
            marginBottom: children ? "14px" : 0,
          }}
        >
          View Details
        </Link>

        {children}
      </div>
    </div>
  )
}

import { C } from "../../constants/colors"

export default function StatCard({ label, value, hint, tone = "pink" }) {
  const tones = {
    pink: {
      bg: "linear-gradient(135deg, #FFF2F7, #FFFFFF)",
      accent: C.danger,
    },
    violet: {
      bg: "linear-gradient(135deg, #F7F0FF, #FFFFFF)",
      accent: C.violet,
    },
    cyan: {
      bg: "linear-gradient(135deg, #ECFEFF, #FFFFFF)",
      accent: C.info,
    },
    amber: {
      bg: "linear-gradient(135deg, #FFF7ED, #FFFFFF)",
      accent: C.warning,
    },
  }

  const palette = tones[tone] || tones.pink

  return (
    <div
      style={{
        borderRadius: "22px",
        padding: "20px",
        background: palette.bg,
        border: `1px solid ${C.border}`,
        boxShadow: "0 16px 36px rgba(61,0,64,0.05)",
      }}
    >
      <div style={{ color: C.textLight, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ color: palette.accent, fontSize: "32px", fontWeight: "800", marginBottom: hint ? "8px" : 0 }}>
        {value}
      </div>
      {hint && <div style={{ color: C.textMid, lineHeight: "1.5" }}>{hint}</div>}
    </div>
  )
}

import { C } from "../../constants/colors"

export default function StatusBadge({ status }) {
  const palette = {
    APPROVED: { background: C.successBg, color: C.success, border: C.successBorder },
    ACTIVE: { background: C.infoBg, color: C.info, border: C.infoBorder },
    PENDING: { background: C.warningBg, color: C.warning, border: C.warningBorder },
    REJECTED: { background: C.dangerBg, color: C.danger, border: C.dangerBorder },
    SUCCESS: { background: C.successBg, color: C.success, border: C.successBorder },
    FAILED: { background: C.dangerBg, color: C.danger, border: C.dangerBorder },
  }

  const tone = palette[status] || { background: C.pinkPale, color: C.textMid, border: C.border }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        fontWeight: "700",
        fontSize: "13px",
        background: tone.background,
        color: tone.color,
        border: `1px solid ${tone.border}`,
      }}
    >
      {status}
    </span>
  )
}

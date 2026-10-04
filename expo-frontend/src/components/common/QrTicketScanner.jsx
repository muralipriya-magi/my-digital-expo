import { useEffect, useRef, useState } from "react"

export default function QrTicketScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let stream
    let isActive = true
    let timer

    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not available in this browser.")
        return
      }
      if (!("BarcodeDetector" in window)) {
        setError("QR camera scanning is not supported by this browser. Paste the ticket code instead.")
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        if (!isActive || !videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] })

        const scanFrame = async () => {
          if (!isActive || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes[0]?.rawValue) {
              onDetected(codes[0].rawValue)
              return
            }
          } catch {
            // A frame may be unavailable while the camera initializes; try again.
          }
          timer = window.setTimeout(scanFrame, 250)
        }
        scanFrame()
      } catch {
        setError("Camera permission was denied or the camera is unavailable.")
      }
    }

    startScanner()
    return () => {
      isActive = false
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onDetected])

  return (
    <div style={{ marginBottom: "16px", padding: "14px", borderRadius: "12px", border: "1px solid #F1D8B4", background: "#FFF6EA" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <strong>Scan ticket QR code</strong>
        <button type="button" onClick={onClose} style={{ border: 0, background: "transparent", color: "#7B2D5E", fontWeight: 700, cursor: "pointer" }}>Close camera</button>
      </div>
      {error ? <p style={{ margin: 0, color: "#B42318", lineHeight: 1.5 }}>{error}</p> : <video ref={videoRef} muted playsInline style={{ display: "block", width: "100%", borderRadius: "10px", background: "#1F1720", maxHeight: "310px", objectFit: "cover" }} />}
    </div>
  )
}

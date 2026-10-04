import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../api/axios";
import QrTicketScanner from "../../../components/common/QrTicketScanner";

export default function TicketSales() {
  const [expos, setExpos] = useState([]);
  const [selectedExpo, setSelectedExpo] = useState("");
  const [stats, setStats] = useState(null);
  const [entryCount, setEntryCount] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [ticketCode, setTicketCode] = useState("");
  const [gateName, setGateName] = useState("Main Gate");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    api.get("expos/organizer-expos/")
      .then(({ data }) => {
        setExpos(data);
        if (data[0]) {
          setSelectedExpo(String(data[0].id));
        }
      })
      .catch(() => {
        setError("Unable to load expos");
        toast.error("Unable to load expos");
      });
  }, []);

  const loadExpoData = (expoId) => {
    if (!expoId) return;

    Promise.all([
      api.get(`expos/expo-stats/${expoId}/`),
      api.get(`expos/entry-counter/${expoId}/`),
      api.get(`expos/scan-history/${expoId}/`),
    ])
      .then(([statsRes, countRes, historyRes]) => {
        setStats(statsRes.data);
        setEntryCount(countRes.data);
        setScanHistory(historyRes.data);
      })
      .catch(() => {
        setError("Unable to load ticket verification data");
        toast.error("Unable to load ticket verification data");
      });
  };

  useEffect(() => {
    setError("");
    if (selectedExpo) {
      loadExpoData(selectedExpo);
    }
  }, [selectedExpo]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setMessage("");
    setResult(null);
    setError("");

    try {
      const { data } = await api.post("expos/verify-ticket/", {
        ticket_code: ticketCode,
        gate_name: gateName,
      });

      setResult(data);
      setMessage(data.message || "Ticket verified.");
      toast.success(data.message || "Ticket verified.");
      setTicketCode("");
      if (selectedExpo) {
        loadExpoData(selectedExpo);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Unable to verify ticket";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleQrDetected = (code) => {
    setTicketCode(code);
    setScanning(false);
    setMessage("QR code captured. Review it and select Verify Entry.");
    toast.success("QR code captured.");
  };

  if (error && expos.length === 0) return <p>{error}</p>;

  return (
    <div>
      <h2>Ticket Verification</h2>
      <p>Verify visitor entry codes and monitor real-time scan activity for your expos.</p>

      {expos.length === 0 && <p>Create an expo first to verify tickets.</p>}

      {expos.length > 0 && (
        <>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Select Expo</label>
            <select
              value={selectedExpo}
              onChange={(e) => setSelectedExpo(e.target.value)}
              style={{ minWidth: "260px", padding: "10px", borderRadius: "10px" }}
            >
              {expos.map((expo) => (
                <option key={expo.id} value={expo.id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            {[
              { label: "Tickets Booked", value: stats?.tickets_booked ?? "-" },
              { label: "Tickets Verified", value: stats?.tickets_verified ?? "-" },
              { label: "Tickets Remaining", value: stats?.tickets_remaining ?? "-" },
              { label: "Entered Visitors", value: entryCount?.entered_visitors ?? "-" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  padding: "18px",
                  borderRadius: "16px",
                  background: "white",
                  border: "1px solid #eee",
                }}
              >
                <div style={{ fontSize: "13px", color: "#7B2D5E", marginBottom: "6px" }}>{card.label}</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#3D0040" }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: "18px",
              alignItems: "start",
            }}
          >
            <form
              onSubmit={handleVerify}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Verify Ticket</h3>

              {scanning && <QrTicketScanner onDetected={handleQrDetected} onClose={() => setScanning(false)} />}

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Ticket Code</label>
                <input
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Paste or type UUID ticket code"
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Gate Name</label>
                <input
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  placeholder="Main Gate"
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #FF8FAB, #C084FC)",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {verifying ? "Verifying..." : "Verify Entry"}
              </button>
              <button
                type="button"
                onClick={() => setScanning((current) => !current)}
                style={{ marginLeft: "10px", padding: "12px 16px", borderRadius: "10px", border: "1px solid #C084FC", background: "white", color: "#7B2D5E", fontWeight: "700", cursor: "pointer" }}
              >
                {scanning ? "Close Scanner" : "Scan QR"}
              </button>

              {message && <p style={{ marginTop: "12px", color: "green" }}>{message}</p>}
              {error && <p style={{ marginTop: "12px", color: "red" }}>{error}</p>}

              {result && (
                <div style={{ marginTop: "14px", padding: "14px", borderRadius: "12px", background: "#FFF8FC" }}>
                  <p style={{ margin: "0 0 6px" }}><strong>Visitor:</strong> {result.visitor}</p>
                  <p style={{ margin: 0 }}><strong>Expo:</strong> {result.expo}</p>
                </div>
              )}
            </form>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid #eee",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Recent Scan History</h3>

              {scanHistory.length === 0 && <p>No scans recorded yet.</p>}

              {scanHistory.slice(0, 8).map((scan, index) => (
                <div
                  key={`${scan.ticket_code}-${index}`}
                  style={{
                    padding: "12px 0",
                    borderBottom: index === scanHistory.slice(0, 8).length - 1 ? "none" : "1px solid #f1e4ec",
                  }}
                >
                  <div style={{ fontWeight: "700", color: "#3D0040" }}>{scan.visitor}</div>
                  <div style={{ fontSize: "13px", color: "#7B2D5E" }}>{scan.ticket_code}</div>
                  <div style={{ fontSize: "13px", color: "#9B6B80" }}>
                    {scan.gate} • {new Date(scan.time).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

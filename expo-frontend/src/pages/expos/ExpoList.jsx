import { useEffect, useState } from "react"

import api from "../../api/axios"
import ThemeExpoCard from "../../components/common/ThemeExpoCard"

export default function ExpoList(){
  const [expos, setExpos] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("expos/list/")
      .then(({ data }) => setExpos(data))
      .catch(() => setError("Unable to load active expos"))
  }, [])

  if (error) return <p>{error}</p>

  return (
    <div style={{ padding: "10px" }}>
      <h1>Active Expos</h1>
      {expos.length === 0 && <p>No active expos found.</p>}
      {expos.map((expo) => (
        <ThemeExpoCard key={expo.id} expo={expo} />
      ))}
    </div>
  )
}
